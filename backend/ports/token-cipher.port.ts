import type { ImgflipCreds } from "../domain/meme.js";

export interface TokenCipherPort {
  seal(creds: ImgflipCreds): string;
  /** Throws UnauthorizedError on missing, malformed, tampered or unknown-version tokens. */
  open(token: string): ImgflipCreds;
}
