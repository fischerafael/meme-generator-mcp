import { MemeRequestSchema } from "../../../../shared/schemas.js";
import type { Container } from "../../../composition-root.js";
import { credsFromRequest } from "./auth.js";
import { json, toErrorResponse } from "./errors.js";
import { parse, readJson } from "./validation.js";

export function createMemesHandler(deps: () => Pick<Container, "cipher" | "generateMeme">) {
  return async (req: Request): Promise<Response> => {
    try {
      const { cipher, generateMeme } = deps();
      const creds = credsFromRequest(req, cipher);
      const body = parse(MemeRequestSchema, await readJson(req));
      return json(await generateMeme.execute(body, creds), 200, { "cache-control": "no-store" });
    } catch (e) {
      return toErrorResponse(e);
    }
  };
}
