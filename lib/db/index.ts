import Database from 'better-sqlite3';

import path from 'path';

const dbPath = path.join(process.cwd(), 'broadcaster.db');
console.log('Opening DB at:', dbPath);
let dbInstance: Database.Database | null = null;

export function getDb() {
  if (!dbInstance) {
    const dbPath = path.join(process.cwd(), 'broadcaster.db');
    console.log('Initializing DB at:', dbPath);
    try {
      dbInstance = new Database(dbPath, { verbose: console.log });
      initDb(dbInstance);
    } catch (e) {
      console.error('Failed to init DB:', e);
      throw e;
    }
  }
  return dbInstance;
}

/**
 * Initialize the database schema.
 * In Next.js, we might want to run this conditionally or via a separate script,
 * but for this prototype, checking on import or first use is acceptable/common for side projects.
 * However, Next.js hot-reloads might re-run this. Using a singleton pattern helps.
 */
export function initDb(db: Database.Database) {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS social_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      platform TEXT NOT NULL, -- 'facebook', 'tiktok', 'linkedin'
      platform_user_id TEXT, -- User ID on the platform (if multiple accounts)
      display_name TEXT,
      is_active BOOLEAN DEFAULT 1,
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at DATETIME,
      status TEXT DEFAULT 'valid', -- 'valid', 'expired', 'revoked'
      group_name TEXT, -- To support grouping if needed, or just infer from platform
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS content (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      body TEXT,
      media_assets TEXT, -- JSON array
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL,
      social_account_id TEXT NOT NULL,
      platform TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed'
      error_message TEXT,
      external_post_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(content_id) REFERENCES content(id),
      FOREIGN KEY(social_account_id) REFERENCES social_accounts(id)
    );
  `;

  db.exec(schema);
  console.log('Database initialized');
}
