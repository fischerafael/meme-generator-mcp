import { TemplateNotFoundError } from "../domain/errors.js";
import { assertTextsFit, type ImgflipCreds, type Meme, type MemeRequest } from "../domain/meme.js";
import type { MemeRendererPort } from "../ports/meme-renderer.port.js";
import type { TemplateCatalogPort } from "../ports/template-catalog.port.js";

export class GenerateMeme {
  constructor(
    private readonly catalog: TemplateCatalogPort,
    private readonly renderer: MemeRendererPort,
  ) {}

  async execute(req: MemeRequest, creds: ImgflipCreds): Promise<Meme> {
    const template = await this.catalog.get(req.templateId);
    if (!template) throw new TemplateNotFoundError(req.templateId);
    assertTextsFit(template, req.texts);
    return this.renderer.render({ ...req, templateId: template.id }, creds);
  }
}
