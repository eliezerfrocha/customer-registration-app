import rateLimit from "express-rate-limit";

export const createClientLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Muitas tentativas de cadastro. Tente novamente em alguns minutos." },
});

export const listClientsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Muitas requisições. Tente novamente em alguns minutos." },
});
