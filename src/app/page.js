'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      alert(`Sync complete! Added ${data.added || 0} new filtered articles.`);
      fetchArticles();
    } catch (e) {
      alert('Failed to sync feeds.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="sponsor-banner">
        <span>⭐ Support the development of FocusFeed</span>
        <a href="https://github.com/sponsors/DhanushNehru" target="_blank" rel="noopener noreferrer">
          Sponsor DhanushNehru on GitHub ❤️
        </a>
      </div>

      <div className="header-actions">
        <h1>Your Curated Feed</h1>
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
