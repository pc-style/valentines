import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSessionUser } from "../_auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getSessionUser(req);
  if (!user) {
    return res.status(200).json({ authenticated: false });
  }

  return res.status(200).json({ authenticated: true, username: user.username });
}
