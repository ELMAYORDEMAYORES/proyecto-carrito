import nodemailer from "nodemailer";
import { env } from "../config/env.js";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log("📧 [DEV - email no enviado]");
    console.log(`   Para: ${to}`);
    console.log(`   Asunto: ${subject}`);
    console.log("--- HTML ---");
    console.log(html);
    console.log("------------");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${env.CLIENT_URL}/verify-email/${token}`;
  await sendEmail({
    to,
    subject: "Verifica tu cuenta",
    html: `<p>Hola,</p><p>Haz clic en el siguiente enlace para verificar tu cuenta:</p><p><a href="${link}">${link}</a></p><p>Este enlace expira en 24 horas.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = `${env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({
    to,
    subject: "Restablece tu contraseña",
    html: `<p>Hola,</p><p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${link}">${link}</a></p><p>Este enlace expira en 1 hora.</p>`,
  });
}

export async function sendTenantApprovedEmail(
  to: string,
  storeName: string
): Promise<void> {
  await sendEmail({
    to,
    subject: "Tu negocio fue aprobado",
    html: `<p>Hola,</p><p>Tu negocio <strong>${storeName}</strong> fue aprobado y ya está activo.</p><p>Ya podés gestionar tu catálogo y compartir tu enlace.</p>`,
  });
}

export async function sendTenantRejectedEmail(
  to: string,
  storeName: string,
  reason: string
): Promise<void> {
  await sendEmail({
    to,
    subject: "Tu negocio fue rechazado",
    html: `<p>Hola,</p><p>Lamentablemente tu negocio <strong>${storeName}</strong> fue rechazado.</p><p>Motivo: ${reason}</p>`,
  });
}
