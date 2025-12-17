import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/categories/[id]
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;

        const category = await prisma.category.findFirst({
            where: { id, userId: session.user.id },
            include: {
                passwords: {
                    select: { id: true, title: true, createdAt: true },
                },
            },
        });

        if (!category) {
            return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

// PUT /api/categories/[id]
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const existing = await prisma.category.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
        }

        const { name, description, color } = body;

        const updated = await prisma.category.update({
            where: { id },
            data: {
                ...(name && { name: name.trim() }),
                ...(description !== undefined && { description: description?.trim() || null }),
                ...(color && { color }),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

// DELETE /api/categories/[id]
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;

        const existing = await prisma.category.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
        }

        await prisma.category.delete({ where: { id } });

        return NextResponse.json({ message: "Categoría eliminada" });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
