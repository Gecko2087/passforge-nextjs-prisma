import { auth } from "./auth";
import { headers } from "next/headers";
import { consumeDemoRequest, demoEnabled } from "./demo";

export async function getServerSession() {
    const requestHeaders = await headers();
    const origin = requestHeaders.get('origin');
    const configuredOrigin = process.env.BETTER_AUTH_URL ? new URL(process.env.BETTER_AUTH_URL).origin : null;
    if (origin && configuredOrigin && origin !== configuredOrigin) return null;
    const session = await auth.api.getSession({
        headers: requestHeaders,
    });
    if (session && demoEnabled && !await consumeDemoRequest(session.user)) return null;
    return session;
}

export async function requireAuth() {
    const session = await getServerSession();

    if (!session) {
        throw new Error("No autorizado");
    }

    return session;
}

export async function requireAdmin() {
    const session = await requireAuth();

    if (session.user.role !== "admin") {
        throw new Error("Acceso denegado: se requiere rol de administrador");
    }

    return session;
}
