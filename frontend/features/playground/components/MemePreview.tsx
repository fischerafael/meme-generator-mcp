import { Copy, ExternalLink, Link2 } from "lucide-react";
import type { Meme, Template } from "../../../../shared/schemas";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  template: Template;
  meme?: Meme;
  pending: boolean;
  error?: string;
  onCopyImageUrl: (url: string) => void;
  onCopyLink: () => void;
}

export function MemePreview({ template, meme, pending, error, onCopyImageUrl, onCopyLink }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-muted/40">
        {pending ? (
          <Skeleton className="absolute inset-0 rounded-none" />
        ) : (
          <img
            src={meme?.url ?? template.previewUrl}
            alt={meme ? `Generated ${template.name} meme` : `${template.name} template`}
            className="h-full w-full object-contain"
          />
        )}
        {!meme && !pending && (
          <span className="absolute top-2 left-2 rounded-md bg-background/80 px-2 py-0.5 text-xs text-muted-foreground backdrop-blur">
            Template preview
          </span>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {meme && (
          <>
            <Button variant="outline" size="sm" onClick={() => onCopyImageUrl(meme.url)}>
              <Copy /> Copy image URL
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={meme.pageUrl} target="_blank" rel="noreferrer">
                <ExternalLink /> Open on Imgflip
              </a>
            </Button>
          </>
        )}
        <Button variant="ghost" size="sm" onClick={onCopyLink}>
          <Link2 /> Copy link
        </Button>
      </div>
    </div>
  );
}
