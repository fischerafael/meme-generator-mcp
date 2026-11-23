import { Boxes, KeyRound, Link2, Sparkles } from "lucide-react";

const features = [
  { icon: Boxes, title: "170+ annotated templates", body: "Every box has a role, so the right text lands in the right place." },
  { icon: Sparkles, title: "Smart suggestions", body: "Describe the joke; the assistant gets the templates that fit its shape." },
  { icon: KeyRound, title: "No accounts", body: "Your Imgflip login lives only inside your encrypted token." },
  { icon: Link2, title: "Works everywhere", body: "Standard MCP over HTTP, plus a web playground with shareable links." },
];

export function Features() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {features.map(({ icon: Icon, title, body }) => (
        <div key={title} className="flex gap-3">
          <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
