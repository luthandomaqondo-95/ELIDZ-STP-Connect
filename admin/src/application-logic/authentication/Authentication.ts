/**
 * Authentication Service
 * Handles user registration and login
 */

import { db } from "@/db-migration/db/db";
import { users } from "@/db-migration/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: number; // 2=applicant, 4=funder, 6=admin
  location?: {
    city?: string;
    province?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  role: number;
  avatarUrl: string | null;
  status: string | null;
  banned: boolean;
  location: any;
  createdAt: Date | null;
}

export class Authentication {
  /**
   * Register a new user
   */
  static async registerUser(data: RegisterUserData): Promise<User> {
    const { firstName, lastName, email, password, phone, role, location } = data;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create full name from first and last name
    const fullName = `${firstName} ${lastName}`.trim();

    // Insert user with pending status
    const [newUser] = await db
      .insert(users)
      .values({
        firstName,
        lastName,
        fullName,
        email,
        password: hashedPassword,
        phone,
        role,
        location: location || null, // Store as JSONB directly
        status: "pending",
        banned: false,
      })
      .returning();

    return {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      avatarUrl: newUser.avatarUrl,
      status: newUser.status,
      banned: newUser.banned,
      location: newUser.location,
      createdAt: newUser.createdAt,
    };
  }

  /**
   * Verify user credentials
   */
  static async verifyCredentials(credentials: LoginCredentials): Promise<User | null> {
    const { email, password } = credentials;

    // Find user by email
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResults.length === 0) {
      return null;
    }

    const user = userResults[0];

    // Check if user is banned
    if (user.banned) {
      throw new Error("Your account has been banned");
    }

    // Check if user has password (OAuth users might not have one)
    if (!user.password) {
      return null;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      status: user.status,
      banned: user.banned,
      location: user.location,
      createdAt: user.createdAt,
    };
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResults.length === 0) {
      return null;
    }

    const user = userResults[0];

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      status: user.status,
      banned: user.banned,
      location: user.location,
      createdAt: user.createdAt,
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResults.length === 0) {
      return null;
    }

    const user = userResults[0];

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      status: user.status,
      banned: user.banned,
      location: user.location,
      createdAt: user.createdAt,
    };
  }
}

