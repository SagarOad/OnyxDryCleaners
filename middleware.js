import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Allow if it's a login request or if the user is authenticated
  if (pathname === '/login' || token) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  return NextResponse.redirect(new URL('/login', req.url));
}

export const config = {
  matcher: [
    "/",
    "/customers",
    "/orders",
    "/add-order",
  ],
};
