import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'FocusFeed',
  description: 'A smart, curated feed aggregator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <div className="logo">
            <Link href="/">FocusFeed</Link>
          </div>
          <div className="links">
            <Link href="/">Feed</Link>
            <Link href="/feeds">Sources</Link>
            <Link href="/rules">Rules</Link>
            <a href="https://github.com/sponsors/DhanushNehru" target="_blank" rel="noopener noreferrer" style={{color: '#c084fc'}}>
              ❤️ Sponsor
            </a>
          </div>
        </nav>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
