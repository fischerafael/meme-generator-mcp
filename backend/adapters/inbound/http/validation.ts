import type { z } from "zod";
import { ValidationError } from "../../../domain/errors.js";

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ValidationError("Body must be valid JSON.");
  }
}

export function parse<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(".")}: ` : "";
    throw new ValidationError(`${where}${issue?.message ?? "Invalid input."}`);
  }
  return result.data;
}
