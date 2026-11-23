import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { Section } from "../components/Section";
import { ToolTable } from "../components/ToolTable";

export function HowItWorksPage() {
  return (
    <article className="flex max-w-3xl flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">How it works</h1>
        <p className="text-muted-foreground">What happens between “make me a meme” and the image.</p>
      </header>

      <Section title="1. Your token">
        <p>
          Memes are rendered by Imgflip under your own free account. When you generate a token, the server makes one
          real Imgflip call to check your login, then encrypts it with AES-256-GCM into a token that starts with{" "}
          <code>mg_v1_</code>.
        </p>
        <p>
          There is no database and no user account. The token is the only place your login exists, and only the server
          can decrypt it. Tokens are never logged. Changing a single character makes it invalid.
        </p>
      </Section>

      <Section title="2. Connecting an assistant">
        <p>
          The app is a standard MCP server over Streamable HTTP at <code>/api/mcp</code>. Any client that supports
          remote MCP servers with a Bearer token can use it: Claude (web and desktop), ChatGPT connectors, Cursor, VS
          Code, and others.
        </p>
        <p>
          Add a custom connector with the URL and send the token as <code>Authorization: Bearer &lt;token&gt;</code>.
          The exact menu depends on the client; in Claude it is Settings → Connectors → Add custom connector.
        </p>
      </Section>

      <Section title="3. Picking the template">
        <p>
          Every template in the catalog is annotated: what each text box means (<code>boxes[].role</code>), when to use
          it, tags and an example. The assistant describes the joke's shape (“everyone blamed X but it was Y”) and{" "}
          <code>suggest_templates</code> returns the best fits.
        </p>
        <p>
          Before generating, it reads the box roles, so in Scooby-Doo's mask reveal the real culprit goes in box 3, not
          box 1.
        </p>
      </Section>

      <Section title="4. Rendering">
        <p>
          <code>generate_meme</code> sends the texts to Imgflip and returns the image URL plus the image itself, so the
          assistant can look at the result and shorten text that doesn't fit.
        </p>
        <ToolTable />
      </Section>

      <Section title="Open source">
        <p>
          The whole thing is {site.license}-licensed. Read the code, self-host it on Vercel with a single environment
          variable, or open a pull request with new templates.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/setup">Get your token</Link>
          </Button>
          <Button asChild variant="outline">
            <a href={site.repoUrl} target="_blank" rel="noreferrer">
              View on GitHub
            </a>
          </Button>
        </div>
      </Section>
    </article>
  );
}
