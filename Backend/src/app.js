import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (env.clientOrigins.includes("*")) return true;
  if (env.clientOrigins.includes(origin)) return true;
  // Autorise les fronts Render AXXAM (évite les blocages CORS en prod)
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith(".onrender.com") && host.includes("axxam")) return true;
  } catch {
    /* ignore */
  }
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS bloqué pour : ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bienvenue sur l'API AXXAM",
    version: "1.0.0",
    docs: {
      health: "GET /api/health",
      properties: "GET /api/properties",
      property: "GET /api/properties/:id",
      login: "POST /api/auth/login",
      register: "POST /api/auth/register",
    },
  });
});

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
