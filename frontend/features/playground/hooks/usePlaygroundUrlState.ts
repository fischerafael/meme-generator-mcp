import { useCallback, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { decodeTexts, encodeTexts } from "./textsParam";

/** URL is the source of truth: /playground/:templateId?t=<texts>. Reloading restores everything. */
export function usePlaygroundUrlState() {
  const { templateId } = useParams<{ templateId?: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const raw = params.get("t");
  const texts = useMemo(() => decodeTexts(raw), [raw]);

  const setTexts = useCallback(
    (next: string[]) => {
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          if (next.some((t) => t !== "")) p.set("t", encodeTexts(next));
          else p.delete("t");
          return p;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const selectTemplate = useCallback((id: string) => navigate(`/playground/${encodeURIComponent(id)}`), [navigate]);

  return { templateId, texts, setTexts, selectTemplate };
}
