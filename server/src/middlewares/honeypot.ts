import { NextFunction, Request, Response } from "express";

// `website` is a hidden field real users never fill; a non-empty value fakes success instead of erroring, so bots don't learn to avoid it.
export function honeypotGuard(req: Request, res: Response, next: NextFunction): void {
  const honeypot = req.body?.website;

  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    res.status(201).json({ received: true });
    return;
  }

  next();
}
