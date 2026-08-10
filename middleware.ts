import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rotaProtegida =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (rotaProtegida) {
    const sessao = request.cookies.get("admin_session")?.value;

    if (sessao !== process.env.ADMIN_PASSWORD) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
