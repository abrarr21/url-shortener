import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/shorten": "http://localhost:80",
      "/stats": "http://localhost:80",
      "/ws": {
        target: "http://localhost:80",
        ws: true,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            // Ignore normal client-side socket disconnects
            if (
              err.message.includes("EPIPE") ||
              err.message.includes("ECONNRESET")
            ) {
              return;
            }
            console.error("[vite ws proxy error]", err);
          });
        },
      },
    },
  },
});
