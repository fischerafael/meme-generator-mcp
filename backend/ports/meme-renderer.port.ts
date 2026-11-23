import type { ImgflipCreds, Meme, MemeRequest } from "../domain/meme.js";

export interface MemeRendererPort {
  /** Throws InvalidImgflipCredentialsError or RenderFailedError. */
  render(req: MemeRequest, creds: ImgflipCreds): Promise<Meme>;
}
