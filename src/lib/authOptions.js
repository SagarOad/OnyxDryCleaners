// lib/authOptions.js
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";

/** Valid bcrypt hash used only when no user exists — keeps compare timing closer to real checks. */
const INVALID_USER_PASSWORD_HASH =
  "$2a$10$NlOtkVh/fyuPAFaeg6ZS3.1yp6wDFgo5xnP/TNWEBQOAhdzQy2ABy";

const RATE = {
  windowMs: 15 * 60 * 1000,
  maxFails: 12,
};

/** In-memory failed-attempt tracker (per server instance). Best-effort brute-force friction. */
const loginAttempts = new Map();

function rateKey(loginId) {
  return loginId.toLowerCase();
}

function isRateLimited(key) {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry) return false;
  if (now > entry.resetAt) {
    loginAttempts.delete(key);
    return false;
  }
  return entry.count >= RATE.maxFails;
}

function recordFailure(key) {
  const now = Date.now();
  let entry = loginAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE.windowMs };
  }
  entry.count += 1;
  loginAttempts.set(key, entry);
}

function clearFailures(key) {
  loginAttempts.delete(key);
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const loginId =
            typeof credentials?.username === "string"
              ? credentials.username.trim()
              : typeof credentials?.email === "string"
                ? credentials.email.trim()
                : "";
          const password =
            typeof credentials?.password === "string"
              ? credentials.password
              : "";

          if (!loginId || !password) return null;
          if (loginId.length > 254 || password.length > 128) return null;

          const key = rateKey(loginId);
          if (isRateLimited(key)) return null;

          const user = await prisma.admin.findUnique({
            where: { email: loginId },
          });

          const hash = user?.password ?? INVALID_USER_PASSWORD_HASH;
          const passwordOk = bcrypt.compareSync(password, hash);

          if (!user || !passwordOk) {
            recordFailure(key);
            return null;
          }

          clearFailures(key);
          return {
            id: user.id,
            email: user.email,
            role: "admin",
          };
        } catch (e) {
          console.error("Credentials authorize error:", e);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60,
  },

  jwt: {
    maxAge: 2 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        if (token.email) session.user.email = token.email;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
