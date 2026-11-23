import type { ImageLoaderPort, LoadedImage } from "../../ports/image-loader.port.js";

const ALLOWED_HOSTS = new Set(["i.imgflip.com"]);
const MAX_BYTES = 2 * 1024 * 1024;

/** Downloads rendered memes so MCP clients can see the image. Only Imgflip's CDN, to avoid SSRF. */
export class HttpImageLoader implements ImageLoaderPort {
  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async load(url: string): Promise<LoadedImage | null> {
    try {
      const u = new URL(url);
      if (u.protocol !== "https:" || !ALLOWED_HOSTS.has(u.hostname)) return null;
      const res = await this.fetchFn(u, { signal: AbortSignal.timeout(8_000) });
      const mimeType = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
      if (!res.ok || !mimeType.startsWith("image/")) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > MAX_BYTES) return null;
      return { data: buf.toString("base64"), mimeType };
    } catch {
      return null;
    }
  }
}
