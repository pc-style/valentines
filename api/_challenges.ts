import { sql } from "./_db.js";

export async function storeChallenge(username: string, challenge: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  await sql`
    INSERT INTO challenges (username, challenge, expires_at)
    VALUES (${username}, ${challenge}, ${expiresAt})
    ON CONFLICT (username) DO UPDATE SET challenge = ${challenge}, expires_at = ${expiresAt}
  `;
}

export async function getChallenge(username: string): Promise<string | null> {
  const result = await sql`
    SELECT challenge FROM challenges
    WHERE username = ${username} AND expires_at > NOW()
  `;
  await sql`DELETE FROM challenges WHERE username = ${username}`;
  if (result.rows.length === 0) return null;
  return result.rows[0].challenge as string;
}
