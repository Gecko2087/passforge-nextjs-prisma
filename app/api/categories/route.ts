import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-server";

// GET /api/categories
export async function GET() {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const categories = await prisma.category.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                _count: {
                    select: { passwords: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 });
    }
}

// POST /api/categories
export async function POST(request: Request) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, color } = body;

        if (!name?.trim()) {
            return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                color: color || "#6366f1",
                userId: session.user.id,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json({ error: "Error al crear categoría" }, { status: 500 });
    }
}
