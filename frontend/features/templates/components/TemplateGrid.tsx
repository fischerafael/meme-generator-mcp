import type { ReactNode } from "react";
import type { Template } from "../../../../shared/schemas";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  items: Template[] | undefined;
  loading: boolean;
  error?: string;
  emptyText?: string;
  renderItem: (t: Template) => ReactNode;
}

export function TemplateGrid({ items, loading, error, emptyText = "No templates match your search.", renderItem }: Props) {
  if (error) return <p className="py-10 text-center text-sm text-destructive">{error}</p>;
  if (loading && !items) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    );
  }
  if (!items?.length) return <p className="py-10 text-center text-sm text-muted-foreground">{emptyText}</p>;
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{items.map(renderItem)}</div>;
}
