import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, anonymous } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import prisma from "./prisma";
import { demoEnabled, reserveDemoSlot } from "./demo";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [
        "http://localhost:3000",
        process.env.BETTER_AUTH_URL || "",
        process.env.NEXT_PUBLIC_APP_URL || "",
    ].filter(Boolean),
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: !demoEnabled,
        minPasswordLength: 6,
    },
    plugins: [
        ...(demoEnabled ? [anonymous({ generateName: () => "Visitante demo" })] : []),
        admin({
            defaultRole: "user",
        }),
    ],
    session: {
        expiresIn: demoEnabled ? 60 * 60 : 60 * 60 * 24 * 7,
        updateAge: demoEnabled ? 60 * 60 : 60 * 60 * 24,
        cookieCache: {
            enabled: !demoEnabled,
            maxAge: 60 * 5, // 5 minutos
        },
    },
    rateLimit: {
        enabled: true,
        storage: "database",
        window: 60,
        max: 60,
        customRules: { "/sign-in/anonymous": { window: 60, max: 3 } },
    },
    databaseHooks: {
        user: { create: { before: async user => {
            if (demoEnabled && (!user.isAnonymous || !await reserveDemoSlot())) {
                throw new APIError("TOO_MANY_REQUESTS", { message: "La demo alcanzó su cupo diario." });
            }
            return { data: user };
        } } },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
                input: false,
            },
        },
    },
});

export type Session = typeof auth.$Infer.Session;
