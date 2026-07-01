import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Load middlewares
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";

// Load routes
import analyzeRouter from "./routes/analyze";
import tasksRouter from "./routes/tasks";
import risksRouter from "./routes/risks";
import summaryRouter from "./routes/summary";
import chatRouter from "./routes/chat";

const app = express();
const PORT = 3000;

// Enable basic standard middlewares
app.use(corsMiddleware);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve API routes first
app.use("/api/analyze", analyzeRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/risks", risksRouter);
app.use("/api/summary", summaryRouter);
app.use("/api/chat", chatRouter);

// Basic health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Configure Vite middleware or production asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Express Backend] Mounting Vite middleware for Development Mode.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Express Backend] Serving static frontend files in Production Mode.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express Backend] Server successfully running at http://localhost:${PORT}`);
  });
}

startServer();
export default app;
