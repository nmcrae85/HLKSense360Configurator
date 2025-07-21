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
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const distPath = path.resolve(__dirname, "..", "..", "dist", "public");

if (!fs.existsSync(distPath)) {
  log(`Warning: Could not find build directory: ${distPath}`);
  // Try alternative path
  const altPath = path.resolve(__dirname, "..", "client", "dist");
  if (fs.existsSync(altPath)) {
    app.use(express.static(altPath));
    app.use("*", (req, res) => {
      res.sendFile(path.join(altPath, "index.html"));
    });
  }
} else {
  // Serve static files from the build directory
  app.use(express.static(distPath));
  
  // Fallback to index.html for client-side routing
  app.use("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start the server
const PORT = parseInt(process.env.PORT || "5000", 10);
server.listen(PORT, "0.0.0.0", () => {
  log(`serving on port ${PORT}`);
});