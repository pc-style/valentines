import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
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
    const passkey = await sql`SELECT id, public_key, counter, transports FROM passkeys WHERE id = ${credential.id}`;
    if (passkey.rows.length === 0) {
      return res.status(400).json({ error: "Passkey not found" });
    }

    const storedPasskey = passkey.rows[0];
    const { rpID, origin } = getWebAuthnConfig();

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: storedPasskey.id,
        publicKey: new Uint8Array(storedPasskey.public_key),
        counter: Number(storedPasskey.counter),
        transports: (storedPasskey.transports || []) as AuthenticatorTransportFuture[],
      },
    });

    if (!verification.verified) {
      return res.status(400).json({ error: "Verification failed" });
    }

    // Update counter
    await sql`UPDATE passkeys SET counter = ${verification.authenticationInfo.newCounter} WHERE id = ${storedPasskey.id}`;

    // Get user and create session
    const userResult = await sql`
      SELECT u.id, u.username FROM passkeys p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ${storedPasskey.id}
    `;

    const sessionId = await createSession(userResult.rows[0].id);
    res.setHeader("Set-Cookie", setSessionCookie(sessionId));

    return res.status(200).json({ verified: true, username: userResult.rows[0].username });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
