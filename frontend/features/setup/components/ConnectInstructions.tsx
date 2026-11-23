import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyField } from "./CopyField";

interface Props {
  mcpUrl: string;
  token: string | null;
  onCopy: (value: string, label: string) => void;
  onForget: () => void;
}

export function ConnectInstructions({ mcpUrl, token, onCopy, onForget }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>2 · Connect your assistant</CardTitle>
        <CardDescription>Any MCP client that supports remote servers with a Bearer token: Claude, ChatGPT, Cursor, VS Code…</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <CopyField id="mcp-url" label="MCP server URL" value={mcpUrl} onCopy={(v) => onCopy(v, "URL copied")} />
        {token ? (
          <CopyField id="token" label="Bearer token" value={token} mask onCopy={(v) => onCopy(v, "Token copied")} />
        ) : (
          <p className="rounded-md border border-dashed px-3 py-2.5 text-sm text-muted-foreground">
            Your token will appear here after step 1.
          </p>
        )}
        <ol className="grid list-decimal gap-1.5 pl-5 text-sm text-muted-foreground">
          <li>Open your assistant's connector settings (in Claude: Settings → Connectors → Add custom connector).</li>
          <li>Paste the MCP server URL above.</li>
          <li>Paste the token as the Bearer token (<code className="font-mono text-xs">Authorization</code> header).</li>
          <li>
            Ask: <em>“Make a Scooby-Doo mask reveal meme: everyone blamed the database, it was the N+1 queries.”</em>
          </li>
        </ol>
        {token && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
            <span>The token is saved in this browser so the Playground can use it.</span>
            <Button variant="ghost" size="sm" onClick={onForget}>
              Forget token
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
