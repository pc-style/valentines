import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initDB } from "./_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = req.headers["x-registration-key"] || req.query.key;
  if (key !== process.env.REGISTRATION_KEY) {
    return res.status(401).json({ error: "Invalid key" });
  }

  try {
    await initDB();
    return res.status(200).json({ ok: true, message: "Migration complete" });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
