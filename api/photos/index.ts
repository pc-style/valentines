import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "../_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await sql`
      SELECT id, src, date, message, section, added_by, added_at, sort_order
      FROM photos
      ORDER BY sort_order ASC, added_at ASC
    `;
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
