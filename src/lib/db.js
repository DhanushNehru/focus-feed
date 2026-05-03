import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || 'postgres://localhost:5432/focusfeed', {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});

let isInitialized = false;

export async function ensureDb() {
  if (isInitialized) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        name TEXT,
        image TEXT,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_feeds (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(url, user_email)
      );
    `;

    // Safely add is_active column if it's missing (for existing tables)
    await sql`ALTER TABLE user_feeds ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`;

    await sql`
      CREATE TABLE IF NOT EXISTS user_articles (
        id TEXT PRIMARY KEY,
        feed_id TEXT NOT NULL,
        title TEXT NOT NULL,
        link TEXT NOT NULL,
        content TEXT,
        pub_date TIMESTAMP,
        is_visible BOOLEAN DEFAULT TRUE,
        user_email TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(link, user_email),
        FOREIGN KEY(feed_id) REFERENCES user_feeds(id) ON DELETE CASCADE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_rules (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        value TEXT NOT NULL,
        user_email TEXT NOT NULL,
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
