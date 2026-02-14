import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { sql } from "../../_db.js";
import { getWebAuthnConfig } from "../../_webauthn.js";
import { getChallenge } from "../../_challenges.js";
import { createSession, setSessionCookie } from "../../_auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, credential } = req.body || {};

  if (!username || !credential) {
    return res.status(400).json({ error: "Missing username or credential" });
  }

  const expectedChallenge = await getChallenge(username);
  if (!expectedChallenge) {
    return res.status(400).json({ error: "Challenge expired or not found" });
  }

  try {
    const { rpID, origin } = getWebAuthnConfig();

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: "Verification failed" });
    }

    const { credential: registeredCredential } = verification.registrationInfo;

    const userResult = await sql`SELECT id FROM users WHERE username = ${username}`;
    const userId = userResult.rows[0].id;

    const publicKeyHex = "\\x" + Buffer.from(registeredCredential.publicKey).toString("hex");
    const transportsArray = credential.response?.transports || [];

    await sql`
      INSERT INTO passkeys (id, user_id, public_key, counter, transports)
      VALUES (${registeredCredential.id}, ${userId}, ${publicKeyHex}, ${registeredCredential.counter}, ${transportsArray})
    `;

    // Create session
    const sessionId = await createSession(userId);
    res.setHeader("Set-Cookie", setSessionCookie(sessionId));

    return res.status(200).json({ verified: true });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
