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
  tags: string[];
  example?: string[];
  previewUrl: string;
}

export interface TemplateSummary {
  id: string;
  name: string;
  boxCount: number;
  usage: string;
  tags: string[];
}

export function summarize(t: Template): TemplateSummary {
  return { id: t.id, name: t.name, boxCount: t.boxCount, usage: t.usage, tags: t.tags };
}

const STOPWORDS = new Set(
  "a an the and or but of to in on at for with by from about as is are was were be been it its this that these those i me my we you your they them their he she his her who what when where which how than then so not no do does did just very really something someone thing things".split(
    " ",
  ),
);

const tokenize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

/** Loose match: exact word, or a shared stem of 5+ chars (compare/comparison, choose/choosing…). */
function wordMatches(word: string, candidates: string[]): boolean {
  const stem = word.length >= 5 ? word.slice(0, 5) : null;
  return candidates.some((c) => c === word || (word.length >= 3 && c.startsWith(word)) || (stem !== null && c.startsWith(stem)));
}

/**
 * Relevance of a template for a free-text query or situation description.
 * Tags and name weigh the most, then usage, then box roles. 0 = unrelated.
 */
export function scoreTemplate(t: Template, query: string): number {
  const words = tokenize(query).filter((w) => !STOPWORDS.has(w));
  if (words.length === 0) return 0;
  const name = tokenize(t.name);
  const tags = t.tags.flatMap(tokenize);
  const usage = tokenize(t.usage);
  const roles = t.boxes.flatMap((b) => tokenize(b.role));
  let score = 0;
  for (const w of words) {
    if (wordMatches(w, tags)) score += 3;
    if (wordMatches(w, name)) score += 3;
    if (wordMatches(w, usage)) score += 2;
    if (wordMatches(w, roles)) score += 1;
  }
  return score;
}

/** Templates ranked by relevance; ties keep catalog (popularity) order. */
export function rankTemplates(templates: Template[], query: string): Template[] {
  return templates
    .map((t, i) => ({ t, i, s: scoreTemplate(t, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.t);
}
