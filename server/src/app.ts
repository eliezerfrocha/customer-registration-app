import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs/openapi";
import { errorHandler } from "./middlewares/errorHandler";
import { clientRoutes } from "./routes/clientRoutes";
import { colorRoutes } from "./routes/colorRoutes";

export function createApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get("/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });

  app.use("/api/colors", colorRoutes);
  app.use("/api/clients", clientRoutes);

  app.use(errorHandler);

  return app;
}
