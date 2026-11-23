import type { Template } from "../../../../shared/schemas";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
  items: Template[] | undefined;
  loading: boolean;
  selectedId?: string;
  query: string;
  onQueryChange: (q: string) => void;
  onSelect: (id: string) => void;
}

export function TemplatePicker({ items, loading, selectedId, query, onQueryChange, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <Input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Find a template"
        aria-label="Find a template"
      />
      <div className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[28rem] lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:pb-0">
        {loading && !items
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-14 w-40 shrink-0 lg:w-full" />)
          : items?.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect(t.id)}
                aria-pressed={t.id === selectedId}
                className={cn(
                  "flex w-48 shrink-0 items-center gap-3 rounded-lg border p-2 text-left text-sm transition-colors hover:bg-accent lg:w-full",
                  t.id === selectedId && "border-foreground/40 bg-accent",
                )}
              >
                <img src={t.previewUrl} alt="" loading="lazy" className="size-10 shrink-0 rounded-md object-cover" />
                <span className="line-clamp-2 leading-snug">{t.name}</span>
              </button>
            ))}
        {items?.length === 0 && <p className="text-sm text-muted-foreground">No matches.</p>}
      </div>
    </div>
  );
}
