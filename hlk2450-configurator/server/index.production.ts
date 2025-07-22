import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import fs from "fs";
import { WebSocketServer } from "ws";
import http from "http";

function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }

    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    if (res.statusCode >= 500) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`, "error");
    }
  });

  next();
});

const server = http.createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");
  
  ws.on("message", (message) => {
    console.log("Received:", message.toString());
    // Echo the message back
    ws.send(message.toString());
  });
  
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

registerRoutes(app);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = (err as any).status || (err as any).statusCode || 500;
  const message = err.message || "Internal Server Error";

  log(`Error: ${message}`, "error");
  res.status(status).json({ message });
  throw err;
});

// Serve static files in production
// Try multiple possible locations for static files
const possiblePaths = [
  path.join(process.cwd(), 'dist', 'public'),  // Docker: /app/dist/public
  path.join(process.cwd(), '..', 'dist', 'public'),  // Local development
  '/app/dist/public'  // Explicit Docker path
];

let staticPath = null;
for (const testPath of possiblePaths) {
  if (fs.existsSync(testPath)) {
    staticPath = testPath;
    break;
  }
}

if (staticPath) {
  log(`Serving static files from: ${staticPath}`);
  
  // Handle Home Assistant ingress path
  const ingressPath = process.env.SUPERVISOR_INGRESS_PATH || '';
  
  // Serve static files
  app.use(ingressPath, express.static(staticPath));
  app.use(express.static(staticPath));
  
  // Fallback to index.html for client-side routing (including ingress paths)
  app.get('*', (req, res) => {
    // Check if this is an ingress path request
    if (req.path.includes('/hassio/ingress/')) {
      // For ingress paths, always serve index.html for the SPA to handle routing
      const indexPath = path.join(staticPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Index.html not found");
      }
    } else {
      // Normal SPA fallback
      const indexPath = path.join(staticPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Index.html not found");
      }
    }
  });
} else {
  log(`ERROR: Could not find static files in any of: ${possiblePaths.join(', ')}`);
  app.use("*", (req, res) => {
    res.status(500).json({ 
      error: "Static files not found",
      tried: possiblePaths,
      cwd: process.cwd()
    });
  });
}

// Start the server
const PORT = parseInt(process.env.PORT || "5000", 10);
server.listen(PORT, "0.0.0.0", () => {
  log(`serving on port ${PORT}`);
});
