'use client';
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RulesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rules, setRules] = useState([]);
  const [type, setType] = useState('include');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/rules');
      const data = await res.json();
      setRules(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setRules([]);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (session) {
      fetchRules();
    }
  }, [session, status, router]);

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!value) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value })
      });
      
      if (!res.ok) throw new Error();
      setValue('');
      fetchRules();
    } catch (error) {
      alert('Error adding rule');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await fetch('/api/rules', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchRules();
  };

  return (
    <div>
      <div className="header-actions">
        <h1>Filtering Rules</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Add New Rule</h3>
        <p>Define what content should be included or excluded from your feed.</p>
        <form onSubmit={handleAddRule} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          >
            <option value="include">MUST INCLUDE (Keyword)</option>
            <option value="exclude">MUST EXCLUDE (Keyword)</option>
          </select>
          <input 
            type="text" 
            placeholder="e.g. React, AI, Politics..." 
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Rule'}
          </button>
        </form>
      </div>

      <h2>Your Active Rules</h2>
      {rules.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>No rules defined. All articles will be visible.</p>
      ) : (
        <div className="grid">
          {rules.map(rule => (
            <div key={rule.id} className="card" style={{ 
              borderColor: rule.type === 'include' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold', 
                  color: rule.type === 'include' ? '#3b82f6' : '#ef4444',
                  textTransform: 'uppercase' 
                }}>
                  {rule.type}
                </span>
                <button 
                  className="secondary" 
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                  onClick={() => handleDelete(rule.id)}
                >
                  ✕
                </button>
              </div>
              <h3 style={{ marginTop: '0.5rem' }}>"{rule.value}"</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
