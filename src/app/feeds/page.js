'use client';
import { useEffect, useState } from 'react';

export default function FeedsPage() {
  const [feeds, setFeeds] = useState([]);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchFeeds = async () => {
    try {
      const res = await fetch('/api/feeds');
      const data = await res.json();
      setFeeds(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setFeeds([]);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleAddFeed = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to add feed');
      } else {
        setUrl('');
        fetchFeeds();
      }
    } catch (error) {
      alert('Error adding feed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This will delete the feed and all its downloaded articles.')) return;
    
    await fetch('/api/feeds', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchFeeds();
  };

  return (
    <div>
      <div className="header-actions">
        <h1>Manage Sources</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Add New Feed</h3>
        <p>Enter the RSS or Atom feed URL of the blog you want to follow.</p>
        <form onSubmit={handleAddFeed} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <input 
            type="url" 
            placeholder="https://example.com/rss.xml" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Feed'}
          </button>
        </form>
      </div>

      <h2>Your Feeds</h2>
      <div className="grid">
        {feeds.map(feed => (
          <div key={feed.id} className="card">
            <h3>{feed.name}</h3>
            <p style={{ wordBreak: 'break-all' }}>{feed.url}</p>
            <div className="meta" style={{ marginTop: '1.5rem' }}>
              <span>Added {new Date(feed.created_at).toLocaleDateString()}</span>
              <button 
                className="secondary" 
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={() => handleDelete(feed.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
