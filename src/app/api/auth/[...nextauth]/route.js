import NextAuth from 'next-auth';
import { authOptions } from './authOptions';

// For handling GET and POST requests in the App Router
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
