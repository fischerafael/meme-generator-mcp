import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useCopy } from "@/lib/useCopy";
import { useTemplate, useTemplates } from "@/features/templates/api/queries";
import { useDebouncedValue } from "@/features/templates/hooks/useDebouncedValue";
import { ApiClientError } from "@/lib/apiClient";
import { TemplatePicker } from "../components/TemplatePicker";
import { BoxInputs } from "../components/BoxInputs";
import { MemePreview } from "../components/MemePreview";
import { NoTokenBanner } from "../components/NoTokenBanner";
import { useGenerateMeme } from "../api/useGenerateMeme";
import { usePlaygroundUrlState } from "../hooks/usePlaygroundUrlState";

export function PlaygroundContainer() {
  const token = useAuthStore((s) => s.token);
  const clearToken = useAuthStore((s) => s.clear);
  const { templateId, texts, setTexts, selectTemplate } = usePlaygroundUrlState();
  const [pickerQuery, setPickerQuery] = useState("");
  const templates = useTemplates(useDebouncedValue(pickerQuery.trim(), 250));
  const template = useTemplate(templateId);
  const generate = useGenerateMeme();
  const copy = useCopy();

  // A new template or new texts make the previous result stale.
  const { reset } = generate;
  useEffect(() => reset(), [templateId, reset]);

  useEffect(() => {
    if (generate.error instanceof ApiClientError && generate.error.code === "UNAUTHORIZED") clearToken();
  }, [generate.error, clearToken]);

  const trimmed = texts.slice(0, template.data?.boxCount ?? 0);
  const canSubmit = !!token && trimmed.some((t) => t.trim() !== "");

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Playground</h1>
        <p className="text-muted-foreground">Pick a template, fill each box, generate. The URL keeps your work.</p>
      </header>

      {!token && <NoTokenBanner />}

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside>
          <TemplatePicker
            items={templates.data}
            loading={templates.isLoading}
            selectedId={templateId}
            query={pickerQuery}
            onQueryChange={setPickerQuery}
            onSelect={selectTemplate}
          />
        </aside>

        <section className="min-w-0">
          {!templateId ? (
            <div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Choose a template to start.
            </div>
          ) : template.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading template…</p>
          ) : template.error || !template.data ? (
            <p className="text-sm text-destructive">{template.error?.message ?? "Template not found."}</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{template.data.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{template.data.usage}</p>
                </div>
                <BoxInputs
                  template={template.data}
                  texts={texts}
                  onChange={setTexts}
                  onFillExample={() => setTexts(template.data.example ?? [])}
                  pending={generate.isPending}
                  canSubmit={canSubmit}
                  onSubmit={() => generate.mutate({ templateId: template.data.id, texts: trimmed })}
                />
              </div>
              <MemePreview
                template={template.data}
                meme={generate.data}
                pending={generate.isPending}
                error={generate.error?.message}
                onCopyImageUrl={(url) => copy(url, "Image URL copied")}
                onCopyLink={() => copy(window.location.href, "Link copied")}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
