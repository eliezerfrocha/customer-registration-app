import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler";
import { clientRoutes } from "./routes/clientRoutes";
import { colorRoutes } from "./routes/colorRoutes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/colors", colorRoutes);
  app.use("/api/clients", clientRoutes);

  app.use(errorHandler);

  return app;
}
