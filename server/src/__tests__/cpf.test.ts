import { describe, expect, it } from "vitest";
import { isValidCpf, onlyDigits } from "../utils/cpf";

describe("onlyDigits", () => {
  it("removes non-digit characters", () => {
    expect(onlyDigits("111.444.777-35")).toBe("11144477735");
  });
});

describe("isValidCpf", () => {
  it("accepts a valid CPF with formatting", () => {
    expect(isValidCpf("111.444.777-35")).toBe(true);
  });

  it("accepts a valid CPF without formatting", () => {
    expect(isValidCpf("11144477735")).toBe(true);
  });

  it("rejects a CPF with wrong check digits", () => {
    expect(isValidCpf("111.444.777-36")).toBe(false);
  });

  it("rejects a CPF with all equal digits", () => {
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });

  it("rejects a CPF with the wrong length", () => {
    expect(isValidCpf("123456")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidCpf("")).toBe(false);
  });
});
