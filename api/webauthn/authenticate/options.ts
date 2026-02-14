import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { sql } from "../../_db.js";
import { getWebAuthnConfig } from "../../_webauthn.js";
import { storeChallenge } from "../../_challenges.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username } = req.body || {};

  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  try {
    const userResult = await sql`SELECT id FROM users WHERE username = ${username}`;
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.rows[0].id;
    const passkeys = await sql`SELECT id, transports FROM passkeys WHERE user_id = ${userId}`;

    if (passkeys.rows.length === 0) {
      return res.status(400).json({ error: "No passkeys registered" });
    }

    const { rpID } = getWebAuthnConfig();

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: passkeys.rows.map((p) => ({
        id: p.id as string,
        transports: (p.transports || []) as AuthenticatorTransportFuture[],
      })),
    });

    await storeChallenge(username, options.challenge);

    return res.status(200).json(options);
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
