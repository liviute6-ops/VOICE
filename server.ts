import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy routes to Maziao API to avoid CORS issues
  app.get("/api/proxy/voices", async (req, res) => {
    const { limit = 100, offset = 0, search = "", language = "", gender = "", tags = "" } = req.query;
    const targetUrl = `https://app.maziao.com/api/voices?limit=${limit}&offset=${offset}&search=${search}&language=${language}&gender=${gender}&tags=${tags}`;
    try {
      const authHeader = req.headers.authorization;
      console.log(`Proxying GET to ${targetUrl}`);
      if (authHeader) console.log(`Auth Header: ${authHeader.substring(0, 15)}... (Len: ${authHeader.length})`);
      
      const response = await fetch(targetUrl, {
        headers: { 
          Authorization: authHeader || "",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        console.error(`Proxy error (voices) from ${targetUrl} - Status: ${response.status} - Non-JSON response:`, text.substring(0, 200));
        res.status(response.status).json({ 
          message: `API returned non-JSON response (${response.status})`, 
          details: text.substring(0, 100),
          url: targetUrl
        });
      }
    } catch (error) {
      console.error(`Proxy error (voices) calling ${targetUrl}:`, error);
      res.status(500).json({ message: "Internal server error", error: String(error) });
    }
  });

  app.get("/api/proxy/models", async (req, res) => {
    const targetUrl = "https://app.maziao.com/api/tts/models";
    try {
      const authHeader = req.headers.authorization;
      console.log(`Proxying GET to ${targetUrl}`);
      if (authHeader) console.log(`Auth Header: ${authHeader.substring(0, 15)}... (Len: ${authHeader.length})`);
      
      const response = await fetch(targetUrl, {
        headers: { 
          Authorization: authHeader || "",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error(`Proxy error (models) calling ${targetUrl}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/proxy/me", async (req, res) => {
    const targetUrl = "https://app.maziao.com/api/auth/me";
    try {
      const authHeader = req.headers.authorization;
      console.log(`Proxying GET to ${targetUrl}`);
      if (authHeader) console.log(`Auth Header: ${authHeader.substring(0, 15)}... (Len: ${authHeader.length})`);
      
      const response = await fetch(targetUrl, {
        headers: { 
          Authorization: authHeader || "",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        console.error(`Proxy error (me) from ${targetUrl} - Status: ${response.status} - Non-JSON response:`, text.substring(0, 200));
        res.status(response.status).json({ 
          message: `API returned non-JSON response (${response.status})`, 
          details: text.substring(0, 100),
          url: targetUrl
        });
      }
    } catch (error) {
      console.error(`Proxy error (me) calling ${targetUrl}:`, error);
      res.status(500).json({ message: "Internal server error", error: String(error) });
    }
  });

  app.post("/api/proxy/tts/submit", async (req, res) => {
    const targetUrl = "https://app.maziao.com/api/tts/submit";
    try {
      const authHeader = req.headers.authorization;
      console.log(`Proxying POST to ${targetUrl}`);
      console.log("Request Body:", JSON.stringify(req.body, null, 2));
      if (authHeader) console.log(`Auth Header: ${authHeader.substring(0, 15)}... (Len: ${authHeader.length})`);
      
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: authHeader || "",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        body: JSON.stringify(req.body),
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        console.error(`Proxy error (tts submit) from ${targetUrl} - Status: ${response.status} - Non-JSON response:`, text.substring(0, 200));
        res.status(response.status).json({ 
          message: `API returned non-JSON response (${response.status})`, 
          details: text.substring(0, 100),
          url: targetUrl
        });
      }
    } catch (error) {
      console.error(`Proxy error (tts submit) calling ${targetUrl}:`, error);
      res.status(500).json({ message: "Internal server error", error: String(error) });
    }
  });

  app.post("/api/proxy/tts/status", async (req, res) => {
    const targetUrl = "https://app.maziao.com/api/tts/status";
    try {
      const authHeader = req.headers.authorization;
      console.log(`Proxying POST to ${targetUrl}`);
      if (authHeader) console.log(`Auth Header: ${authHeader.substring(0, 15)}... (Len: ${authHeader.length})`);
      
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: authHeader || "",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        body: JSON.stringify(req.body),
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        console.error(`Proxy error (tts status) from ${targetUrl} - Status: ${response.status} - Non-JSON response:`, text.substring(0, 200));
        res.status(response.status).json({ 
          message: `API returned non-JSON response (${response.status})`, 
          details: text.substring(0, 100),
          url: targetUrl
        });
      }
    } catch (error) {
      console.error(`Proxy error (tts status) calling ${targetUrl}:`, error);
      res.status(500).json({ message: "Internal server error", error: String(error) });
    }
  });

  app.get("/api/proxy/tts/list", async (req, res) => {
    const { limit = 50, offset = 0, type = "text" } = req.query;
    const targetUrl = `https://app.maziao.com/api/tts/list?limit=${limit}&offset=${offset}&type=${type}`;
    try {
      const authHeader = req.headers.authorization;
      console.log(`Proxying GET to ${targetUrl}`);
      const response = await fetch(targetUrl, {
        headers: { 
          Authorization: authHeader || "",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        console.error(`Proxy error (tts list) from ${targetUrl} - Status: ${response.status} - Non-JSON response:`, text.substring(0, 200));
        res.status(response.status).json({ 
          message: `API returned non-JSON response (${response.status})`, 
          details: text.substring(0, 100),
          url: targetUrl
        });
      }
    } catch (error) {
      console.error(`Proxy error (tts list) calling ${targetUrl}:`, error);
      res.status(500).json({ message: "Internal server error", error: String(error) });
    }
  });

  // Keep old tts endpoint for backward compatibility but point it to submit
  app.post("/api/proxy/tts", async (req, res) => {
    const targetUrl = "https://app.maziao.com/api/tts/submit";
    try {
      const authHeader = req.headers.authorization;
      console.log(`Proxying POST to ${targetUrl}`);
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: authHeader || "",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        body: JSON.stringify(req.body),
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        console.error(`Proxy error (tts) from ${targetUrl} - Status: ${response.status} - Non-JSON response:`, text.substring(0, 200));
        res.status(response.status).json({ 
          message: `API returned non-JSON response (${response.status})`, 
          details: text.substring(0, 100),
          url: targetUrl
        });
      }
    } catch (error) {
      console.error(`Proxy error (tts) calling ${targetUrl}:`, error);
      res.status(500).json({ message: "Internal server error", error: String(error) });
    }
  });

  app.get("/api/proxy/voices/my-voices", async (req, res) => {
    const { limit = 50, offset = 0, search = "" } = req.query;
    const targetUrl = `https://app.maziao.com/api/voices/my-voices?limit=${limit}&offset=${offset}&search=${search}`;
    try {
      const authHeader = req.headers.authorization;
      console.log(`Proxying GET to ${targetUrl}`);
      
      const response = await fetch(targetUrl, {
        headers: { 
          Authorization: authHeader || "",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        res.status(response.status).json({ 
          message: `API returned non-JSON response (${response.status})`, 
          details: text.substring(0, 100)
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: String(error) });
    }
  });

  app.post("/api/proxy/voices", upload.single("refFile"), async (req, res) => {
    const targetUrl = "https://app.maziao.com/api/voices";
    try {
      const authHeader = req.headers.authorization;
      console.log(`Proxying POST to ${targetUrl}`);
      
      const formData = new FormData();
      // Forward all text fields from req.body
      for (const key in req.body) {
        formData.append(key, req.body[key]);
      }
      
      if (req.file) {
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append("refFile", blob, req.file.originalname);
      }
      
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          Authorization: authHeader || "",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        body: formData,
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error(`Proxy error (voices clone) calling ${targetUrl}:`, error);
      res.status(500).json({ message: "Internal server error", error: String(error) });
    }
  });

  app.put("/api/proxy/voices/:id", async (req, res) => {
    const { id } = req.params;
    const targetUrl = `https://app.maziao.com/api/voices/${id}`;
    try {
      const authHeader = req.headers.authorization;
      console.log(`Proxying PUT to ${targetUrl}`);
      const response = await fetch(targetUrl, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: authHeader || "",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        body: JSON.stringify(req.body),
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error(`Proxy error (voices update) calling ${targetUrl}:`, error);
      res.status(500).json({ message: "Internal server error", error: String(error) });
    }
  });

  app.delete("/api/proxy/voices/:id", async (req, res) => {
    const { id } = req.params;
    const targetUrl = `https://app.maziao.com/api/voices/${id}`;
    try {
      const authHeader = req.headers.authorization;
      console.log(`Proxying DELETE to ${targetUrl}`);
      const response = await fetch(targetUrl, {
        method: "DELETE",
        headers: { 
          Authorization: authHeader || "",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error(`Proxy error (voices delete) calling ${targetUrl}:`, error);
      res.status(500).json({ message: "Internal server error", error: String(error) });
    }
  });

  app.post("/api/proxy/register", async (req, res) => {
    try {
      const response = await fetch("https://app.maziao.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy error (register):", error);
      res.status(500).json({ message: "Internal server error" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  return app;
}

const appPromise = startServer();
export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
