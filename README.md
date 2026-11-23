# meme-generator-mcp

An open-source MCP server + web app that lets any AI assistant (Claude, ChatGPT, Cursor, VS Code…) generate memes through the [Imgflip](https://imgflip.com) API.

- **No accounts, no database.** You turn your Imgflip username and password into an encrypted token (AES-256-GCM). The server decrypts it on each request and forgets it.
- **MCP connector.** Paste the token as the Bearer token when adding the connector in your MCP client.
- **Playground.** Generate memes directly in the browser. The URL keeps the template and texts, so links are shareable.
- **82 role-labeled templates.** Every template says what each text box means (`boxes[].role`), when to use it, tags and an example, so the LLM puts the right text in the right place.

## Generate a token

1. Create a free account at [imgflip.com](https://imgflip.com/signup).
2. Open `/setup`, enter your Imgflip username and password, and press **Generate token**.
   The server makes one real Imgflip call to check the credentials, then returns `mg_v1_…`.

## Connect your assistant

Any MCP client that supports remote (Streamable HTTP) servers with a Bearer token works. In Claude:

1. In Claude: **Settings → Connectors → Add custom connector**.
2. URL: `https://<your-deployment>/api/mcp`
3. Authentication: Bearer token → paste the `mg_v1_…` token.
4. Ask for a meme, e.g. *"Make a Scooby-Doo mask reveal meme: everyone blamed the database, it was the N+1 queries."*

### Tools

| Tool | Input | Output |
|---|---|---|
| `suggest_templates` | `{ situation, limit? }` | best-fitting full templates for the joke's shape |
| `list_templates` | `{ query?, limit? }` | compact ranked list: `id, name, boxCount, usage, tags` |
| `get_template` | `{ id }` | one full template (`boxes[].role`, `usage`, `tags`, `example`) |
| `generate_meme` | `{ templateId, texts[], font?, maxFontSize? }` | `{ url, pageUrl }` + the image itself |

The server also sends workflow/style **instructions** on connect and exposes a **`make_meme` prompt**.

## HTTP API

| Method | Route | Auth | Body / Query |
|---|---|---|---|
| POST | `/api/token` | — | `{ username, password }` → `{ token }` |
| GET | `/api/templates` | — | `?q=&limit=` → `{ items }` |
| GET | `/api/templates/:id` | — | → `Template` |
| POST | `/api/memes` | Bearer | `{ templateId, texts[], font?, maxFontSize? }` → `{ url, pageUrl, templateId }` |
| POST/GET/DELETE | `/api/mcp` | Bearer | MCP (Streamable HTTP, stateless) |

Errors look like `{ "error": { "code", "message" } }`. Missing or invalid tokens get `401` with
`WWW-Authenticate: Bearer realm="meme-generator"`.

## Local development

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Put that value in `TOKEN_KEY` in `.env`, then:

```bash
npm run dev
```

This starts the API on `:3000` (`scripts/dev-api.ts`, the same `/api` handlers Vercel runs) and Vite on `:5173`, which proxies `/api`.

```bash
npm test
```

```bash
npm run build
```

## Deploy (Vercel)

Import the repo in Vercel and set the `TOKEN_KEY` environment variable. `vercel.json` builds the SPA into `dist/`, serves `/api/*` as functions (bundling `data/`), and falls back to `index.html` for client routes.

Rotating the key: add a new prefix/key pair to `AesGcmCipher` (e.g. `mg_v2_`) and make it current; v1 tokens keep working until you remove the old key.

## Architecture

```
api/          Vercel Functions: thin inbound adapters only
backend/
  domain/       entities and rules, no dependencies
  ports/        MemeRenderer, TemplateCatalog, TokenCipher
  application/  use cases (depend on ports only)
  adapters/     outbound: Imgflip, JSON catalog, AES-GCM; inbound: HTTP, MCP
  composition-root.ts   the only place that wires concrete adapters
frontend/     Vite + React + React Router + TanStack Query + zustand + shadcn/ui
shared/       zod schemas used by both sides
data/templates-catalog.json
```

Frontend never imports `backend/`; backend never imports `frontend/`. Tokens and passwords are never logged.

## Adding templates

Templates live in `data/templates-catalog.json`. Each needs the Imgflip `id`, `boxCount`, one `boxes[].role` per box (in Imgflip's box order), `usage`, `tags`, an `example` per box and `previewUrl`. `npm test` validates the file.

## License

[MIT](LICENSE) © [Rafael Fischer](https://www.fischerafael.com.br/)
