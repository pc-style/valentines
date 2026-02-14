import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { sql } from "../../_db.js";
import { getWebAuthnConfig } from "../../_webauthn.js";
import { storeChallenge } from "../../_challenges.js";

const ALLOWED_USERS = ["adas", "roksanka"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, registrationKey } = req.body || {};

  if (!username || !ALLOWED_USERS.includes(username)) {
    return res.status(400).json({ error: "Invalid username" });
  }

  if (registrationKey !== process.env.REGISTRATION_KEY) {
    return res.status(401).json({ error: "Invalid registration key" });
  }

  try {
    // Ensure user exists
    await sql`INSERT INTO users (username) VALUES (${username}) ON CONFLICT (username) DO NOTHING`;
    const userResult = await sql`SELECT id FROM users WHERE username = ${username}`;
    const userId = userResult.rows[0].id;

    // Check passkey count
    const passkeyCount = await sql`SELECT COUNT(*) as count FROM passkeys WHERE user_id = ${userId}`;
    if (Number(passkeyCount.rows[0].count) >= 3) {
      return res.status(400).json({ error: "Maximum passkeys reached (3)" });
    }

    // Get existing passkeys for exclusion
    const existingPasskeys = await sql`SELECT id, transports FROM passkeys WHERE user_id = ${userId}`;

    const { rpName, rpID } = getWebAuthnConfig();

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: username,
      attestationType: "none",
      excludeCredentials: existingPasskeys.rows.map((p) => ({
        id: p.id as string,
        transports: (p.transports || []) as AuthenticatorTransportFuture[],
      })),
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "preferred",
      },
    });

    await storeChallenge(username, options.challenge);

    return res.status(200).json(options);
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
