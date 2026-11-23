import { InvalidImgflipCredentialsError } from "../domain/errors.js";
import type { ImgflipCreds, Meme, MemeRequest } from "../domain/meme.js";
import type { Template } from "../domain/template.js";
import type { MemeRendererPort } from "../ports/meme-renderer.port.js";
import type { TemplateCatalogPort } from "../ports/template-catalog.port.js";
import type { TokenCipherPort } from "../ports/token-cipher.port.js";

export const scooby: Template = {
  id: "145139900",
  name: "Scooby doo mask reveal",
  boxCount: 4,
  boxes: [
    { index: 1, role: "the mask: the fake/assumed culprit" },
    { index: 2, role: "Fred: 'let's see who you really are'" },
    { index: 3, role: "unmasked face: the REAL culprit" },
    { index: 4, role: "Fred's conclusion / punchline" },
  ],
  usage: "Reveal the real culprit.",
  previewUrl: "https://i.imgflip.com/2wifvo.jpg",
};
export const drake: Template = {
  id: "181913649",
  name: "Drake Hotline Bling",
  boxCount: 2,
  boxes: [
    { index: 1, role: "rejected" },
    { index: 2, role: "approved" },
  ],
  usage: "Prefer one option.",
  previewUrl: "https://i.imgflip.com/30b1gx.jpg",
};

export class FakeCatalog implements TemplateCatalogPort {
  constructor(private readonly items: Template[] = [scooby, drake]) {}
  async list(query?: string, limit?: number) {
    const r = query ? this.items.filter((t) => t.name.toLowerCase().includes(query.toLowerCase())) : this.items;
    return r.slice(0, limit);
  }
  async get(id: string) {
    return this.items.find((t) => t.id === id) ?? null;
  }
}

export class FakeRenderer implements MemeRendererPort {
  calls: { req: MemeRequest; creds: ImgflipCreds }[] = [];
  constructor(private readonly validPassword = "good") {}
  async render(req: MemeRequest, creds: ImgflipCreds): Promise<Meme> {
    this.calls.push({ req, creds });
    if (creds.password !== this.validPassword) throw new InvalidImgflipCredentialsError();
    return { url: `https://i.imgflip.com/${req.templateId}.jpg`, pageUrl: "https://imgflip.com/i/x", templateId: req.templateId };
  }
}

export class FakeCipher implements TokenCipherPort {
  seal(c: ImgflipCreds) {
    return `fake_${c.username}`;
  }
  open(t: string): ImgflipCreds {
    return { username: t.replace("fake_", ""), password: "good" };
  }
}
