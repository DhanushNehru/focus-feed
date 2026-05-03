import './globals.css';
import Link from 'next/link';
import AuthProvider from '@/components/SessionProvider';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const metadata = {
  title: 'FocusFeed',
  description: 'A smart, curated feed aggregator',
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <nav>
            <div className="logo">
              <Link href="/">FocusFeed</Link>
            </div>
            <div className="links">
              {session ? (
                <>
                  <Link href="/">Dashboard</Link>
                  <Link href="/feeds">Sources</Link>
                  <Link href="/rules">Rules</Link>
                  <a href="/api/auth/signout" style={{ color: 'var(--text-secondary)' }}>Sign Out</a>
                </>
              ) : (
                <a href="/api/auth/signin" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Sign In</a>
              )}
            </div>
          </nav>
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
