import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/db-migration/db/db";
import { users } from "@/db-migration/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getAndConsumeVerifiedTwoFactorSession } from "@/lib/temp-login-sessions";

declare module "next-auth" {
    interface User {
        id: string;
        fullName: string;
        email: string;
        userType: number;
        role: number;
        emailVerified?: boolean;
        createdAt: string;
    }

    interface Session {
        user: {
            id: string;
            fullName: string;
            email: string;
            userType: number;
            role: number;
            emailVerified?: boolean;
            createdAt: string;
        };
    }

    interface JWT {
        id: string;
        fullName: string;
        email: string;
        userType: number;
        role: number;
        emailVerified?: boolean;
        createdAt: string;
    }
}


export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const { email, password } = credentials as { 
                    email: string; 
                    password: string;
                };

                if (!email || !password) {
                    return null;
                }

                try {
                    // First, check if password is a 2FA verification token (64 char hex string)
                    // Verify tokens are 64 characters (32 bytes = 64 hex chars)
                    const isVerifyToken = /^[a-f0-9]{64}$/i.test(password);
                    
                    if (isVerifyToken) {
                        // This might be a 2FA verification token - try to get verified session from database
                        const verifiedSession = await getAndConsumeVerifiedTwoFactorSession(password);
                        
                        if (verifiedSession) {
                            // Found a verified 2FA session - get user by email or userId
                            const userResults = await db
                                .select()
                                .from(users)
                                .where(eq(users.id, verifiedSession.userId))
                                .limit(1);

                            if (userResults.length === 0) {
                                console.error("NextAuth: Verified session user not found", verifiedSession.userId);
                                return null;
                            }

                            const user = userResults[0];

                            // Verify the session matches the user and email
                            if (verifiedSession.userId === user.id && verifiedSession.email === email && user.email === email) {
                                // 2FA already verified - skip password check and return user
                                console.log("NextAuth: 2FA verified login successful for", email);
                                return {
                                    id: user.id,
                                    fullName: user.fullName,
                                    email: user.email,
                                    userType: user.role,
                                    role: user.role,
                                    emailVerified: user.emailVerified || false,
                                    createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
                                };
                            } else {
                                console.error("NextAuth: Verified session mismatch", {
                                    sessionUserId: verifiedSession.userId,
                                    sessionEmail: verifiedSession.email,
                                    providedEmail: email,
                                    dbUserId: user.id,
                                    dbEmail: user.email
                                });
                                return null;
                            }
                        } else {
                            // Token format looks right but session not found or expired
                            console.error("NextAuth: Verify token not found or expired", password.substring(0, 8) + "...");
                            return null;
                        }
                    }

                    // Find user by email for normal password verification
                    const userResults = await db
                        .select()
                        .from(users)
                        .where(eq(users.email, email))
                        .limit(1);

                    if (userResults.length === 0) {
                        return null;
                    }

                    const user = userResults[0];

                    // Normal password verification (no 2FA or 2FA not enabled)
                    const isPasswordValid = await bcrypt.compare(password, user.password);

                    if (!isPasswordValid) {
                        return null;
                    }

                    // Check if 2FA is enabled - if so, don't complete login yet
                    // (This should be handled by the login flow, but as a safety check)
                    if (user.twoFactorEnabled) {
                        // 2FA is enabled but no verification token provided
                        // Return null to prevent login without 2FA
                        return null;
                    }

                    // Return user object in the format expected by NextAuth
                    return {
                        id: user.id,
                        fullName: user.fullName,
                        email: user.email,
                        userType: user.role,
                        role: user.role,
                        emailVerified: user.emailVerified || false,
                        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
                    };
                } catch (error) {
                    console.error("NextAuth authorize error:", error);
                    return null;
                }
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days,
        updateAge: 62 * 60 * 60, // 62 hours
    },

    cookies: {
        sessionToken: {
            name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production", // HTTPS only in production
            },
        },
        callbackUrl: {
            name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.callback-url`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
        csrfToken: {
            name: `${process.env.NODE_ENV === "production" ? "__Host-" : ""}next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
        pkceCodeVerifier: {
            name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.pkce.code_verifier`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 15, // 15 minutes
            },
        },
        state: {
            name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.state`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 15, // 15 minutes
            },
        },
        nonce: {
            name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.nonce`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },

    callbacks: {
        async signIn({ user, account, profile }) {
            // Handle Google OAuth sign in
            if (account?.provider === "google") {
                try {
                    const email = user.email;
                    if (!email) {
                        return false;
                    }

                    // Check if user exists in database
                    const existingUser = await db
                        .select()
                        .from(users)
                        .where(eq(users.email, email))
                        .limit(1);

                    if (existingUser.length === 0) {
                        // User doesn't exist, create new user
                        const fullName = user.name || (profile as any)?.name || email.split("@")[0];
                        const defaultRole = 3; // Default to admin role for admin portal

                        // Generate a random password (won't be used for OAuth, but required by schema)
                        const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

                        const newUser = await db
                            .insert(users)
                            .values({
                                fullName,
                                email,
                                password: randomPassword, // OAuth users don't need password
                                role: defaultRole,
                                emailVerified: true, // Google OAuth emails are automatically verified
                            })
                            .returning();

                        // Update user object with database ID
                        user.id = newUser[0].id;
                        (user as any).fullName = newUser[0].fullName;
                        (user as any).userType = newUser[0].role;
                        (user as any).role = newUser[0].role;
                        (user as any).emailVerified = newUser[0].emailVerified || false;
                        (user as any).createdAt = newUser[0].createdAt?.toISOString() || new Date().toISOString();
                    } else {
                        // User exists, update user object with database data
                        const dbUser = existingUser[0];
                        user.id = dbUser.id;
                        (user as any).fullName = dbUser.fullName;
                        (user as any).userType = dbUser.role;
                        (user as any).role = dbUser.role;
                        (user as any).emailVerified = dbUser.emailVerified || false;
                        (user as any).createdAt = dbUser.createdAt?.toISOString() || new Date().toISOString();
                    }

                    return true;
                } catch (error) {
                    console.error("Google sign in error:", error);
                    return false;
                }
            }

            // For credentials provider, allow sign in
            return true;
        },

        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.fullName = (user as any).fullName || user.name || "";
                token.email = user.email || "";
                token.userType = (user as any).userType || (user as any).role || 3;
                token.role = (user as any).role || (user as any).userType || 3;
                token.emailVerified = (user as any).emailVerified || false;
                token.createdAt = (user as any).createdAt || new Date().toISOString();
            }
            // Also fetch fresh email verification status from database
            if (token.id) {
                try {
                    const [dbUser] = await db
                        .select({ emailVerified: users.emailVerified })
                        .from(users)
                        .where(eq(users.id, token.id as string))
                        .limit(1);
                    if (dbUser) {
                        token.emailVerified = dbUser.emailVerified || false;
                    }
                } catch (error) {
                    console.error("Error fetching email verification status:", error);
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.fullName = token.fullName as string;
                session.user.email = token.email as string;
                session.user.userType = token.userType as number;
                session.user.role = token.role as number;
                (session.user as any).emailVerified = (token.emailVerified as boolean) || false;
                session.user.createdAt = token.createdAt as string;
            }
            return session;
        },
    },

    secret: process.env.AUTH_SECRET,
});

