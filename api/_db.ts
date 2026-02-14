import { sql } from "@vercel/postgres";

export { sql };

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS passkeys (
      id TEXT PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      public_key BYTEA NOT NULL,
      counter BIGINT NOT NULL DEFAULT 0,
      transports TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      src TEXT NOT NULL,
      date TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '<3',
      section TEXT NOT NULL CHECK (section IN ('polaroid', 'film')),
      added_by TEXT,
      added_at TIMESTAMPTZ DEFAULT NOW(),
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `;

  await sql`INSERT INTO users (username) VALUES ('adas') ON CONFLICT (username) DO NOTHING`;
  await sql`INSERT INTO users (username) VALUES ('roksanka') ON CONFLICT (username) DO NOTHING`;
}
