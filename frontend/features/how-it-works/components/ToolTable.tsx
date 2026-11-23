const tools = [
  { name: "suggest_templates", input: "{ situation, limit? }", desc: "Best templates for the shape of a joke." },
  { name: "list_templates", input: "{ query?, limit? }", desc: "Compact, ranked catalog listing." },
  { name: "get_template", input: "{ id }", desc: "Box roles, usage, tags and an example." },
  { name: "generate_meme", input: "{ templateId, texts, font?, maxFontSize? }", desc: "Renders the meme; returns URL and image." },
];

export function ToolTable() {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/40 text-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">Tool</th>
            <th className="px-4 py-2.5 font-medium">Input</th>
            <th className="px-4 py-2.5 font-medium">What it does</th>
          </tr>
        </thead>
        <tbody>
          {tools.map((t) => (
            <tr key={t.name} className="border-b last:border-0">
              <td className="px-4 py-2.5 font-mono text-xs text-foreground">{t.name}</td>
              <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap">{t.input}</td>
              <td className="px-4 py-2.5">{t.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
