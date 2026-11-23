import { useMutation } from "@tanstack/react-query";
import { TokenResponseSchema, type ImgflipCreds } from "../../../../shared/schemas";
import { api } from "@/lib/apiClient";

export function useIssueToken() {
  return useMutation({
    mutationFn: (creds: ImgflipCreds) => api("/api/token", { method: "POST", body: creds, schema: TokenResponseSchema }),
  });
}
