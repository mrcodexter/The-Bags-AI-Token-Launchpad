import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy for Bags API to keep API key hidden
  const BAGS_API_BASE = "https://public-api-v2.bags.fm/api/v1";
  const BAGS_API_KEY = process.env.BAGS_API_KEY;

  app.all(["/api/bags", "/api/bags/*"], async (req, res) => {
    // Get the path after /api/bags
    const fullPath = req.path;
    const endpoint = fullPath.replace(/^\/api\/bags\/?/, "").replace(/^\//, "");
    const url = `${BAGS_API_BASE}/${endpoint}`;

    // Mock handlers for advanced features not yet in the public API
    if (endpoint.startsWith('manage/') || endpoint.startsWith('analytics/')) {
      return res.json({ 
        success: true, 
        message: 'Action simulated (Mock)',
        data: {
          timestamp: new Date().toISOString(),
          status: 'completed',
          endpoint: endpoint
        }
      });
    }

    if (!BAGS_API_KEY) {
      console.warn("BAGS_API_KEY is missing. API calls to public-api-v2.bags.fm will likely fail.");
    }
    
    try {
      if (endpoint) {
        console.log(`Proxying ${req.method} to: ${url}`);
      } else {
        console.log(`Bags API Root requested, returning mock info`);
        return res.json({ status: "ok", message: "Bags API Proxy is running" });
      }

      const response = await axios({
        method: req.method,
        url,
        data: req.body,
        params: req.query,
        headers: {
          "x-api-key": BAGS_API_KEY || "",
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        timeout: 10000,
        validateStatus: () => true, // Handle all status codes
      });

      // If the upstream returned HTML (like a 404 or maintenance page), normalize it to JSON
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.error(`Bags API returned HTML for ${url} (Status: ${response.status})`);
        return res.status(response.status || 500).json({ 
          error: "Upstream API Error", 
          message: "The Bags API returned an HTML error page. This usually means the endpoint is invalid or the service is undergoing maintenance.",
          status: response.status,
          endpoint
        });
      }

      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error("Bags API Proxy Exception:", error.message);
      res.status(500).json({ error: "Internal Proxy Error", message: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
