import type { VercelRequest, VercelResponse } from "@vercel/node";
import { deleteSession } from "../_auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await deleteSession(req);

  res.setHeader("Set-Cookie", "session=; HttpOnly; Path=/; Max-Age=0");
  return res.status(200).json({ ok: true });
}
