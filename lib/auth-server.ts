import { auth } from "./auth";
import { headers } from "next/headers";

export async function getServerSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
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
