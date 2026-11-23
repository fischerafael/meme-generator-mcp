import { TemplateListQuerySchema } from "../../../../shared/schemas.js";
import type { Container } from "../../../composition-root.js";
import { json, toErrorResponse } from "./errors.js";
import { parse } from "./validation.js";

const CACHE = { "cache-control": "public, max-age=300, s-maxage=3600" };

export function createListTemplatesHandler(deps: () => Pick<Container, "listTemplates">) {
  return async (req: Request): Promise<Response> => {
    try {
      const url = new URL(req.url);
      const { q, limit } = parse(TemplateListQuerySchema, {
        q: url.searchParams.get("q") ?? undefined,
        limit: url.searchParams.get("limit") ?? undefined,
      });
      return json({ items: await deps().listTemplates.execute({ query: q, limit }) }, 200, CACHE);
    } catch (e) {
      return toErrorResponse(e);
    }
  };
}

export function createGetTemplateHandler(deps: () => Pick<Container, "getTemplate">) {
  return async (req: Request): Promise<Response> => {
    try {
      const id = decodeURIComponent(new URL(req.url).pathname.split("/").filter(Boolean).pop() ?? "");
      return json(await deps().getTemplate.execute(id), 200, CACHE);
    } catch (e) {
      return toErrorResponse(e);
    }
  };
}
