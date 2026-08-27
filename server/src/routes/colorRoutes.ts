import { Router } from "express";
import { listColorsHandler } from "../controllers/colorController";

export const colorRoutes = Router();

colorRoutes.get("/", listColorsHandler);
