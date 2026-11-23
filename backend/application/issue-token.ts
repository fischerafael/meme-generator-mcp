import { InvalidImgflipCredentialsError, RenderFailedError } from "../domain/errors.js";
import type { ImgflipCreds } from "../domain/meme.js";
import type { MemeRendererPort } from "../ports/meme-renderer.port.js";
import type { TokenCipherPort } from "../ports/token-cipher.port.js";

/** Drake Hotline Bling: used for the one real call that proves the credentials work. */
export const PROBE_TEMPLATE_ID = "181913649";

export class IssueToken {
  constructor(
    private readonly renderer: MemeRendererPort,
    private readonly cipher: TokenCipherPort,
  ) {}

  async execute(creds: ImgflipCreds): Promise<{ token: string }> {
    try {
      await this.renderer.render(
        { templateId: PROBE_TEMPLATE_ID, texts: ["Pasting my password into an MCP", "Pasting an encrypted token"] },
        creds,
      );
    } catch (e) {
      if (e instanceof InvalidImgflipCredentialsError) throw e;
      if (e instanceof RenderFailedError) throw e;
      throw new RenderFailedError("Could not reach Imgflip to validate the credentials.");
    }
    return { token: this.cipher.seal(creds) };
  }
}
