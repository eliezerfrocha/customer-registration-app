import { Router } from "express";
import { createClientHandler, listClientsHandler } from "../controllers/clientController";

export const clientRoutes = Router();

clientRoutes.get("/", listClientsHandler);
clientRoutes.post("/", createClientHandler);
