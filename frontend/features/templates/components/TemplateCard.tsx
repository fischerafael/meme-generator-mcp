import type { Template } from "../../../../shared/schemas";
import { Badge } from "@/components/ui/badge";

interface Props {
  template: Template;
  href: string;
  LinkComponent: React.ComponentType<{ to: string; className?: string; children: React.ReactNode }>;
}

export function TemplateCard({ template, href, LinkComponent }: Props) {
  return (
    <LinkComponent
      to={href}
      className="group flex flex-col overflow-hidden rounded-xl border transition-colors hover:border-foreground/30 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-muted/40">
        <img
          src={template.previewUrl}
          alt={template.name}
          loading="lazy"
          className="h-full w-full object-contain transition-transform group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm leading-snug font-medium">{template.name}</h3>
          <Badge variant="secondary">{template.boxCount} boxes</Badge>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">{template.usage}</p>
      </div>
    </LinkComponent>
  );
}
