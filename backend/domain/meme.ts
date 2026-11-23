import { ValidationError } from "./errors.js";
import type { Template } from "./template.js";

export type MemeFont = "impact" | "arial";

export interface MemeRequest {
  templateId: string;
  texts: string[];
  /** Imgflip font. Defaults to impact. */
  font?: MemeFont;
  /** Max font size in px; Imgflip shrinks text to fit up to this size. */
  maxFontSize?: number;
}

export interface Meme {
  url: string;
  pageUrl: string;
  templateId: string;
}

export interface ImgflipCreds {
  username: string;
  password: string;
}

/** texts[i] goes into box i+1; there can't be more texts than boxes. */
export function assertTextsFit(template: Template, texts: string[]): void {
  if (texts.length === 0) throw new ValidationError("At least one text is required.");
  if (texts.length > template.boxCount) {
    throw new ValidationError(
      `Template "${template.name}" has ${template.boxCount} boxes but ${texts.length} texts were given.`,
    );
  }
  if (texts.every((t) => t.trim() === "")) throw new ValidationError("All texts are empty.");
}
