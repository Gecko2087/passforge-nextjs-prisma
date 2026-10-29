import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, anonymous } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import { getPrisma } from "./prisma";
import { reserveDemoSlot } from "./demo";
import { getRuntimeEnv } from "./runtime";

export function getAuth() {
  const env = getRuntimeEnv();
  if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) {
    throw new Error("Invalid authentication configuration");
  }
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [new URL(env.BETTER_AUTH_URL).origin],
    database: prismaAdapter(getPrisma(), { provider: "sqlite", transaction: false }),
    emailAndPassword: { enabled: false },
    plugins: [anonymous({ generateName: () => "Visitante demo" }), admin({ defaultRole: "user" })],
    session: { expiresIn: 60 * 60, updateAge: 60 * 60, cookieCache: { enabled: false } },
    advanced: { useSecureCookies: new URL(env.BETTER_AUTH_URL).protocol === "https:",
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] } },
    rateLimit: {
      enabled: true, storage: "database", window: 60, max: 60,
      customStorage: { async consume(key, rule) {
        const now = Date.now(), cutoff = now - rule.window * 1000;
        const row = await env.DB.prepare(`INSERT INTO rateLimit (id, key, count, lastRequest)
          VALUES (?, ?, 1, ?) ON CONFLICT(key) DO UPDATE SET
          count = CASE WHEN lastRequest <= ? THEN 1 ELSE MIN(count + 1, ?) END,
          lastRequest = CASE WHEN lastRequest <= ? THEN excluded.lastRequest ELSE lastRequest END
          RETURNING count, lastRequest`)
          .bind(crypto.randomUUID(), key, now, cutoff, rule.max + 1, cutoff)
          .first<{count:number; lastRequest:number}>();
        return { allowed: !!row && row.count <= rule.max,
          retryAfter: row && row.count > rule.max ? Math.max(1, Math.ceil((row.lastRequest + rule.window * 1000 - now) / 1000)) : null };
      } },
      customRules: { "/sign-in/anonymous": { window: 60, max: 3 } },
    },
    databaseHooks: { user: { create: { before: async user => {
      if (!user.isAnonymous || !await reserveDemoSlot()) {
        throw new APIError("TOO_MANY_REQUESTS", { message: "La demo alcanzó su cupo diario." });
      }
      return { data: user };
    } } } },
    user: { additionalFields: {
      role: { type: "string", required: false, defaultValue: "user", input: false },
    } },
  });
}
export type Session = ReturnType<typeof getAuth>["$Infer"]["Session"];
