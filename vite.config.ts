import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

/* Site institucional do Seja Seu Guia. Porta 5211 (o app do protótipo usa a 5210).
   No dev, /api vai para a API Hono (pnpm dev:api, porta 8787); em produção o
   mesmo servidor serve site e API. */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  server: { port: 5211, strictPort: false, proxy: { "/api": `http://localhost:${process.env.API_PORTA ?? 8787}` } },
});
