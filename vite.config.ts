import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
<<<<<<< HEAD
=======
    proxy: {
      // API principal - RO e-Factura (mai stabil)
      '/api/anaf/efactura': {
        target: 'https://webservicesp.anaf.ro',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anaf\/efactura/, '/api/registruroefactura/v1/interogare'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('ANAF RO e-Factura proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to RO e-Factura:', req.method, req.url);
            // Ensure proper headers for ANAF API
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Accept', 'application/json');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from RO e-Factura:', proxyRes.statusCode, req.url);
          });
        },
      },
      // API backup - TVA (în caz că primul nu funcționează)
      '/api/anaf/tva': {
        target: 'https://webservicesp.anaf.ro',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anaf\/tva/, '/PlatitorTvaRest/api/v7/ws/tva'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('ANAF TVA proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to TVA (backup):', req.method, req.url);
            // Ensure proper headers for ANAF API
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Accept', 'application/json');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from TVA (backup):', proxyRes.statusCode, req.url);
          });
        },
      }
    }
>>>>>>> a89382dac9c985abfc81276cff3029fd57d4938a
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
