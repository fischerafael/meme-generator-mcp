import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Container } from "../../../composition-root.js";
import { DomainError } from "../../../domain/errors.js";
import type { ImgflipCreds } from "../../../domain/meme.js";
import { summarize } from "../../../domain/template.js";

type Deps = Pick<Container, "listTemplates" | "getTemplate" | "generateMeme" | "suggestTemplates" | "getMemeImage">;

export const SERVER_INSTRUCTIONS = `Meme generator backed by Imgflip.

Workflow:
1. Find a template: call suggest_templates with a one-line description of the joke's SHAPE (e.g. "comparing a strong past with a weak present", "the real cause was something else", "a choice between two bad options"), or list_templates / list_templates with a query.
2. Call get_template and read boxes[].role: each box has a fixed meaning and position.
3. Call generate_meme with texts[i] for box i+1, in order. Show the user the image URL.

Writing good meme text:
- Pick the template for the structure of the joke, not for the topic.
- Keep each box short: 2–8 words. No hashtags, no emojis, no quotes around the text.
- Follow each role literally (e.g. in "Scooby doo mask reveal", box 3 is the REAL culprit).
- Use an empty string for boxes the role says to usually leave empty.
- Write in the user's language unless the template's fixed phrase is iconic in English.
- After generating, look at the returned image; if text is cut off or unreadable, shorten it and try again.`;

const json = (data: unknown) => ({
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
  const server = new McpServer({ name: "meme-generator", version: "1.1.0" }, { instructions: SERVER_INSTRUCTIONS });

  server.registerTool(
    "suggest_templates",
    {
      title: "Suggest meme templates",
      description:
        "Recommend the best templates for a joke. Describe the situation or the joke's structure in plain words " +
        "(e.g. 'choosing between two bad options', 'everyone blamed X but it was Y'). " +
        "Returns full templates (boxes[].role, usage, tags, example), best match first.",
      inputSchema: {
        situation: z.string().min(1).max(300).describe("The situation or joke structure to illustrate."),
        limit: z.number().int().min(1).max(10).optional().describe("How many suggestions (default 5)."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ situation, limit }) => {
      try {
        return json({ items: await deps.suggestTemplates.execute({ situation, limit }) });
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    "list_templates",
    {
      title: "List meme templates",
      description:
        "Browse or search the template catalog. Returns a compact list (id, name, boxCount, usage, tags), " +
        "ranked by relevance when a query is given. Call get_template for the box roles before generating.",
      inputSchema: {
        query: z.string().max(100).optional().describe("Keywords matched against name, tags, usage and box roles."),
        limit: z.number().int().min(1).max(100).optional().describe("Max results (default 30)."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, limit }) => {
      try {
        return json({ items: (await deps.listTemplates.execute({ query, limit })).map(summarize) });
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    "get_template",
    {
      title: "Get a meme template",
      description:
        "Get one template with boxes[].role (what each text box means, in order), usage, tags, example and previewUrl. " +
        "Always call this before generate_meme.",
      inputSchema: { id: z.string().min(1).describe("Template id.") },
      annotations: { readOnlyHint: true },
    },
    async ({ id }) => {
      try {
        return json(await deps.getTemplate.execute(id));
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
        "Render a meme with Imgflip. Returns the image URL, the Imgflip page URL and the image itself. " +
        "Call get_template first and read boxes[].role. texts[i] goes into box i, in order. " +
        "Keep each text short (2–8 words); never send more texts than the template's boxCount.",
      inputSchema: {
        templateId: z.string().min(1).describe("Template id."),
        texts: z.array(z.string().max(500)).min(1).max(20).describe("One text per box, in box order. Use '' to leave a box empty."),
        font: z.enum(["impact", "arial"]).optional().describe("impact (classic meme look, default) or arial (better for long text)."),
        maxFontSize: z.number().int().min(10).max(100).optional().describe("Max font size in px (default 50). Lower it for long text."),
      },
    },
    async ({ templateId, texts, font, maxFontSize }) => {
      try {
        const meme = await deps.generateMeme.execute({ templateId, texts, font, maxFontSize }, creds);
        const result = { url: meme.url, pageUrl: meme.pageUrl };
        const image = await deps.getMemeImage.execute(meme);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
            ...(image ? [{ type: "image" as const, data: image.data, mimeType: image.mimeType }] : []),
          ],
          structuredContent: result,
        };
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerPrompt(
    "make_meme",
    {
      title: "Make a meme",
      description: "Turn a topic or situation into a meme: pick the template, fill each box, render it.",
      argsSchema: { topic: z.string().describe("What the meme should be about.") },
    },
    ({ topic }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Make a meme about: ${topic}\n\n` +
              "1. Call suggest_templates with the shape of the joke and pick the best fit.\n" +
              "2. Call get_template and follow boxes[].role exactly.\n" +
              "3. Call generate_meme with short texts, then show me the image and say which template you used and why.",
          },
        },
      ],
    }),
  );

  return server;
}
