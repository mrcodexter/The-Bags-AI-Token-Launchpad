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

  app.all("/api/bags/*", async (req, res) => {
    const endpoint = req.params[0];
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
    
    try {
      const response = await axios({
        method: req.method,
        url,
        data: req.body,
        params: req.query,
        headers: {
          "x-api-key": BAGS_API_KEY,
          "Content-Type": "application/json",
        },
      });
      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error("Bags API Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Internal Server Error" });
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
