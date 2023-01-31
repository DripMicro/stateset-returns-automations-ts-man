// vite.config.ts
import { defineConfig } from "file:///D:/work/Shopify/shopify-cli-typescript/web/frontend/node_modules/vite/dist/node/index.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import react from "file:///D:/work/Shopify/shopify-cli-typescript/web/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
var __vite_injected_original_import_meta_url = "file:///D:/work/Shopify/shopify-cli-typescript/web/frontend/vite.config.ts";
if (process.env.npm_lifecycle_event === "build" && !process.env.CI && !process.env.SHOPIFY_API_KEY) {
  console.warn(
    "\nBuilding the frontend app without an API key. The frontend build will not run without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command.\n"
  );
}
var proxyOptions = {
  target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
  changeOrigin: false,
  secure: true,
  ws: false
};
var host = process.env.HOST ? process.env.HOST.replace(/https?:\/\//, "") : "localhost";
var hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host,
    port: process.env.FRONTEND_PORT,
    clientPort: 443
  };
}
var vite_config_default = defineConfig({
  root: dirname(fileURLToPath(__vite_injected_original_import_meta_url)),
  plugins: [react()],
  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(
      process.env.SHOPIFY_API_KEY
    )
  },
  resolve: {
    preserveSymlinks: true
  },
  server: {
    host: "localhost",
    port: Number(process.env.FRONTEND_PORT),
    hmr: hmrConfig,
    proxy: {
      "^/(\\?.*)?$": proxyOptions,
      "^/api(/|(\\?.*)?$)": proxyOptions
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3b3JrXFxcXFNob3BpZnlcXFxcc2hvcGlmeS1jbGktdHlwZXNjcmlwdFxcXFx3ZWJcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHdvcmtcXFxcU2hvcGlmeVxcXFxzaG9waWZ5LWNsaS10eXBlc2NyaXB0XFxcXHdlYlxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovd29yay9TaG9waWZ5L3Nob3BpZnktY2xpLXR5cGVzY3JpcHQvd2ViL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcbmltcG9ydCBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuXG5pZiAoXG4gICAgcHJvY2Vzcy5lbnYubnBtX2xpZmVjeWNsZV9ldmVudCA9PT0gJ2J1aWxkJyAmJlxuICAgICFwcm9jZXNzLmVudi5DSSAmJlxuICAgICFwcm9jZXNzLmVudi5TSE9QSUZZX0FQSV9LRVlcbikge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgJ1xcbkJ1aWxkaW5nIHRoZSBmcm9udGVuZCBhcHAgd2l0aG91dCBhbiBBUEkga2V5LiBUaGUgZnJvbnRlbmQgYnVpbGQgd2lsbCBub3QgcnVuIHdpdGhvdXQgYW4gQVBJIGtleS4gU2V0IHRoZSBTSE9QSUZZX0FQSV9LRVkgZW52aXJvbm1lbnQgdmFyaWFibGUgd2hlbiBydW5uaW5nIHRoZSBidWlsZCBjb21tYW5kLlxcbidcbiAgICApO1xufVxuXG5jb25zdCBwcm94eU9wdGlvbnMgPSB7XG4gICAgdGFyZ2V0OiBgaHR0cDovLzEyNy4wLjAuMToke3Byb2Nlc3MuZW52LkJBQ0tFTkRfUE9SVH1gLFxuICAgIGNoYW5nZU9yaWdpbjogZmFsc2UsXG4gICAgc2VjdXJlOiB0cnVlLFxuICAgIHdzOiBmYWxzZVxufTtcblxuY29uc3QgaG9zdCA9IHByb2Nlc3MuZW52LkhPU1RcbiAgICA/IHByb2Nlc3MuZW52LkhPU1QucmVwbGFjZSgvaHR0cHM/OlxcL1xcLy8sICcnKVxuICAgIDogJ2xvY2FsaG9zdCc7XG5cbmxldCBobXJDb25maWc7XG5pZiAoaG9zdCA9PT0gJ2xvY2FsaG9zdCcpIHtcbiAgICBobXJDb25maWcgPSB7XG4gICAgICAgIHByb3RvY29sOiAnd3MnLFxuICAgICAgICBob3N0OiAnbG9jYWxob3N0JyxcbiAgICAgICAgcG9ydDogNjQ5OTksXG4gICAgICAgIGNsaWVudFBvcnQ6IDY0OTk5XG4gICAgfTtcbn0gZWxzZSB7XG4gICAgaG1yQ29uZmlnID0ge1xuICAgICAgICBwcm90b2NvbDogJ3dzcycsXG4gICAgICAgIGhvc3Q6IGhvc3QsXG4gICAgICAgIHBvcnQ6IHByb2Nlc3MuZW52LkZST05URU5EX1BPUlQsXG4gICAgICAgIGNsaWVudFBvcnQ6IDQ0M1xuICAgIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gICAgcm9vdDogZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpLFxuICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgICBkZWZpbmU6IHtcbiAgICAgICAgJ3Byb2Nlc3MuZW52LlNIT1BJRllfQVBJX0tFWSc6IEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuU0hPUElGWV9BUElfS0VZXG4gICAgICAgIClcbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgICAgcHJlc2VydmVTeW1saW5rczogdHJ1ZVxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgICAgICBwb3J0OiBOdW1iZXIocHJvY2Vzcy5lbnYuRlJPTlRFTkRfUE9SVCksXG4gICAgICAgIGhtcjogaG1yQ29uZmlnLFxuICAgICAgICBwcm94eToge1xuICAgICAgICAgICAgJ14vKFxcXFw/LiopPyQnOiBwcm94eU9wdGlvbnMsXG4gICAgICAgICAgICAnXi9hcGkoL3woXFxcXD8uKik/JCknOiBwcm94eU9wdGlvbnNcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1VixTQUFTLG9CQUFvQjtBQUNwWCxTQUFTLGVBQWU7QUFDeEIsU0FBUyxxQkFBcUI7QUFFOUIsT0FBTyxXQUFXO0FBSnVNLElBQU0sMkNBQTJDO0FBTTFRLElBQ0ksUUFBUSxJQUFJLHdCQUF3QixXQUNwQyxDQUFDLFFBQVEsSUFBSSxNQUNiLENBQUMsUUFBUSxJQUFJLGlCQUNmO0FBQ0UsVUFBUTtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0o7QUFFQSxJQUFNLGVBQWU7QUFBQSxFQUNqQixRQUFRLG9CQUFvQixRQUFRLElBQUk7QUFBQSxFQUN4QyxjQUFjO0FBQUEsRUFDZCxRQUFRO0FBQUEsRUFDUixJQUFJO0FBQ1I7QUFFQSxJQUFNLE9BQU8sUUFBUSxJQUFJLE9BQ25CLFFBQVEsSUFBSSxLQUFLLFFBQVEsZUFBZSxFQUFFLElBQzFDO0FBRU4sSUFBSTtBQUNKLElBQUksU0FBUyxhQUFhO0FBQ3RCLGNBQVk7QUFBQSxJQUNSLFVBQVU7QUFBQSxJQUNWLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxFQUNoQjtBQUNKLE9BQU87QUFDSCxjQUFZO0FBQUEsSUFDUixVQUFVO0FBQUEsSUFDVjtBQUFBLElBQ0EsTUFBTSxRQUFRLElBQUk7QUFBQSxJQUNsQixZQUFZO0FBQUEsRUFDaEI7QUFDSjtBQUVBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLE1BQU0sUUFBUSxjQUFjLHdDQUFlLENBQUM7QUFBQSxFQUM1QyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsUUFBUTtBQUFBLElBQ0osK0JBQStCLEtBQUs7QUFBQSxNQUNoQyxRQUFRLElBQUk7QUFBQSxJQUNoQjtBQUFBLEVBQ0o7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLGtCQUFrQjtBQUFBLEVBQ3RCO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixNQUFNLE9BQU8sUUFBUSxJQUFJLGFBQWE7QUFBQSxJQUN0QyxLQUFLO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxlQUFlO0FBQUEsTUFDZixzQkFBc0I7QUFBQSxJQUMxQjtBQUFBLEVBQ0o7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=