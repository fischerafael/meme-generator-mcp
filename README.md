# meme-generator-mcp

A web app + MCP server that lets Claude generate memes through the [Imgflip](https://imgflip.com) API.

- **No accounts, no database.** You turn your Imgflip username and password into an encrypted token (AES-256-GCM). The server decrypts it on each request and forgets it.
- **MCP connector.** Paste the token as the Bearer token when adding the connector in Claude (web or desktop).
- **Playground.** Generate memes directly in the browser. The URL keeps the template and texts, so links are shareable.
- **Role-labeled templates.** Every template says what each text box means (`boxes[].role`), so the LLM puts the right text in the right place.

## Generate a token

1. Create a free account at [imgflip.com](https://imgflip.com/signup).
2. Open `/setup`, enter your Imgflip username and password, and press **Generate token**.
   The server makes one real Imgflip call to check the credentials, then returns `mg_v1_…`.

## Add the connector in Claude

1. In Claude: **Settings → Connectors → Add custom connector**.
2. URL: `https://<your-deployment>/api/mcp`
3. Authentication: Bearer token → paste the `mg_v1_…` token.
4. Ask for a meme, e.g. *"Make a Scooby-Doo mask reveal meme: everyone blamed the database, it was the N+1 queries."*

### Tools

| Tool | Input | Output |
|---|---|---|
| `list_templates` | `{ query?, limit? }` | templates with `boxes[].role`, `usage`, `example` |
| `get_template` | `{ id }` | one template |
| `generate_meme` | `{ templateId, texts[] }` | `{ url, pageUrl }` |

## HTTP API

| Method | Route | Auth | Body / Query |
|---|---|---|---|
| POST | `/api/token` | — | `{ username, password }` → `{ token }` |
| GET | `/api/templates` | — | `?q=&limit=` → `{ items }` |
| GET | `/api/templates/:id` | — | → `Template` |
| POST | `/api/memes` | Bearer | `{ templateId, texts[] }` → `{ url, pageUrl, templateId }` |
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
