import { describe, it, expect } from "vitest";
import type { Request } from "express";
import { cloudflareKeyGenerator } from "../../src/middleware/rateLimiter.js";

describe("cloudflareKeyGenerator", () => {
  it("usa CF-Connecting-IP cuando está presente", () => {
    const req = {
      headers: { "cf-connecting-ip": "203.0.113.5" },
      ip: "1.2.3.4",
    } as unknown as Request;
    expect(cloudflareKeyGenerator(req)).toBe("203.0.113.5");
  });

  it("usa req.ip como fallback", () => {
    const req = { headers: {}, ip: "1.2.3.4" } as unknown as Request;
    expect(cloudflareKeyGenerator(req)).toBe("1.2.3.4");
  });

  it("devuelve unknown sin IP ni header", () => {
    const req = { headers: {} } as unknown as Request;
    expect(cloudflareKeyGenerator(req)).toBe("unknown");
  });

  it("normaliza IPv4-mapeado a IPv6 (::ffff:x -> x)", () => {
    const req = {
      headers: {},
      ip: "::ffff:127.0.0.1",
    } as unknown as Request;
    expect(cloudflareKeyGenerator(req)).toBe("127.0.0.1");
  });
});
