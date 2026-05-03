import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

import sql, { ensureDb } from '@/lib/db';

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
  },
  callbacks: {
    async signIn({ user }) {
      try {
        await ensureDb();
        await sql`
          INSERT INTO users (email, name, image)
          VALUES (${user.email}, ${user.name}, ${user.image})
          ON CONFLICT (email) DO UPDATE SET last_login = CURRENT_TIMESTAMP;
        `;
        return true;
      } catch (e) {
        console.error('Failed to log user sign in:', e);
        return true; // Still allow sign in even if logging fails
      }
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
