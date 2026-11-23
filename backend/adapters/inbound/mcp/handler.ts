import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { Container } from "../../../composition-root.js";
import { DomainError } from "../../../domain/errors.js";
import type { ImgflipCreds } from "../../../domain/meme.js";
import { credsFromRequest } from "../http/auth.js";
import { errorResponse } from "../http/errors.js";
import { buildMcpServer } from "./server.js";

/**
 * /api/mcp — Streamable HTTP, stateless. Authenticates the Bearer token (401 + WWW-Authenticate on failure)
 * and serves each request with a brand-new server + transport. The token is never logged or echoed.
 */
export function createMcpHandler(deps: () => Container) {
  return async (req: Request): Promise<Response> => {
    try {
      const c = deps();
      let creds: ImgflipCreds;
      try {
        creds = credsFromRequest(req, c.cipher);
      } catch (e) {
        if (e instanceof DomainError && e.code === "UNAUTHORIZED") return errorResponse("UNAUTHORIZED", e.message);
        throw e;
      }

      const server = buildMcpServer(c, creds);
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });
      await server.connect(transport);
      return await transport.handleRequest(req);
    } catch (e) {
      console.error(`[mcp] unexpected error: ${e instanceof Error ? e.name : typeof e}`);
      return errorResponse("INTERNAL", "Internal error.");
    }
  };
}
