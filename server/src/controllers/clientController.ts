import { NextFunction, Request, Response } from "express";
import { createClient, listClients } from "../services/clientService";
import { createClientSchema } from "../validators/clientSchema";

export async function listClientsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const clients = await listClients();
    res.json(clients);
  } catch (error) {
    next(error);
  }
}

export async function createClientHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createClientSchema.parse(req.body);
    const client = await createClient(input);
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
}
