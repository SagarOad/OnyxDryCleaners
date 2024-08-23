import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
        });

        // Check if the admin exists and the password matches
        if (admin && bcrypt.compareSync(credentials.password, admin.password)) {
          return { id: admin.id, email: admin.email, role: 'admin' }; // Add role here
        }

        return null; // Return null if authorization fails
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role; // Pass the role to the session
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; // Include role in the token
      }
      return token;
    },
  },
  pages: {
    signIn: '/login', // Your custom login page
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for NextAuth
};

export default authOptions;
