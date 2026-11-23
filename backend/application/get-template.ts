import { TemplateNotFoundError } from "../domain/errors.js";
import type { Template } from "../domain/template.js";
import type { TemplateCatalogPort } from "../ports/template-catalog.port.js";

export class GetTemplate {
  constructor(private readonly catalog: TemplateCatalogPort) {}

  async execute(id: string): Promise<Template> {
    const template = await this.catalog.get(id);
    if (!template) throw new TemplateNotFoundError(id);
    return template;
  }
}
