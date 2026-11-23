import type { Template } from "../domain/template.js";

export interface TemplateCatalogPort {
  list(query?: string, limit?: number): Promise<Template[]>;
  get(id: string): Promise<Template | null>;
}
