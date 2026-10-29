import { NextResponse, NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { encryptPassword } from "@/lib/cripto";
import { getServerSession } from "@/lib/auth-server";

// GET /api/passwords - Obtener contraseñas del usuario autenticado
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        const prisma = getPrisma();

        if (!session) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        // Obtener categoryId del query parameter si existe
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");

        const passwords = await prisma.password.findMany({
            where: {
                userId: session.user.id,
                ...(categoryId && { categoryId }),
            },
            select: {
                id: true,
                title: true,
                length: true,
                hasUppercase: true,
                hasLowercase: true,
                hasNumbers: true,
                hasSymbols: true,
                createdAt: true,
                updatedAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(passwords);
    } catch (error) {
        console.error("password_list_failed");
        return NextResponse.json(
            { error: "Error al obtener contraseñas" },
            { status: 500 }
        );
    }
}


// POST /api/passwords - Crear nueva contraseña
export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        const prisma = getPrisma();

        if (!session) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, password, length, hasUppercase, hasLowercase, hasNumbers, hasSymbols, categoryId } = body;

        if (!title || !password) {
            return NextResponse.json(
                { error: "Título y contraseña son requeridos" },
                { status: 400 }
            );
        }

        if (categoryId) {
            const category = await prisma.category.findFirst({
                where: {
                    id: categoryId,
                    userId: session.user.id,
                },
            });

            if (!category) {
                return NextResponse.json(
                    { error: "Categoría no encontrada" },
                    { status: 404 }
                );
            }
        }

        const id = crypto.randomUUID();
        const encryptedPassword = await encryptPassword(password, session.user.id, id);

        const newPassword = await prisma.password.create({
            data: {
                id,
                title,
                encryptedPassword,
                length: length || password.length,
                hasUppercase: hasUppercase ?? false,
                hasLowercase: hasLowercase ?? false,
                hasNumbers: hasNumbers ?? false,
                hasSymbols: hasSymbols ?? false,
                userId: session.user.id,
                categoryId: categoryId || null,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
        });

        const { encryptedPassword: _encrypted, ...metadata } = newPassword;
        return NextResponse.json(metadata, { status: 201 });
    } catch (error) {
        console.error("password_create_failed");
        return NextResponse.json(
            { error: "Error al crear contraseña" },
            { status: 500 }
        );
    }
}
