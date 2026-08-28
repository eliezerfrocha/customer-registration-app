import { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { honeypotGuard } from "../middlewares/honeypot";

function mockResponse() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("honeypotGuard", () => {
  it("calls next() when the honeypot field is empty", () => {
    const req = { body: { website: "" } } as Request;
    const res = mockResponse();
    const next = vi.fn();

    honeypotGuard(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("calls next() when the honeypot field is absent", () => {
    const req = { body: {} } as Request;
    const res = mockResponse();
    const next = vi.fn();

    honeypotGuard(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("short-circuits with a fake 201 when the honeypot field is filled", () => {
    const req = { body: { website: "http://spam.example" } } as Request;
    const res = mockResponse();
    const next = vi.fn();

    honeypotGuard(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });
});
