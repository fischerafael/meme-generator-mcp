export interface TemplateBox {
  index: number;
  /** Semantic role of the box: tells the LLM what text belongs here. */
  role: string;
}

export interface Template {
  id: string;
  name: string;
  boxCount: number;
  boxes: TemplateBox[];
  usage: string;
  example?: string[];
  previewUrl: string;
}

export function matchesQuery(t: Template, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [t.name, t.usage, ...t.boxes.map((b) => b.role)].join(" ").toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}
