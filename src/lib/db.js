import postgres from 'postgres';

// Initialize the postgres client. 
// It requires a DATABASE_URL environment variable (e.g., postgres://user:pass@host/db)
const sql = postgres(process.env.DATABASE_URL || 'postgres://localhost:5432/focusfeed', {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS feeds (
      id TEXT PRIMARY KEY,
      url TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      feed_id TEXT NOT NULL,
      title TEXT NOT NULL,
      link TEXT UNIQUE NOT NULL,
      content TEXT,
      pub_date TIMESTAMP,
      is_visible BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(feed_id) REFERENCES feeds(id)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS rules (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

// Automatically init tables. `CREATE TABLE IF NOT EXISTS` makes this safe to run multiple times.
initDb().catch(console.error);

export default sql;
