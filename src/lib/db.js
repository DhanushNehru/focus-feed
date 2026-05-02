import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || 'postgres://localhost:5432/focusfeed', {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});

let isInitialized = false;

export async function ensureDb() {
  if (isInitialized) return;

  try {
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
    
    isInitialized = true;
  } catch (err) {
    console.error("Failed to initialize database tables:", err);
    throw err;
  }
}

export default sql;
