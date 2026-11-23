import { z } from "zod";

export const TemplateBoxSchema = z.object({
  index: z.number().int().min(1),
  role: z.string().min(1),
});

export const TemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  boxCount: z.number().int().min(1),
  boxes: z.array(TemplateBoxSchema).min(1),
  usage: z.string().min(1),
  example: z.array(z.string()).optional(),
  previewUrl: z.string().url(),
});
export type Template = z.infer<typeof TemplateSchema>;

export const TemplateListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
export type TemplateListQuery = z.infer<typeof TemplateListQuerySchema>;

export const TemplateListResponseSchema = z.object({ items: z.array(TemplateSchema) });
export type TemplateListResponse = z.infer<typeof TemplateListResponseSchema>;

export const MemeRequestSchema = z.object({
  templateId: z.string().min(1),
  texts: z.array(z.string().max(500)).min(1).max(20),
});
export type MemeRequest = z.infer<typeof MemeRequestSchema>;

export const MemeSchema = z.object({
  url: z.string().url(),
  pageUrl: z.string().url(),
  templateId: z.string(),
});
export type Meme = z.infer<typeof MemeSchema>;

export const ImgflipCredsSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(100),
  password: z.string().min(1, "Password is required").max(200),
});
export type ImgflipCreds = z.infer<typeof ImgflipCredsSchema>;

export const TokenResponseSchema = z.object({ token: z.string() });
export type TokenResponse = z.infer<typeof TokenResponseSchema>;

export const ErrorCodeSchema = z.enum([
  "UNAUTHORIZED",
  "VALIDATION",
  "TEMPLATE_NOT_FOUND",
  "INVALID_IMGFLIP_CREDENTIALS",
  "RENDER_FAILED",
  "NOT_FOUND",
  "METHOD_NOT_ALLOWED",
  "INTERNAL",
]);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ApiErrorSchema = z.object({
  error: z.object({ code: ErrorCodeSchema, message: z.string() }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
