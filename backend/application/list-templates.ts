import type { Template } from "../domain/template.js";
import type { TemplateCatalogPort } from "../ports/template-catalog.port.js";

export const DEFAULT_LIMIT = 30;
export const MAX_LIMIT = 100;

export class ListTemplates {
  constructor(private readonly catalog: TemplateCatalogPort) {}

  execute(input: { query?: string; limit?: number } = {}): Promise<Template[]> {
    const limit = Math.min(Math.max(1, Math.floor(input.limit ?? DEFAULT_LIMIT)), MAX_LIMIT);
    const query = input.query?.trim() || undefined;
    return this.catalog.list(query, limit);
  }
}
