import { readFileSync } from "node:fs";
import path from "node:path";
import { TemplateSchema } from "../../../shared/schemas.js";
import { rankTemplates, type Template } from "../../domain/template.js";
import type { TemplateCatalogPort } from "../../ports/template-catalog.port.js";

export const DEFAULT_CATALOG_PATH = path.join(process.cwd(), "data", "templates-catalog.json");

export class JsonCatalog implements TemplateCatalogPort {
  private readonly templates: Template[];

  constructor(source: string | Template[] = DEFAULT_CATALOG_PATH) {
    const raw: unknown = typeof source === "string" ? JSON.parse(readFileSync(source, "utf8")) : source;
    this.templates = TemplateSchema.array().parse(raw);
  }

  async list(query?: string, limit?: number): Promise<Template[]> {
    const items = query ? rankTemplates(this.templates, query) : this.templates;
    return limit ? items.slice(0, limit) : items;
  }

  async get(id: string): Promise<Template | null> {
    return this.templates.find((t) => t.id === id) ?? null;
  }
}
