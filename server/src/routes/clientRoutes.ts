import { Router } from "express";
import { createClientHandler } from "../controllers/clientController";

export const clientRoutes = Router();

clientRoutes.post("/", createClientHandler);
