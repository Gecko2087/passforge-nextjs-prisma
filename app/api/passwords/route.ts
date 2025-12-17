import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { cryptr } from "@/lib/cripto";
import { getServerSession } from "@/lib/auth-server";

// GET /api/passwords - Obtener contraseñas del usuario autenticado
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();

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
            include: {
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

        const decryptedPasswords = passwords.map((pwd) => ({
            ...pwd,
            decryptedPassword: cryptr.decrypt(pwd.encryptedPassword),
        }));

        return NextResponse.json(decryptedPasswords);
    } catch (error) {
        console.error("Error fetching passwords:", error);
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

        const encryptedPassword = cryptr.encrypt(password);

        const newPassword = await prisma.password.create({
            data: {
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

        return NextResponse.json(newPassword, { status: 201 });
    } catch (error) {
        console.error("Error creating password:", error);
        return NextResponse.json(
            { error: "Error al crear contraseña" },
            { status: 500 }
        );
    }
}
