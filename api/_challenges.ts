const challenges = new Map<string, { challenge: string; expires: number }>();

export function storeChallenge(username: string, challenge: string): void {
  challenges.set(username, { challenge, expires: Date.now() + 5 * 60 * 1000 });
}

export function getChallenge(username: string): string | null {
  const entry = challenges.get(username);
  if (!entry || entry.expires < Date.now()) {
    challenges.delete(username);
    return null;
  }
  challenges.delete(username);
  return entry.challenge;
}
