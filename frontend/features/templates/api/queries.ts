import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { TemplateListResponseSchema, TemplateSchema } from "../../../../shared/schemas";
import { api } from "@/lib/apiClient";

const HOUR = 60 * 60 * 1000;

export function useTemplates(q: string) {
  return useQuery({
    queryKey: ["templates", q],
    queryFn: ({ signal }) => {
      const params = new URLSearchParams({ limit: "100" });
      if (q) params.set("q", q);
      return api(`/api/templates?${params}`, { schema: TemplateListResponseSchema, signal });
    },
    staleTime: HOUR,
    placeholderData: keepPreviousData,
    select: (d) => d.items,
  });
}

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ["template", id],
    queryFn: ({ signal }) => api(`/api/templates/${encodeURIComponent(id!)}`, { schema: TemplateSchema, signal }),
    enabled: !!id,
    staleTime: HOUR,
  });
}
