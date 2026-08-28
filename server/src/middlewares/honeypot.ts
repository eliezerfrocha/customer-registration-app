import { NextFunction, Request, Response } from "express";

/**
 * Anti-spam honeypot: `website` is a hidden form field real users never see
 * or fill. If it arrives non-empty, the request is almost certainly a bot —
 * we fake a success response without touching the database, instead of
 * returning an error that would let the bot learn to avoid this field.
 */
export function honeypotGuard(req: Request, res: Response, next: NextFunction): void {
  const honeypot = req.body?.website;

  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    res.status(201).json({ received: true });
    return;
  }

  next();
}
