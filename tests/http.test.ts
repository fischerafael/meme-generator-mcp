import { randomBytes } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemesHandler } from "../backend/adapters/inbound/http/memes.handler.js";
import { createGetTemplateHandler, createListTemplatesHandler } from "../backend/adapters/inbound/http/templates.handler.js";
import { createTokenHandler } from "../backend/adapters/inbound/http/token.handler.js";
import { createMcpHandler } from "../backend/adapters/inbound/mcp/handler.js";
import { AesGcmCipher } from "../backend/adapters/outbound/aesgcm.cipher.js";
import { FakeCatalog, FakeRenderer, scooby } from "../backend/application/fakes.js";
import { GenerateMeme } from "../backend/application/generate-meme.js";
import { GetTemplate } from "../backend/application/get-template.js";
import { IssueToken } from "../backend/application/issue-token.js";
import { ListTemplates } from "../backend/application/list-templates.js";
import type { Container } from "../backend/composition-root.js";

function makeContainer(): Container & { renderer: FakeRenderer } {
  const catalog = new FakeCatalog();
  const renderer = new FakeRenderer();
  const cipher = new AesGcmCipher({ mg_v1_: randomBytes(32) }, "mg_v1_");
  return {
    renderer,
    cipher,
    listTemplates: new ListTemplates(catalog),
    getTemplate: new GetTemplate(catalog),
    generateMeme: new GenerateMeme(catalog, renderer),
    issueToken: new IssueToken(renderer, cipher),
  };
}

const post = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });

const SECRET = "hunter2-very-secret";

describe("HTTP adapters", () => {
  const logs: string[] = [];
  const spies = (["log", "error", "warn", "info"] as const).map((m) =>
    vi.spyOn(console, m).mockImplementation((...a: unknown[]) => void logs.push(a.map(String).join(" "))),
  );
  afterEach(() => {
    // Acceptance: no log line contains a token or a password.
    for (const l of logs) expect(l).not.toMatch(/mg_v1_|hunter2/);
  });

  it("issues a token and uses it to generate a meme", async () => {
    const c = makeContainer();
    const tokenRes = await createTokenHandler(() => c)(post("http://x/api/token", { username: "a", password: "good" }));
    expect(tokenRes.status).toBe(200);
    const { token } = (await tokenRes.json()) as { token: string };

    const res = await createMemesHandler(() => c)(
      post("http://x/api/memes", { templateId: scooby.id, texts: ["a", "b", "c", "d"] }, { authorization: `Bearer ${token}` }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ templateId: scooby.id });
  });

  it("maps bad creds to 400 INVALID_IMGFLIP_CREDENTIALS", async () => {
    const c = makeContainer();
    const res = await createTokenHandler(() => c)(post("http://x/api/token", { username: "a", password: SECRET }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: { code: "INVALID_IMGFLIP_CREDENTIALS", message: expect.any(String) } });
  });

  it("/api/memes without or with a tampered token returns 401 + WWW-Authenticate", async () => {
    const c = makeContainer();
    const handler = createMemesHandler(() => c);
    const body = { templateId: scooby.id, texts: ["a"] };
    const token = c.cipher.seal({ username: "a", password: "good" });
    const tampered = token.slice(0, -2) + (token.endsWith("AA") ? "BB" : "AA");
    for (const headers of [{}, { authorization: "Bearer nope" }, { authorization: `Bearer ${tampered}` }]) {
      const res = await handler(post("http://x/api/memes", body, headers));
      expect(res.status).toBe(401);
      expect(res.headers.get("www-authenticate")).toBe('Bearer realm="meme-generator"');
    }
  });

  it("validates bodies and maps unknown templates to 404", async () => {
    const c = makeContainer();
    const auth = { authorization: `Bearer ${c.cipher.seal({ username: "a", password: "good" })}` };
    const handler = createMemesHandler(() => c);
    expect((await handler(post("http://x/api/memes", { templateId: "" }, auth))).status).toBe(400);
    expect((await handler(post("http://x/api/memes", { templateId: "zzz", texts: ["a"] }, auth))).status).toBe(404);
  });

  it("lists and gets templates", async () => {
    const c = makeContainer();
    const list = await createListTemplatesHandler(() => c)(new Request("http://x/api/templates?q=scooby&limit=5"));
    expect(((await list.json()) as { items: unknown[] }).items).toHaveLength(1);
    const one = await createGetTemplateHandler(() => c)(new Request(`http://x/api/templates/${scooby.id}`));
    expect(one.status).toBe(200);
    expect((await createGetTemplateHandler(() => c)(new Request("http://x/api/templates/nope"))).status).toBe(404);
    expect((await createListTemplatesHandler(() => c)(new Request("http://x/api/templates?limit=abc"))).status).toBe(400);
  });

  it("/api/mcp rejects missing token with 401 and serves tools with a valid one", async () => {
    const c = makeContainer();
    const handler = createMcpHandler(() => c);
    const rpc = (body: unknown, headers: Record<string, string> = {}) =>
      post("http://x/api/mcp", body, { accept: "application/json, text/event-stream", ...headers });

    const noAuth = await handler(rpc({ jsonrpc: "2.0", id: 1, method: "tools/list" }));
    expect(noAuth.status).toBe(401);
    expect(noAuth.headers.get("www-authenticate")).toContain("Bearer");

    const auth = { authorization: `Bearer ${c.cipher.seal({ username: "a", password: "good" })}` };
    const init = await handler(
      rpc(
        {
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "1" } },
        },
        auth,
      ),
    );
    expect(init.status).toBe(200);

    const list = await handler(rpc({ jsonrpc: "2.0", id: 2, method: "tools/list" }, auth));
    const tools = ((await list.json()) as { result: { tools: { name: string; description: string }[] } }).result.tools;
    expect(tools.map((t) => t.name).sort()).toEqual(["generate_meme", "get_template", "list_templates"]);
    expect(tools.find((t) => t.name === "generate_meme")!.description).toContain(
      "Call get_template first and read boxes[].role. texts[i] goes into box i, in order.",
    );

    const call = await handler(
      rpc(
        {
          jsonrpc: "2.0",
          id: 3,
          method: "tools/call",
          params: { name: "generate_meme", arguments: { templateId: scooby.id, texts: ["Ghost", "Let's see", "Jenkins", "Ha"] } },
        },
        auth,
      ),
    );
    const result = ((await call.json()) as { result: { structuredContent: { url: string } } }).result;
    expect(result.structuredContent.url).toContain(scooby.id);
    expect(c.renderer.calls[0]!.req.texts[2]).toBe("Jenkins");
  });

  void spies;
});
