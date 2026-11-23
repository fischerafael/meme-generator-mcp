import { Link } from "react-router";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NoTokenBanner() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-sm">
        <KeyRound className="size-4 shrink-0 text-muted-foreground" />
        <span>You need a token to generate memes. It takes 30 seconds.</span>
      </div>
      <Button asChild size="sm" variant="outline">
        <Link to="/setup">Generate token</Link>
      </Button>
    </div>
  );
}
