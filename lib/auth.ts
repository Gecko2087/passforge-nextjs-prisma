import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

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
        enabled: true,
        minPasswordLength: 6,
    },
    plugins: [
        admin({
            defaultRole: "user",
        }),
    ],
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 días
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutos
        },
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
