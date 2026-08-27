import { NextFunction, Request, Response } from "express";
import { listColors } from "../services/colorService";

export async function listColorsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const colors = await listColors();
    res.json(colors);
  } catch (error) {
    next(error);
  }
}
