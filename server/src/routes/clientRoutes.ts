import { Router } from "express";
import { createClientHandler, listClientsHandler } from "../controllers/clientController";
import { honeypotGuard } from "../middlewares/honeypot";
import { createClientLimiter, listClientsLimiter } from "../middlewares/rateLimiters";

export const clientRoutes = Router();

clientRoutes.get("/", listClientsLimiter, listClientsHandler);
clientRoutes.post("/", createClientLimiter, honeypotGuard, createClientHandler);
