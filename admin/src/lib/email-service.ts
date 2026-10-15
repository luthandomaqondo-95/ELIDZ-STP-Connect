/**
 * Email Service — password reset, email verification, etc.
 * Never log tokens, passwords, or full message bodies containing secrets.
 */

import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function appBaseUrl(): string {
  return (
    process.env.APP_PUBLIC_URL?.replace(/\/$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function mobileResetDeepLink(token: string): string {
  const web = process.env.EXPO_PUBLIC_APP_WEB_URL?.replace(/\/$/, "") || appBaseUrl();
  // Prefer https web handler that deep-links into the app when possible
  return `${web}/auth/reset-password?token=${encodeURIComponent(token)}`;
}

function mobileVerifyDeepLink(token: string): string {
  const web = process.env.EXPO_PUBLIC_APP_WEB_URL?.replace(/\/$/, "") || appBaseUrl();
  return `${web}/auth/email-confirmed?token=${encodeURIComponent(token)}`;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html, text } = options;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("SMTP not configured. Skipped sending email.", { to, subject });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: text || html.replace(/<[^>]*>/g, ""),
    html,
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = mobileResetDeepLink(resetToken);
  const deepLink = `elidzstp://reset-password?token=${encodeURIComponent(resetToken)}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Password Reset</title></head>
      <body>
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password for ELIDZ STP Connect.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>If the button does not work, open this link in your browser:<br/>${resetUrl}</p>
        <p>Mobile deep link: ${deepLink}</p>
        <p>This link expires in 1 hour and can be used only once.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </body>
    </html>
  `;

  const text = `Password reset for ELIDZ STP Connect.\n\nOpen: ${resetUrl}\nOr mobile: ${deepLink}\n\nExpires in 1 hour. Single use.`;

  await sendEmail({
    to: email,
    subject: "ELIDZ STP Connect — Password Reset",
    html,
    text,
  });
}

export async function sendEmailVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = mobileVerifyDeepLink(token);
  const deepLink = `elidzstp://email-confirmed?token=${encodeURIComponent(token)}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Confirm your email</title></head>
      <body>
        <h2>Confirm your email</h2>
        <p>Welcome to ELIDZ STP Connect. Confirm your email to activate your account.</p>
        <p><a href="${verifyUrl}">Confirm email</a></p>
        <p>Or open: ${verifyUrl}</p>
        <p>Mobile: ${deepLink}</p>
        <p>This link expires in 24 hours.</p>
      </body>
    </html>
  `;

  const text = `Confirm your ELIDZ STP Connect email:\n${verifyUrl}\nMobile: ${deepLink}\nExpires in 24 hours.`;

  await sendEmail({
    to: email,
    subject: "ELIDZ STP Connect — Confirm your email",
    html,
    text,
  });
}

export async function send2FACodeEmail(email: string, code: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Two-Factor Authentication Code</title></head>
      <body>
        <h2>Your Two-Factor Authentication Code</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 4px; font-family: monospace;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: "Your Two-Factor Authentication Code",
    html,
    text: `Your verification code is: ${code}. Expires in 10 minutes.`,
  });
}
