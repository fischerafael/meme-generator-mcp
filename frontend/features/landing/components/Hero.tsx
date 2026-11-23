import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="flex flex-col items-start gap-6">
      <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">MCP connector · Imgflip</span>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Let Claude make memes for you.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground text-pretty">
        Generate an encrypted token from your Imgflip account, add it as a connector in Claude, and ask for memes in
        plain English. No accounts, no database.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/setup">
            Generate token <ArrowRight />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/templates">Browse templates</Link>
        </Button>
      </div>
    </section>
  );
}
