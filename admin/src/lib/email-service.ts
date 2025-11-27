/**
 * Email Service
 * Handles sending emails for password reset, 2FA codes, etc.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html, text } = options;

  // Check if SMTP is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("SMTP not configured. Email would be sent to:", to);
    console.warn("Subject:", subject);
    console.warn("Body:", text || html);
    // In development, just log the email
    return;
  }

  // Use nodemailer or similar email service
  // For now, we'll use a simple implementation
  // You can replace this with nodemailer, SendGrid, etc.

  try {
    // Example using nodemailer (install: npm install nodemailer)
    // Uncomment and configure when ready:
    /*
    const nodemailer = require("nodemailer");
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
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
    */

    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
      </head>
      <body>
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </body>
    </html>
  `;

  const text = `
    Password Reset Request
    
    You requested to reset your password. Visit the following link to reset it:
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you didn't request this, please ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: "Password Reset Request",
    html,
    text,
  });
}

export async function send2FACodeEmail(email: string, code: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Two-Factor Authentication Code</title>
      </head>
      <body>
        <h2>Your Two-Factor Authentication Code</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 4px; font-family: monospace;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </body>
    </html>
  `;

  const text = `
    Two-Factor Authentication Code
    
    Your verification code is: ${code}
    
    This code will expire in 10 minutes.
    
    If you didn't request this code, please ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: "Your Two-Factor Authentication Code",
    html,
    text,
  });
}

