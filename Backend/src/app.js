import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      // Requêtes sans Origin (health checks, curl, same-origin)
      if (!origin) return callback(null, true);
      if (env.clientOrigins.includes(origin) || env.clientOrigins.includes("*")) {
        return callback(null, true);
      }
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
