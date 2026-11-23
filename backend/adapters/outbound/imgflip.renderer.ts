import { InvalidImgflipCredentialsError, RenderFailedError } from "../../domain/errors.js";
import type { ImgflipCreds, Meme, MemeRequest } from "../../domain/meme.js";
import type { MemeRendererPort } from "../../ports/meme-renderer.port.js";

type CaptionImageResponse =
  | { success: true; data: { url: string; page_url: string } }
  | { success: false; error_message: string };

const CREDENTIAL_ERROR = /username|password|login|account/i;

/** Ported from meme-poc/src/imgflip.ts. Never logs the credentials. */
export class ImgflipRenderer implements MemeRendererPort {
  constructor(
    private readonly fetchFn: typeof fetch = fetch,
    private readonly endpoint = "https://api.imgflip.com/caption_image",
  ) {}

  async render(req: MemeRequest, creds: ImgflipCreds): Promise<Meme> {
    const params = new URLSearchParams();
    params.set("template_id", req.templateId);
    params.set("username", creds.username);
    params.set("password", creds.password);
    if (req.font) params.set("font", req.font);
    if (req.maxFontSize) params.set("max_font_size", String(req.maxFontSize));
    req.texts.forEach((text, i) => params.set(`boxes[${i}][text]`, text));

    let body: CaptionImageResponse;
    try {
      const res = await this.fetchFn(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
        signal: AbortSignal.timeout(15_000),
      });
      body = (await res.json()) as CaptionImageResponse;
    } catch {
      throw new RenderFailedError("Imgflip is unreachable right now.");
    }

    if (!body.success) {
      const msg = body.error_message || "Unknown Imgflip error.";
      if (CREDENTIAL_ERROR.test(msg)) throw new InvalidImgflipCredentialsError(`Imgflip: ${msg}`);
      throw new RenderFailedError(`Imgflip: ${msg}`);
    }
    return { url: body.data.url, pageUrl: body.data.page_url, templateId: req.templateId };
  }
}
