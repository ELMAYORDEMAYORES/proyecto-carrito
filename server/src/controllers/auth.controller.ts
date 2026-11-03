import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import {
  signAccessToken,
  generateRefreshToken,
  generateOpaqueToken,
  hashToken,
  refreshTokenExpiry,
} from "../services/token.service.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/email.service.js";
import { resolveTenantSlug } from "../services/slug.service.js";
import { UserModel } from "../models/User.js";
import type { UserRole } from "../models/User.js";
import { TenantModel } from "../models/Tenant.js";
import { RefreshTokenModel } from "../models/RefreshToken.js";
import { EmailTokenModel } from "../models/EmailToken.js";
import type { EmailTokenType } from "../models/EmailToken.js";
import { LoginAttemptModel } from "../models/LoginAttempt.js";
import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../schemas/auth.schema.js";

const MAX_FAILED_LOGINS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const REFRESH_COOKIE = "refreshToken";

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: "/" });
}

async function createEmailToken(
  userId: string,
  type: EmailTokenType,
  ttlMs: number
): Promise<string> {
  const token = generateOpaqueToken();
  await EmailTokenModel.create({
    userId,
    tokenHash: hashToken(token),
    type,
    expiresAt: new Date(Date.now() + ttlMs),
  });
  return token;
}

async function issueTokens(
  res: Response,
  userId: string,
  role: UserRole,
  tenantId?: string
): Promise<string> {
  const accessToken = signAccessToken({ sub: userId, role, tenantId });
  const refreshToken = generateRefreshToken();
  await RefreshTokenModel.create({
    userId,
    tokenHash: hashToken(refreshToken),
    familyId: generateOpaqueToken(),
    expiresAt: refreshTokenExpiry(),
  });
  setRefreshCookie(res, refreshToken);
  return accessToken;
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, storeName, storeSlug } =
    req.body as RegisterInput;

  const existing = await UserModel.exists({ email });
  if (existing) {
    throw ApiError.conflict("Ya existe una cuenta con este email");
  }

  const slug = await resolveTenantSlug(storeSlug, storeName);
  const passwordHash = await hashPassword(password);

  const user = await UserModel.create({
    email,
    passwordHash,
    name,
    role: "OWNER",
  });

  let tenant;
  try {
    tenant = await TenantModel.create({
      ownerId: user._id,
      name: storeName,
      slug,
    });
  } catch (err) {
    await UserModel.deleteOne({ _id: user._id });
    throw err;
  }

  user.tenantId = tenant._id;
  await user.save();

  const token = await createEmailToken(
    user._id.toString(),
    "VERIFY",
    VERIFY_TOKEN_TTL_MS
  );
  await sendVerificationEmail(email, token);

  res.status(201).json({
    message: "Cuenta creada. Revisa tu correo para verificar tu cuenta.",
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as LoginInput;

  const recentFailures = await LoginAttemptModel.countDocuments({
    email,
    createdAt: { $gte: new Date(Date.now() - LOGIN_WINDOW_MS) },
  });

  if (recentFailures >= MAX_FAILED_LOGINS) {
    throw ApiError.tooMany(
      "Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta en 15 minutos."
    );
  }

  const user = await UserModel.findOne({ email });

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    await LoginAttemptModel.create({ email, ip: req.ip ?? "" });
    throw ApiError.unauthorized("Credenciales inválidas");
  }

  await LoginAttemptModel.deleteMany({ email });

  if (!user.emailVerified) {
    throw new ApiError(403, "Debes verificar tu correo antes de iniciar sesión");
  }

  const accessToken = await issueTokens(
    res,
    user._id.toString(),
    user.role,
    user.tenantId?.toString()
  );

  res.json({
    accessToken,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId?.toString() ?? null,
    },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!token) {
    throw ApiError.unauthorized("No hay token de refresco");
  }

  const stored = await RefreshTokenModel.findOne({ tokenHash: hashToken(token) });
  if (!stored) {
    throw ApiError.unauthorized("Token de refresco inválido");
  }

  if (stored.revoked) {
    await RefreshTokenModel.updateMany(
      { familyId: stored.familyId, revoked: false },
      { $set: { revoked: true } }
    );
    throw ApiError.unauthorized("Sesión invalidada por reutilización de token");
  }

  if (stored.expiresAt.getTime() < Date.now()) {
    throw ApiError.unauthorized("Token de refresco expirado");
  }

  const user = await UserModel.findById(stored.userId);
  if (!user) {
    throw ApiError.unauthorized("Usuario no encontrado");
  }

  const newRefreshToken = generateRefreshToken();
  const newStored = await RefreshTokenModel.create({
    userId: stored.userId,
    tokenHash: hashToken(newRefreshToken),
    familyId: stored.familyId,
    expiresAt: refreshTokenExpiry(),
  });

  stored.revoked = true;
  stored.replacedByTokenId = newStored._id;
  await stored.save();

  setRefreshCookie(res, newRefreshToken);

  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
    tenantId: user.tenantId?.toString(),
  });

  res.json({ accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (token) {
    await RefreshTokenModel.updateOne(
      { tokenHash: hashToken(token) },
      { $set: { revoked: true } }
    );
  }
  clearRefreshCookie(res);
  res.json({ message: "Sesión cerrada" });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body as VerifyEmailInput;
  const record = await EmailTokenModel.findOne({
    tokenHash: hashToken(token),
    type: "VERIFY",
    used: false,
  });

  if (!record) {
    throw ApiError.badRequest("Token inválido");
  }
  if (record.expiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest("El enlace ha expirado");
  }

  await EmailTokenModel.updateOne(
    { _id: record._id },
    { $set: { used: true } }
  );
  await UserModel.updateOne(
    { _id: record.userId },
    { $set: { emailVerified: true } }
  );

  res.json({ message: "Correo verificado correctamente" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body as ForgotPasswordInput;
  const user = await UserModel.findOne({ email });

  if (user) {
    const token = await createEmailToken(
      user._id.toString(),
      "RESET",
      RESET_TOKEN_TTL_MS
    );
    await sendPasswordResetEmail(email, token);
  }

  res.json({
    message:
      "Si el correo existe, recibirás un enlace para restablecer tu contraseña.",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body as ResetPasswordInput;
  const record = await EmailTokenModel.findOne({
    tokenHash: hashToken(token),
    type: "RESET",
    used: false,
  });

  if (!record) {
    throw ApiError.badRequest("Token inválido");
  }
  if (record.expiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest("El enlace ha expirado");
  }

  const passwordHash = await hashPassword(password);

  await EmailTokenModel.updateOne(
    { _id: record._id },
    { $set: { used: true } }
  );
  await UserModel.updateOne(
    { _id: record.userId },
    { $set: { passwordHash } }
  );
  await RefreshTokenModel.updateMany(
    { userId: record.userId, revoked: false },
    { $set: { revoked: true } }
  );

  res.json({ message: "Contraseña actualizada correctamente" });
});

export const me = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.userId);
  if (!user) {
    throw ApiError.notFound("Usuario no encontrado");
  }

  let tenantSlug: string | null = null;
  if (user.tenantId) {
    const tenant = await TenantModel.findById(user.tenantId).select("slug");
    tenantSlug = tenant?.slug ?? null;
  }

  res.json({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId?.toString() ?? null,
    tenantSlug,
  });
});
