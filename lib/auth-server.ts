import { getAuth } from "./auth";
import { headers } from "next/headers";
import { consumeDemoRequest, demoEnabled } from "./demo";
import { getRuntimeEnv } from "./runtime";

export async function getServerSession() {
    const requestHeaders = await headers();
    const origin = requestHeaders.get('origin');
    const configuredOrigin = new URL(getRuntimeEnv().BETTER_AUTH_URL).origin;
    if (origin && origin !== configuredOrigin) return null;
    const session = await getAuth().api.getSession({
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
