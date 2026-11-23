import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Container } from "../../../composition-root.js";
import { DomainError } from "../../../domain/errors.js";
import type { ImgflipCreds } from "../../../domain/meme.js";

type Deps = Pick<Container, "listTemplates" | "getTemplate" | "generateMeme">;

const ok = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  structuredContent: data as Record<string, unknown>,
});

const fail = (e: unknown) => {
  const message = e instanceof DomainError ? `${e.code}: ${e.message}` : "INTERNAL: Unexpected error.";
  if (!(e instanceof DomainError)) console.error(`[mcp] unexpected error: ${e instanceof Error ? e.name : typeof e}`);
  return { content: [{ type: "text" as const, text: message }], isError: true };
};

/** A fresh server per request (stateless). `creds` come from the caller's Bearer token. */
export function buildMcpServer(deps: Deps, creds: ImgflipCreds): McpServer {
  const server = new McpServer({ name: "meme-generator", version: "1.0.0" });

  server.registerTool(
    "list_templates",
    {
      title: "List meme templates",
      description:
        "Search the meme template catalog. Each template includes boxes[].role (what each text box means), " +
        "usage (when to use it) and example (sample text per box). Use it to pick the template that best fits the joke.",
      inputSchema: {
        query: z.string().max(100).optional().describe("Free-text search over name, usage and box roles."),
        limit: z.number().int().min(1).max(100).optional().describe("Max results (default 30)."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, limit }) => {
      try {
        return ok({ items: await deps.listTemplates.execute({ query, limit }) });
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    "get_template",
    {
      title: "Get a meme template",
      description: "Get one template with its boxes[].role, usage and example. Call this before generate_meme.",
      inputSchema: { id: z.string().min(1).describe("Template id from list_templates.") },
      annotations: { readOnlyHint: true },
    },
    async ({ id }) => {
      try {
        return ok(await deps.getTemplate.execute(id));
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    "generate_meme",
    {
      title: "Generate a meme",
      description:
        "Render a meme with Imgflip and return its image URL. " +
        "Call get_template first and read boxes[].role. texts[i] goes into box i, in order. " +
        "Keep each text short (a few words); do not send more texts than the template's boxCount.",
      inputSchema: {
        templateId: z.string().min(1).describe("Template id."),
        texts: z.array(z.string().max(500)).min(1).max(20).describe("One text per box, in box order."),
      },
    },
    async ({ templateId, texts }) => {
      try {
        const meme = await deps.generateMeme.execute({ templateId, texts }, creds);
        return ok({ url: meme.url, pageUrl: meme.pageUrl });
      } catch (e) {
        return fail(e);
      }
    },
  );

  return server;
}
