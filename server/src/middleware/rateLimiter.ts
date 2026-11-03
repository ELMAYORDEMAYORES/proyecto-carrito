import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";

const jsonMessage = (message: string) => ({ message });

// Cloudflare setea CF-Connecting-IP con la IP real del cliente (no spoofeable).
// Sin esto, detrás de Cloudflare todos los usuarios compartirían la IP de Cloudflare.
// ipKeyGenerator normaliza IPv4-mapeado a IPv6 y aplica subnet para IPv6.
export const cloudflareKeyGenerator = (req: Request): string => {
  const cfIp = req.headers["cf-connecting-ip"];
  const ip = typeof cfIp === "string" && cfIp ? cfIp : (req.ip ?? "unknown");
  return ipKeyGenerator(ip);
};

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: cloudflareKeyGenerator,
  message: jsonMessage("Demasiados intentos de inicio de sesión. Intenta en 15 minutos."),
});

export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: cloudflareKeyGenerator,
  message: jsonMessage("Demasiados registros desde esta IP. Intenta en 15 minutos."),
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: cloudflareKeyGenerator,
  message: jsonMessage("Demasiadas solicitudes. Intenta en 15 minutos."),
});

export const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: cloudflareKeyGenerator,
  message: jsonMessage("Demasiados pedidos desde esta IP. Intenta de nuevo en 10 minutos."),
});
