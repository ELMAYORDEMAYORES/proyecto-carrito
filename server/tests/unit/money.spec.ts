import { describe, it, expect } from "vitest";
import { toCents, toDollars } from "../../src/utils/money.js";

describe("money", () => {
  it("convierte dólares a centavos (entero)", () => {
    expect(toCents(89.99)).toBe(8999);
    expect(toCents(0)).toBe(0);
    expect(toCents(10.5)).toBe(1050);
  });

  it("convierte centavos a dólares", () => {
    expect(toDollars(8999)).toBe(89.99);
    expect(toDollars(0)).toBe(0);
  });

  it("es idempotente (roundtrip)", () => {
    expect(toDollars(toCents(89.99))).toBe(89.99);
    expect(toDollars(toCents(0.1))).toBe(0.1);
  });
});
