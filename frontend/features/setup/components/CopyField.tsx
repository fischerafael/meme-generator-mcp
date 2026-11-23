import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  id: string;
  label: string;
  value: string;
  onCopy: (value: string) => void;
  mask?: boolean;
}

export function CopyField({ id, label, value, onCopy, mask }: Props) {
  const shown = mask ? `${value.slice(0, 12)}${"•".repeat(16)}${value.slice(-4)}` : value;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <code id={id} className="flex-1 truncate rounded-md border bg-muted/50 px-3 py-2 font-mono text-xs leading-5">
          {shown}
        </code>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" size="icon" onClick={() => onCopy(value)} aria-label={`Copy ${label}`}>
              <Copy />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
