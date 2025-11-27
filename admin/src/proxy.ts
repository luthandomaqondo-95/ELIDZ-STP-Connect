import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { roleMap } from "@/lib/definitions";

// Invert roleMap to get role name by numeric code
const reverseRoleMap = Object.fromEntries(
    Object.entries(roleMap).map(([key, value]) => [value.toString(), key])
) as Record<string, string>;

export default async function middleware(req: NextRequest) {
    const session = await auth();
    const pathname = req.nextUrl.pathname;

    // Public routes that don't require authentication
    const publicRoutes = [
        "/auth/login",
        "/auth/signup",
        "/auth/forgot-password",
        "/auth/reset-password",
        "/",
    ];

    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname.startsWith(route + "/")
    );

    // If user is not authenticated, redirect to login (except for public routes)
    if (!session) {
        if (isPublicRoute) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Get user role from session
    const userType = session.user?.userType || session.user?.role;
    const userRole = reverseRoleMap[userType?.toString() || ""];

    // Check if user is banned (check in database for fresh status)
    // Note: This is a basic check. For production, you might want to check the database
    // For now, we'll rely on the JWT callback to invalidate banned users

    // If user is authenticated but on login page, redirect to dashboard
    if (pathname === "/auth/login" || pathname === "/auth/signup") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Role-based route protection (only for authenticated users)

    // Admin can access all routes
    if (userRole === "admin") {
        return NextResponse.next();
    }

    // For now, only admins can access the admin portal
    // Redirect non-admins to login
    if (userRole !== "admin") {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/auth/login",
    ],
};

