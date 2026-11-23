import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useCopy } from "@/lib/useCopy";
import { TokenForm } from "../components/TokenForm";
import { ConnectInstructions } from "../components/ConnectInstructions";
import { useIssueToken } from "../api/useIssueToken";

export function SetupContainer() {
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const clear = useAuthStore((s) => s.clear);
  const issue = useIssueToken();
  const copy = useCopy();
  const mcpUrl = `${window.location.origin}/api/mcp`;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Setup</h1>
        <p className="text-muted-foreground">Two steps and Claude can make memes.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <TokenForm
          pending={issue.isPending}
          error={issue.error?.message}
          onSubmit={(creds) =>
            issue.mutate(creds, {
              onSuccess: ({ token }) => {
                setToken(token);
                toast.success("Token generated. Copy it into Claude.");
              },
            })
          }
        />
        <ConnectInstructions mcpUrl={mcpUrl} token={token} onCopy={copy} onForget={clear} />
      </div>
    </div>
  );
}
