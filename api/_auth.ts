import { sql } from "./_db.js";
import type { VercelRequest } from "@vercel/node";
import crypto from "node:crypto";

export interface SessionUser {
  id: number;
  username: string;
}

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await sql`INSERT INTO sessions (id, user_id, expires_at) VALUES (${sessionId}, ${userId}, ${expiresAt.toISOString()})`;
  return sessionId;
}

export async function getSessionUser(req: VercelRequest): Promise<SessionUser | null> {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(/session=([^;]+)/);
  if (!match) return null;

  const sessionId = match[1];
  const result = await sql`
    SELECT u.id, u.username FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId} AND s.expires_at > NOW()
  `;

  if (result.rows.length === 0) return null;
  return result.rows[0] as SessionUser;
}

export async function deleteSession(req: VercelRequest): Promise<void> {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(/session=([^;]+)/);
  if (!match) return;
  await sql`DELETE FROM sessions WHERE id = ${match[1]}`;
}

export function setSessionCookie(sessionId: string): string {
  const isProduction = process.env.NODE_ENV === "production";
  const secure = isProduction ? "; Secure" : "";
  const sameSite = isProduction ? "; SameSite=None" : "; SameSite=Lax";
  return `session=${sessionId}; HttpOnly; Path=/${secure}${sameSite}; Max-Age=${30 * 24 * 60 * 60}`;
}
