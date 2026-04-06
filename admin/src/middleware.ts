import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { isProfileSuspended } from "@/lib/account-status"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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

  // Mis-typed or legacy URL — avoid noisy 404s in logs
  if (request.nextUrl.pathname === "/auth/blue") {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return response
  }

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
