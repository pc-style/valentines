export function getWebAuthnConfig() {
  return {
    rpName: process.env.WEBAUTHN_RP_NAME || "Nasza Historia",
    rpID: process.env.WEBAUTHN_RP_ID || "localhost",
    origin: process.env.WEBAUTHN_ORIGIN || "http://localhost:5173",
  };
}
