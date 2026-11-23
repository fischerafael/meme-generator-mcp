import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="flex flex-col items-start gap-6">
      <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">Open-source MCP server · Imgflip</span>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Give your AI assistant a meme generator.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground text-pretty">
        Connect any MCP-compatible assistant (Claude, ChatGPT, Cursor, VS Code and more) and ask for memes in plain
        language. It picks the right template, fills every box in the right order and hands you the image.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/setup">
            Get started <ArrowRight />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/how-it-works">How it works</Link>
        </Button>
      </div>
    </section>
  );
}
