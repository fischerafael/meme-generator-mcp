import { ApiErrorSchema, type ErrorCode } from "../../shared/schemas";
import { useAuthStore } from "@/stores/authStore";
import type { z } from "zod";

export class ApiClientError extends Error {
  constructor(
    readonly code: ErrorCode | "NETWORK",
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface RequestOptions<T extends z.ZodType> {
  method?: "GET" | "POST";
  body?: unknown;
  auth?: boolean;
  schema: T;
  signal?: AbortSignal;
}

/** Single HTTP entry point: injects the Bearer token from the store and maps API errors. */
export async function api<T extends z.ZodType>(path: string, opts: RequestOptions<T>): Promise<z.infer<T>> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (opts.body !== undefined) headers["content-type"] = "application/json";
  if (opts.auth) {
    const token = useAuthStore.getState().token;
    if (token) headers.authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(path, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      signal: opts.signal,
    });
  } catch {
    throw new ApiClientError("NETWORK", "Network error. Check your connection.", 0);
  }

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const parsed = ApiErrorSchema.safeParse(data);
    if (parsed.success) throw new ApiClientError(parsed.data.error.code, parsed.data.error.message, res.status);
    throw new ApiClientError("INTERNAL", `Request failed (${res.status}).`, res.status);
  }
  return opts.schema.parse(data);
}
