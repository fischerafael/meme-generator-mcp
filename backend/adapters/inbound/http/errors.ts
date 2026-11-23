import type { ErrorCode } from "../../../../shared/schemas.js";
import { DomainError } from "../../../domain/errors.js";

export const AUTH_CHALLENGE = 'Bearer realm="meme-generator"';

const STATUS: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  VALIDATION: 400,
  TEMPLATE_NOT_FOUND: 404,
  INVALID_IMGFLIP_CREDENTIALS: 400,
  RENDER_FAILED: 502,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL: 500,
};

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

export function errorResponse(code: ErrorCode, message: string, headers: Record<string, string> = {}): Response {
  const extra = code === "UNAUTHORIZED" ? { "www-authenticate": AUTH_CHALLENGE, ...headers } : headers;
  return json({ error: { code, message } }, STATUS[code], extra);
}

/** Maps any thrown value to an HTTP response. Logs only the error class, never request data. */
export function toErrorResponse(e: unknown): Response {
  if (e instanceof DomainError) return errorResponse(e.code, e.message);
  console.error(`[http] unexpected error: ${e instanceof Error ? e.name : typeof e}`);
  return errorResponse("INTERNAL", "Internal error.");
}
