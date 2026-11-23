import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "frontend",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "frontend") } },
  build: { outDir: "../dist", emptyOutDir: true },
  server: {
    // `vercel dev` serves /api on :3000; proxy to it when running `vite` alone.
    proxy: { "/api": "http://localhost:3000" },
  },
});
