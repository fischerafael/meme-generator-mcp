import { useMutation } from "@tanstack/react-query";
import { MemeSchema, type MemeRequest } from "../../../../shared/schemas";
import { api } from "@/lib/apiClient";

export function useGenerateMeme() {
  return useMutation({
    mutationFn: (req: MemeRequest) => api("/api/memes", { method: "POST", body: req, auth: true, schema: MemeSchema }),
  });
}
