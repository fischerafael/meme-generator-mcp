import { Link } from "react-router";
import { SearchInput } from "../components/SearchInput";
import { TemplateGrid } from "../components/TemplateGrid";
import { TemplateCard } from "../components/TemplateCard";
import { useTemplates } from "../api/queries";
import { useSearchQueryParam } from "../hooks/useSearchQueryParam";

export function TemplatesContainer() {
  const { input, setInput, query } = useSearchQueryParam();
  const templates = useTemplates(query);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">Every template documents what each box means, so Claude fills them in the right order.</p>
      </header>
      <SearchInput value={input} onChange={setInput} />
      <TemplateGrid
        items={templates.data}
        loading={templates.isLoading}
        error={templates.error?.message}
        renderItem={(t) => <TemplateCard key={t.id} template={t} href={`/playground/${t.id}`} LinkComponent={Link} />}
      />
    </div>
  );
}
