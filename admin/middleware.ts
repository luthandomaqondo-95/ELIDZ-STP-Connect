import type { NextRequest } from "next/server";
import { proxy } from "./src/proxy";

export async function middleware(request: NextRequest) {
  return proxy(request);
}

// Next.js requires `config` to be a static literal (no imports).
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

