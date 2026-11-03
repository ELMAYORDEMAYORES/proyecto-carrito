import crypto from "node:crypto";
import { describe, it, expect } from "vitest";
import {
  generateRefreshToken,
  generateOpaqueToken,
  hashToken,
  parseDuration,
} from "../../src/services/token.service.js";

describe("token.service", () => {
  it("hashToken genera un sha256 hex", () => {
    const expected = crypto.createHash("sha256").update("abc").digest("hex");
    expect(hashToken("abc")).toBe(expected);
  });

  it("generateRefreshToken devuelve 128 caracteres hex", () => {
    expect(generateRefreshToken()).toMatch(/^[a-f0-9]{128}$/);
  });

  it("generateOpaqueToken devuelve 64 caracteres hex", () => {
    expect(generateOpaqueToken()).toMatch(/^[a-f0-9]{64}$/);
  });

  it("parseDuration convierte formatos s/m/h/d a milisegundos", () => {
    expect(parseDuration("15m")).toBe(15 * 60 * 1000);
    expect(parseDuration("7d")).toBe(7 * 24 * 60 * 60 * 1000);
    expect(parseDuration("1h")).toBe(60 * 60 * 1000);
  });

  it("parseDuration lanza error con formato inválido", () => {
    expect(() => parseDuration("abc")).toThrow();
  });
});
