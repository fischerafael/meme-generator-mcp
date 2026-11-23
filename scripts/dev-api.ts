/**
 * Local stand-in for Vercel Functions: serves the same /api handlers on :3000 so `npm run dev`
 * works without the Vercel CLI. Production uses the files in /api directly.
 */
import { createServer } from "node:http";
import * as mcp from "../api/mcp.js";
import * as memes from "../api/memes.js";
import * as templateById from "../api/templates/[id].js";
import * as templates from "../api/templates/index.js";
import * as token from "../api/token.js";

type Mod = Partial<Record<"GET" | "POST" | "DELETE", (req: Request) => Promise<Response>>>;

function route(pathname: string): Mod | undefined {
  if (pathname === "/api/mcp") return mcp;
  if (pathname === "/api/token") return token;
  if (pathname === "/api/memes") return memes;
  if (pathname === "/api/templates") return templates;
  if (/^\/api\/templates\/[^/]+$/.test(pathname)) return templateById;
  return undefined;
}

const port = Number(process.env.API_PORT ?? 3000);
createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const mod = route(url.pathname);
  const handler = mod?.[req.method as "GET" | "POST" | "DELETE"];
  if (!handler) {
    res.writeHead(mod ? 405 : 404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: { code: mod ? "METHOD_NOT_ALLOWED" : "NOT_FOUND", message: "Not found." } }));
    return;
  }
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers.set(k, v);
  const response = await handler(
    new Request(url, { method: req.method, headers, body: chunks.length ? Buffer.concat(chunks) : undefined }),
  );
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
}).listen(port, () => console.log(`[dev-api] http://localhost:${port}/api`));
