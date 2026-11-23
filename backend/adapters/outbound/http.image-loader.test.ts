import { describe, expect, it, vi } from "vitest";
import { HttpImageLoader } from "./http.image-loader.js";

const okFetch = vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/jpeg" } }));

describe("HttpImageLoader", () => {
  it("loads Imgflip images as base64", async () => {
    const img = await new HttpImageLoader(okFetch as unknown as typeof fetch).load("https://i.imgflip.com/abc.jpg");
    expect(img).toEqual({ data: "AQID", mimeType: "image/jpeg" });
  });

  it("refuses other hosts (no SSRF)", async () => {
    const f = vi.fn();
    const loader = new HttpImageLoader(f as unknown as typeof fetch);
    for (const url of ["http://i.imgflip.com/a.jpg", "https://evil.com/a.jpg", "https://169.254.169.254/", "nope"]) {
      expect(await loader.load(url)).toBeNull();
    }
    expect(f).not.toHaveBeenCalled();
  });

  it("returns null on non-images and failures", async () => {
    const html = vi.fn(async () => new Response("<html>", { headers: { "content-type": "text/html" } }));
    expect(await new HttpImageLoader(html as unknown as typeof fetch).load("https://i.imgflip.com/a.jpg")).toBeNull();
    const boom = vi.fn(async () => Promise.reject(new Error("x")));
    expect(await new HttpImageLoader(boom as unknown as typeof fetch).load("https://i.imgflip.com/a.jpg")).toBeNull();
  });
});
