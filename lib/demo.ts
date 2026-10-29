import { getRuntimeEnv } from "./runtime";

// This deployment is exclusively a synthetic-data demo, with no credential accounts.
export const demoEnabled = true;
const lifetime = 60 * 60 * 1000;

export async function reserveDemoSlot(now = new Date()) {
  const db = getRuntimeEnv().DB;
  const id = now.toISOString().slice(0, 10);
  // Conditional UPSERT reserves a slot atomically, even for concurrent visitors.
  const reserved = await db.prepare(`INSERT INTO DemoBudget (id, sessions) VALUES (?, 1)
    ON CONFLICT(id) DO UPDATE SET sessions = sessions + 1 WHERE sessions < 100
    RETURNING sessions`).bind(id).first();
  if (!reserved) return false;
  await db.batch([
    db.prepare(`DELETE FROM user WHERE isAnonymous = 1 AND createdAt < ?`)
      .bind(new Date(now.getTime() - lifetime).toISOString()),
    db.prepare(`DELETE FROM DemoBudget WHERE id < ?`).bind(id),
    db.prepare(`DELETE FROM rateLimit WHERE lastRequest < ?`).bind(now.getTime() - 86400000),
  ]);
  return true;
}

export async function consumeDemoRequest(user: { id: string; createdAt: Date; isAnonymous?: boolean | null }) {
  if (!user.isAnonymous) return false;
  const now = new Date();
  const expiresAt = new Date(new Date(user.createdAt).getTime() + lifetime);
  if (expiresAt <= now) return false;
  const used = await getRuntimeEnv().DB.prepare(`
    INSERT INTO DemoUsage (userId, requests, expiresAt) VALUES (?, 1, ?)
    ON CONFLICT(userId) DO UPDATE SET requests = requests + 1
    WHERE requests < 200 AND expiresAt > ? RETURNING requests`)
    .bind(user.id, expiresAt.toISOString(), now.toISOString()).first();
  return !!used;
}
