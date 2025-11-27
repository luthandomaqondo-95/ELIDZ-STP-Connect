import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/db-migration/db/db";
import { users } from "@/db-migration/db/schema";
import { eq } from "drizzle-orm";
import { TwoFactorAuth } from "@/application-logic/two-factor/TwoFactorAuth";

declare module "next-auth" {
    interface User {
        id: string;
        firstName?: string | null;
        lastName?: string | null;
        fullName: string;
        email: string;
        phone?: string | null;
        userType: number;
        role: number;
        avatarUrl?: string | null;
        emailVerified?: boolean;
        createdAt: string;
    }

    interface Session {
        user: {
            id: string;
            firstName?: string | null;
            lastName?: string | null;
            fullName: string;
            email: string;
            phone?: string | null;
            userType: number;
            role: number;
            avatarUrl?: string | null;
            emailVerified?: boolean;
            createdAt: string;
        };
    }

    interface JWT {
        id: string;
        firstName?: string | null;
        lastName?: string | null;
        fullName: string;
        email: string;
        phone?: string | null;
        userType: number;
        role: number;
        avatarUrl?: string | null;
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
                sessionToken: { label: "Session Token", type: "text" },
            },
            async authorize(credentials) {
                const { email, password, sessionToken } = credentials as { 
                    email: string; 
                    password: string;
                    sessionToken?: string;
                };

                if (!email) {
                    return null;
                }

                try {
                    // If sessionToken is provided, verify it (2FA already verified)
                    if (sessionToken) {
                        const verifiedSession = await TwoFactorAuth.verifySessionToken(sessionToken, email);
                        
                        if (!verifiedSession) {
                            console.error("NextAuth: Invalid or expired session token");
                            return null;
                        }

                        // Get user from database
                        const userResults = await db
                            .select()
                            .from(users)
                            .where(eq(users.id, verifiedSession.userId))
                            .limit(1);

                        if (userResults.length === 0) {
                            console.error("NextAuth: User not found for verified session");
                            return null;
                        }

                        const user = userResults[0];

                        // Check if user is banned
                        if (user.banned) {
                            console.error("NextAuth: User is banned");
                            return null;
                        }

                        // Return user object
                        return {
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            fullName: user.fullName,
                            email: user.email,
                            phone: user.phone,
                            userType: user.role,
                            role: user.role,
                            avatarUrl: user.avatarUrl,
                            emailVerified: user.emailVerified || false,
                            createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
                        };
                    }

                    // No session token - this shouldn't happen for credentials login
                    // (2FA is always required)
                    console.error("NextAuth: No session token provided for credentials login");
                    return null;
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
                        const name = user.name || (profile as any)?.name || email.split("@")[0];
                        const nameParts = name.split(" ");
                        const firstName = nameParts[0] || "";
                        const lastName = nameParts.slice(1).join(" ") || "";
                        const fullName = name;
                        const defaultRole = 2; // Default to applicant (2) for OAuth users
                        const avatarUrl = user.image || (profile as any)?.picture || null;

                        // Create user with pending status (no password for OAuth users)
                        const newUser = await db
                            .insert(users)
                            .values({
                                firstName,
                                lastName,
                                fullName,
                                email,
                                password: null, // OAuth users don't need password
                                role: defaultRole,
                                status: "pending",
                                banned: false,
                                avatarUrl,
                                emailVerified: true, // Google OAuth emails are automatically verified
                            })
                            .returning();

                        // Update user object with database ID
                        user.id = newUser[0].id;
                        (user as any).firstName = newUser[0].firstName;
                        (user as any).lastName = newUser[0].lastName;
                        (user as any).fullName = newUser[0].fullName;
                        (user as any).userType = newUser[0].role;
                        (user as any).role = newUser[0].role;
                        (user as any).avatarUrl = newUser[0].avatarUrl;
                        (user as any).emailVerified = newUser[0].emailVerified || false;
                        (user as any).createdAt = newUser[0].createdAt?.toISOString() || new Date().toISOString();
                    } else {
                        // User exists, check if banned
                        const dbUser = existingUser[0];
                        
                        if (dbUser.banned) {
                            console.error("Google sign in: User is banned");
                            return false;
                        }

                        // Update avatar if needed
                        const avatarUrl = user.image || (profile as any)?.picture || dbUser.avatarUrl;
                        if (avatarUrl && avatarUrl !== dbUser.avatarUrl) {
                            await db
                                .update(users)
                                .set({ avatarUrl })
                                .where(eq(users.id, dbUser.id));
                        }

                        // Update user object with database data
                        user.id = dbUser.id;
                        (user as any).firstName = dbUser.firstName;
                        (user as any).lastName = dbUser.lastName;
                        (user as any).fullName = dbUser.fullName;
                        (user as any).userType = dbUser.role;
                        (user as any).role = dbUser.role;
                        (user as any).avatarUrl = avatarUrl;
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
                token.firstName = (user as any).firstName || null;
                token.lastName = (user as any).lastName || null;
                token.fullName = (user as any).fullName || user.name || "";
                token.email = user.email || "";
                token.phone = (user as any).phone || null;
                token.userType = (user as any).userType || (user as any).role || 2;
                token.role = (user as any).role || (user as any).userType || 2;
                token.avatarUrl = (user as any).avatarUrl || null;
                token.emailVerified = (user as any).emailVerified || false;
                token.createdAt = (user as any).createdAt || new Date().toISOString();
            }
            // Also fetch fresh user data from database
            if (token.id) {
                try {
                    const [dbUser] = await db
                        .select({
                            emailVerified: users.emailVerified,
                            banned: users.banned,
                            status: users.status,
                        })
                        .from(users)
                        .where(eq(users.id, token.id as string))
                        .limit(1);
                    if (dbUser) {
                        token.emailVerified = dbUser.emailVerified || false;
                        // If user is banned, invalidate token
                        if (dbUser.banned) {
                            return null;
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.firstName = token.firstName as string | null;
                session.user.lastName = token.lastName as string | null;
                session.user.fullName = token.fullName as string;
                session.user.email = token.email as string;
                session.user.phone = token.phone as string | null;
                session.user.userType = token.userType as number;
                session.user.role = token.role as number;
                session.user.avatarUrl = token.avatarUrl as string | null;
                (session.user as any).emailVerified = (token.emailVerified as boolean) || false;
                session.user.createdAt = token.createdAt as string;
            }
            return session;
        },
    },

    secret: process.env.AUTH_SECRET,
});

