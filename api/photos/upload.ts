import type { VercelRequest, VercelResponse } from "@vercel/node";
import { put } from "@vercel/blob";
import { sql } from "../_db.js";
import { getSessionUser } from "../_auth.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const filename = req.query.filename as string;
  if (!filename) {
    return res.status(400).json({ error: "Missing filename query parameter" });
  }

  const date =
    (req.query.date as string) ||
    new Date().toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const message = (req.query.message as string) || "<3";
  const section = (req.query.section as string) || "polaroid";

  if (section !== "polaroid" && section !== "film") {
    return res.status(400).json({ error: "Section must be 'polaroid' or 'film'" });
  }

  try {
    const blob = await put(`photos/${filename}`, req, {
      access: "public",
      addRandomSuffix: true,
    });

    const maxOrder = await sql`
      SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order
      FROM photos WHERE section = ${section}
    `;
    const sortOrder = maxOrder.rows[0].next_order;

    const result = await sql`
      INSERT INTO photos (src, date, message, section, added_by, sort_order)
      VALUES (${blob.url}, ${date}, ${message}, ${section}, ${user.username}, ${sortOrder})
      RETURNING id, src, date, message, section, added_by, added_at, sort_order
    `;

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
