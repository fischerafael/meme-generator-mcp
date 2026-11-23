import { ValidationError } from "../domain/errors.js";
import type { Template } from "../domain/template.js";
import type { TemplateCatalogPort } from "../ports/template-catalog.port.js";

/** Given a description of the joke/situation, return the best-fitting templates. */
export class SuggestTemplates {
  constructor(private readonly catalog: TemplateCatalogPort) {}

  async execute(input: { situation: string; limit?: number }): Promise<Template[]> {
    const situation = input.situation.trim();
    if (!situation) throw new ValidationError("Describe the situation or joke.");
    const limit = Math.min(Math.max(1, Math.floor(input.limit ?? 5)), 10);
    const ranked = await this.catalog.list(situation, limit);
    // Nothing matched: fall back to the most popular templates so the caller always gets options.
    return ranked.length > 0 ? ranked : this.catalog.list(undefined, limit);
  }
}
