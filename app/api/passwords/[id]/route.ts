import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cryptr } from "@/lib/cripto";
import { getServerSession } from "@/lib/auth-server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/passwords/[id]
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;

        const password = await prisma.password.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
            include: {
                category: {
                    select: { id: true, name: true, color: true },
                },
            },
        });

        if (!password) {
            return NextResponse.json({ error: "Contraseña no encontrada" }, { status: 404 });
        }

        return NextResponse.json({
            ...password,
            decryptedPassword: cryptr.decrypt(password.encryptedPassword),
        });
    } catch (error) {
        console.error("Error fetching password:", error);
        return NextResponse.json({ error: "Error al obtener contraseña" }, { status: 500 });
    }
}

// PUT /api/passwords/[id]
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const existing = await prisma.password.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Contraseña no encontrada" }, { status: 404 });
        }

        const { title, password, categoryId, ...rest } = body;
        const updateData: Record<string, unknown> = { ...rest };

        if (title) updateData.title = title;
        if (password) updateData.encryptedPassword = cryptr.encrypt(password);
        if (categoryId !== undefined) updateData.categoryId = categoryId;

        const updated = await prisma.password.update({
            where: { id },
            data: updateData,
            include: {
                category: { select: { id: true, name: true, color: true } },
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating password:", error);
        return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }
}

// DELETE /api/passwords/[id]
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;

        const existing = await prisma.password.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Contraseña no encontrada" }, { status: 404 });
        }

        await prisma.password.delete({ where: { id } });

        return NextResponse.json({ message: "Contraseña eliminada" });
    } catch (error) {
        console.error("Error deleting password:", error);
        return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
    }
}
