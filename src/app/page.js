'use client';
import { useEffect, useState } from 'react';
import { useSession, signIn } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (session) {
      fetchArticles();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Sync complete! Added ${data.added || 0} new filtered articles.`);
        fetchArticles();
      } else {
        alert(data.error || 'Failed to sync feeds.');
      }
    } catch (e) {
      alert('Failed to sync feeds.');
    } finally {
      setSyncing(false);
    }
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem', maxWidth: '600px', margin: '4rem auto' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Filter the Noise. <br/> Keep the Signal.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '3rem' }}>
          FocusFeed is a smart RSS aggregator. Set strict keyword rules and only read the content that actually matters to you.
        </p>
        <button onClick={() => signIn('github')} style={{ padding: '1rem 2rem', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          Sign In with GitHub
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="sponsor-banner">
        <span>⭐ Support the development of FocusFeed</span>
        <a href="https://github.com/sponsors/DhanushNehru" target="_blank" rel="noopener noreferrer">
          Sponsor DhanushNehru on GitHub ❤️
        </a>
      </div>

      <div className="header-actions">
        <div>
          <h1>Your Curated Feed</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Logged in as {session.user.email}</p>
        </div>
        <button onClick={handleSync} disabled={syncing}>
          {syncing ? 'Syncing...' : 'Sync Feeds Now'}
        </button>
      </div>

      {loading ? (
        <p>Loading your focused feed...</p>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <h2 style={{ color: 'var(--text-secondary)' }}>No articles match your rules.</h2>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            Try adding more feeds or adjusting your filtering rules.
          </p>
        </div>
      ) : (
        <div className="grid">
          {articles.map(article => (
            <div key={article.id} className="card">
              <h3>
                <a href={article.link} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
              </h3>
              {article.content && (
                <p dangerouslySetInnerHTML={{ __html: article.content.substring(0, 150) + '...' }} />
              )}
              <div className="meta">
                <span>{article.feed_name}</span>
                <span>{new Date(article.pub_date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
