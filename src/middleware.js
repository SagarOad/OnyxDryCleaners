import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isSuperAdminPath = req.nextUrl.pathname.startsWith("/superadmin");
  const isSuperAdmin = token?.role === "superadmin";

  if (isLoginPage && isAuth) {
    return NextResponse.redirect(
      new URL(isSuperAdmin ? "/superadmin" : "/", req.url)
    );
  }

  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isSuperAdminPath && token?.role !== "superadmin") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (isSuperAdmin && !isSuperAdminPath && !isLoginPage) {
    return NextResponse.redirect(new URL("/superadmin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)"],
};