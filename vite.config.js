import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://100.114.75.113/SparkPoint/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false,
        cookieDomainRewrite: "localhost",
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes, req, res) => {
            // Rewrite Set-Cookie headers to use localhost domain
            const setCookie = proxyRes.headers["set-cookie"];
            if (setCookie) {
              proxyRes.headers["set-cookie"] = setCookie.map((cookie) => {
                return cookie
                  .replace(/Domain=([^;]+)/i, "Domain=localhost")
                  .replace(/SameSite=Lax/i, "SameSite=None; Secure")
                  .replace(/SameSite=Strict/i, "SameSite=None; Secure");
              });
            }
          });
        },
      },
    },
  },
});
