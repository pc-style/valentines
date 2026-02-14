import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "../_db.js";
import { getSessionUser } from "../_auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.query;
  const photoId = Number(id);

  if (!photoId || isNaN(photoId)) {
    return res.status(400).json({ error: "Invalid photo ID" });
  }

  const { message, date } = req.body || {};

  if (!message && !date) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  try {
    if (message && date) {
      await sql`UPDATE photos SET message = ${message}, date = ${date} WHERE id = ${photoId}`;
    } else if (message) {
      await sql`UPDATE photos SET message = ${message} WHERE id = ${photoId}`;
    } else if (date) {
      await sql`UPDATE photos SET date = ${date} WHERE id = ${photoId}`;
    }

    const result = await sql`
      SELECT id, src, date, message, section, added_by, added_at, sort_order
      FROM photos WHERE id = ${photoId}
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Photo not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
