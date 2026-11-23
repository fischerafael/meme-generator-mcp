import { UnauthorizedError } from "../../../domain/errors.js";
import type { ImgflipCreds } from "../../../domain/meme.js";
import type { TokenCipherPort } from "../../../ports/token-cipher.port.js";

const BEARER = /^Bearer\s+(\S+)\s*$/i;

/** Bearer header -> Imgflip creds. Throws UnauthorizedError; the token is never logged or echoed. */
export function credsFromRequest(req: Request, cipher: TokenCipherPort): ImgflipCreds {
  const token = BEARER.exec(req.headers.get("authorization") ?? "")?.[1];
  if (!token) throw new UnauthorizedError();
  return cipher.open(token);
}
