import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useDebouncedValue } from "./useDebouncedValue";

/** Input value bound to `?q=`, written back debounced. The URL stays the source of truth on reload. */
export function useSearchQueryParam() {
  const [params, setParams] = useSearchParams();
  const urlQ = params.get("q") ?? "";
  const [input, setInput] = useState(urlQ);
  const debounced = useDebouncedValue(input.trim(), 300);

  useEffect(() => {
    if (debounced === urlQ) return;
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debounced) next.set("q", debounced);
        else next.delete("q");
        return next;
      },
      { replace: true },
    );
  }, [debounced, urlQ, setParams]);

  return { input, setInput, query: urlQ };
}
