import { pgTable, text, timestamp, uuid, integer, boolean, jsonb } from "drizzle-orm/pg-core";

// Users
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: integer("role").notNull(),
  phone: text("phone"),
  location: text("address"),
  logo: text("logo"), // Logo file path (nullable, mainly for organizations)
  twoFactorSecret: text("two_factor_secret"), // TOTP secret for 2FA (nullable)
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false), // Whether 2FA is enabled
  twoFactorMethod: text("two_factor_method"), // "authenticator" or "email" (nullable)
  twoFactorBackupCodes: jsonb("two_factor_backup_codes"), // Array of backup codes (nullable, only for authenticator)
  emailVerified: boolean("email_verified").notNull().default(false), // Whether email is verified
  emailVerifiedAt: timestamp("email_verified_at"), // Timestamp when email was verified (nullable)
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Password Reset Tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Email Verification Tokens
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Temporary Login Sessions for 2FA
export const tempLoginSessions = pgTable("temp_login_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Verified 2FA Sessions (for bypassing password check in NextAuth)
export const verifiedTwoFactorSessions = pgTable("verified_two_factor_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  verifyToken: text("verify_token").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Email 2FA Codes (temporary codes sent via email for 2FA)
export const emailTwoFactorCodes = pgTable("email_two_factor_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull(), // 6-digit code
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

