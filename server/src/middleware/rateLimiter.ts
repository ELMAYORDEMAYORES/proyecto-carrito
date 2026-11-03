import { rateLimit } from "express-rate-limit";

const jsonMessage = (message: string) => ({ message });

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: jsonMessage("Demasiados intentos de inicio de sesión. Intenta en 15 minutos."),
});

export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: jsonMessage("Demasiados registros desde esta IP. Intenta en 15 minutos."),
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: jsonMessage("Demasiadas solicitudes. Intenta en 15 minutos."),
});

export const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: jsonMessage("Demasiados pedidos desde esta IP. Intenta de nuevo en 10 minutos."),
});
