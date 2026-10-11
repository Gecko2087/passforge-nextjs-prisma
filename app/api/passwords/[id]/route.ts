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

        const { encryptedPassword, ...metadata } = password;
        return NextResponse.json({
            ...metadata,
            decryptedPassword: cryptr.decrypt(encryptedPassword),
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

        const allowed = new Set(['title', 'password', 'categoryId', 'length',
            'hasUppercase', 'hasLowercase', 'hasNumbers', 'hasSymbols']);
        if (!body || typeof body !== 'object' || Array.isArray(body) ||
            Object.keys(body).some(key => !allowed.has(key))) {
            return NextResponse.json({ error: 'Campos no permitidos' }, { status: 400 });
        }
        const updateData: {
            title?: string; encryptedPassword?: string; categoryId?: string | null;
            length?: number; hasUppercase?: boolean; hasLowercase?: boolean;
            hasNumbers?: boolean; hasSymbols?: boolean;
        } = {};
        if ('title' in body) {
            if (typeof body.title !== 'string' || !body.title) {
                return NextResponse.json({ error: 'Título inválido' }, { status: 400 });
            }
            updateData.title = body.title;
        }
        if ('password' in body) {
            if (typeof body.password !== 'string' || !body.password) {
                return NextResponse.json({ error: 'Contraseña inválida' }, { status: 400 });
            }
            updateData.encryptedPassword = cryptr.encrypt(body.password);
        }
        if ('categoryId' in body) {
            if (body.categoryId !== null &&
                (typeof body.categoryId !== 'string' || !body.categoryId)) {
                return NextResponse.json({ error: 'Categoría inválida' }, { status: 400 });
            }
            if (body.categoryId !== null) {
                const category = await prisma.category.findFirst({
                    where: { id: body.categoryId, userId: session.user.id },
                });
                if (!category) {
                    return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
                }
            }
            updateData.categoryId = body.categoryId;
        }
        if ('length' in body) {
            if (!Number.isInteger(body.length) || body.length < 1) {
                return NextResponse.json({ error: 'Longitud inválida' }, { status: 400 });
            }
            updateData.length = body.length;
        }
        for (const key of ['hasUppercase', 'hasLowercase', 'hasNumbers', 'hasSymbols'] as const) {
            if (key in body) {
                if (typeof body[key] !== 'boolean') {
                    return NextResponse.json({ error: 'Opciones inválidas' }, { status: 400 });
                }
                updateData[key] = body[key];
            }
        }

        const updated = await prisma.password.update({
            where: { id, userId: session.user.id },
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
