import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { isProfileSuspended } from "@/lib/account-status"
import { isCustomAuthEnabled } from "@/lib/custom-auth/feature-flag"
import { ACCESS_COOKIE, clearSessionCookies } from "@/lib/custom-auth/cookies"
import { verifyAccessToken } from "@/lib/custom-auth/tokens-jwt"

/**
 * Edge-safe middleware.
 * Custom-auth path only verifies the access JWT (jose). Session refresh/rotation
 * happens in Node route handlers / server components — avoids Node `crypto` on Edge.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  if (request.nextUrl.pathname === "/auth/blue") {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return response
  }

  if (isCustomAuthEnabled()) {
    return handleCustomAuthDashboard(request)
  }

  return handleSupabaseAuthDashboard(request, response)
}

function isAdminRole(role: string): boolean {
  return role === "Admin" || role === "Super Admin"
}

async function handleCustomAuthDashboard(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value
  if (!access) {
    const redirect = NextResponse.redirect(new URL("/auth/login", request.url))
    clearSessionCookies(redirect)
    return redirect
  }

  try {
    const claims = await verifyAccessToken(access)
    const role = typeof claims.role === "string" ? claims.role : ""
    if (!isAdminRole(role)) {
      return NextResponse.redirect(new URL("/auth/unauthorized", request.url))
    }
    return NextResponse.next({
      request: { headers: request.headers },
    })
  } catch {
    const redirect = NextResponse.redirect(new URL("/auth/login", request.url))
    clearSessionCookies(redirect)
    return redirect
  }
}

async function handleSupabaseAuthDashboard(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error) {
      user = data.user
    }
  } catch (e) {
    console.error("[middleware] getUser failed (network?):", e)
  }

  if (!user) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      user = session?.user ?? null
    } catch (e) {
      console.error("[middleware] getSession fallback failed:", e)
    }
  }

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, verification_status")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("[middleware] profile fetch:", error.message)
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    if (profile && isProfileSuspended(profile)) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("error", "suspended")
      return NextResponse.redirect(url)
    }

    if (!profile || (profile.role !== "Admin" && profile.role !== "Super Admin")) {
      return NextResponse.redirect(new URL("/auth/unauthorized", request.url))
    }
  } catch (e) {
    console.error("[middleware] profile error:", e)
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/blue"],
}
