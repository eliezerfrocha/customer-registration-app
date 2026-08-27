import { describe, expect, it } from "vitest";
import { createClientSchema } from "../validators/clientSchema";

const validPayload = {
  fullName: "Maria da Silva",
  cpf: "111.444.777-35",
  email: "Maria@Example.com",
  colorId: "b0c9cdf2-42b4-48dd-9539-76b53368b1e4",
  notes: "Cliente preferencial",
};

describe("createClientSchema", () => {
  it("accepts a valid payload and normalizes email to lowercase", () => {
    const result = createClientSchema.parse(validPayload);
    expect(result.email).toBe("maria@example.com");
  });

  it("accepts a payload without notes (optional field)", () => {
    const { notes, ...rest } = validPayload;
    expect(() => createClientSchema.parse(rest)).not.toThrow();
  });

  it("rejects an invalid CPF", () => {
    expect(() =>
      createClientSchema.parse({ ...validPayload, cpf: "123" }),
    ).toThrow();
  });

  it("rejects an invalid e-mail", () => {
    expect(() =>
      createClientSchema.parse({ ...validPayload, email: "not-an-email" }),
    ).toThrow();
  });

  it("rejects a non-uuid colorId", () => {
    expect(() =>
      createClientSchema.parse({ ...validPayload, colorId: "not-a-uuid" }),
    ).toThrow();
  });

  it("rejects a full name shorter than 3 characters", () => {
    expect(() =>
      createClientSchema.parse({ ...validPayload, fullName: "Al" }),
    ).toThrow();
  });
});
