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

  if (process.env.NODE_ENV === "production") {
    // Behind a reverse proxy (Docker/Nginx, load balancer), trust the first
    // hop's X-Forwarded-For so rate limiting sees the real client IP.
    app.set("trust proxy", 1);
  }

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

  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: "Customer Registration API — Docs",
      swaggerOptions: {
        docExpansion: "list",
        filter: true,
        persistAuthorization: true,
        displayRequestDuration: true,
        tagsSorter: "alpha",
      },
    }),
  );
  app.get("/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });

  app.use("/api/colors", colorRoutes);
  app.use("/api/clients", clientRoutes);

  app.use(errorHandler);

  return app;
}
