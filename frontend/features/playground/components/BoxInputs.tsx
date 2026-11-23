import { Loader2, Wand2 } from "lucide-react";
import type { Template } from "../../../../shared/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  template: Template;
  texts: string[];
  onChange: (texts: string[]) => void;
  onSubmit: () => void;
  onFillExample?: () => void;
  pending: boolean;
  canSubmit: boolean;
}

export function BoxInputs({ template, texts, onChange, onSubmit, onFillExample, pending, canSubmit }: Props) {
  const update = (i: number, value: string) => {
    const next = Array.from({ length: template.boxCount }, (_, j) => texts[j] ?? "");
    next[i] = value;
    onChange(next);
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {template.boxes.map((box, i) => (
        <div key={box.index} className="grid gap-2">
          <Label htmlFor={`box-${box.index}`} className="leading-snug">
            <span className="text-muted-foreground tabular-nums">{box.index} ·</span> {box.role}
          </Label>
          <Input
            id={`box-${box.index}`}
            value={texts[i] ?? ""}
            onChange={(e) => update(i, e.target.value)}
            placeholder={template.example?.[i] || undefined}
            maxLength={500}
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending || !canSubmit}>
          {pending ? <Loader2 className="animate-spin" /> : <Wand2 />}
          {pending ? "Generating…" : "Generate meme"}
        </Button>
        {onFillExample && template.example && (
          <Button type="button" variant="ghost" onClick={onFillExample}>
            Use example
          </Button>
        )}
      </div>
    </form>
  );
}
