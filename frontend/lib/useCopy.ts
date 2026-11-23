import { useCallback } from "react";
import { toast } from "sonner";

export function useCopy() {
  return useCallback(async (text: string, label = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label);
    } catch {
      toast.error("Could not copy. Select and copy it manually.");
    }
  }, []);
}
