import { describe, expect, it } from "vitest";
import {
  InvalidImgflipCredentialsError,
  TemplateNotFoundError,
  ValidationError,
} from "../domain/errors.js";
import { FakeCatalog, FakeCipher, FakeRenderer, scooby } from "./fakes.js";
import { GenerateMeme } from "./generate-meme.js";
import { GetTemplate } from "./get-template.js";
import { IssueToken, PROBE_TEMPLATE_ID } from "./issue-token.js";
import { ListTemplates } from "./list-templates.js";

const creds = { username: "alice", password: "good" };

describe("ListTemplates", () => {
  it("lists and filters", async () => {
    const uc = new ListTemplates(new FakeCatalog());
    expect(await uc.execute()).toHaveLength(2);
    expect((await uc.execute({ query: "scooby" })).map((t) => t.id)).toEqual([scooby.id]);
    expect(await uc.execute({ limit: 1 })).toHaveLength(1);
  });
});

describe("GetTemplate", () => {
  it("returns a template or throws TemplateNotFound", async () => {
    const uc = new GetTemplate(new FakeCatalog());
    expect((await uc.execute(scooby.id)).boxes[2]!.role).toMatch(/REAL culprit/);
    await expect(uc.execute("nope")).rejects.toBeInstanceOf(TemplateNotFoundError);
  });
});

describe("GenerateMeme", () => {
  it("renders texts in box order", async () => {
    const renderer = new FakeRenderer();
    const uc = new GenerateMeme(new FakeCatalog(), renderer);
    const texts = ["Ghost", "Let's see", "Old man Jenkins", "Classic"];
    const meme = await uc.execute({ templateId: scooby.id, texts }, creds);
    expect(meme.templateId).toBe(scooby.id);
    expect(renderer.calls[0]!.req.texts).toEqual(texts);
  });

  it("rejects unknown templates and too many texts", async () => {
    const uc = new GenerateMeme(new FakeCatalog(), new FakeRenderer());
    await expect(uc.execute({ templateId: "x", texts: ["a"] }, creds)).rejects.toBeInstanceOf(TemplateNotFoundError);
    await expect(uc.execute({ templateId: scooby.id, texts: ["1", "2", "3", "4", "5"] }, creds)).rejects.toBeInstanceOf(
      ValidationError,
    );
    await expect(uc.execute({ templateId: scooby.id, texts: [" ", ""] }, creds)).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("IssueToken", () => {
  it("validates creds with one real render, then seals", async () => {
    const renderer = new FakeRenderer();
    const uc = new IssueToken(renderer, new FakeCipher());
    expect(await uc.execute(creds)).toEqual({ token: "fake_alice" });
    expect(renderer.calls).toHaveLength(1);
    expect(renderer.calls[0]!.req.templateId).toBe(PROBE_TEMPLATE_ID);
  });

  it("does not issue a token for bad creds", async () => {
    const uc = new IssueToken(new FakeRenderer(), new FakeCipher());
    await expect(uc.execute({ username: "a", password: "bad" })).rejects.toBeInstanceOf(InvalidImgflipCredentialsError);
  });
});
