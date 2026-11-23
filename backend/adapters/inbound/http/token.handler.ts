import { ImgflipCredsSchema } from "../../../../shared/schemas.js";
import type { Container } from "../../../composition-root.js";
import { json, toErrorResponse } from "./errors.js";
import { parse, readJson } from "./validation.js";

export function createTokenHandler(deps: () => Pick<Container, "issueToken">) {
  return async (req: Request): Promise<Response> => {
    try {
      const creds = parse(ImgflipCredsSchema, await readJson(req));
      return json(await deps().issueToken.execute(creds), 200, { "cache-control": "no-store" });
    } catch (e) {
      return toErrorResponse(e);
    }
  };
}
