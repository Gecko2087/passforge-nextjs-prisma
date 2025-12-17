import "dotenv/config";
import { PrismaClient } from "../generated/prisma";
import { auth } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
    // Definimos las credenciales para el usuario de demostración
    const demoEmail = "demo@passforge.com";
    const demoPassword = "Demo123!";

    // Primero verificamos si ya existe el usuario para limpiar la base de datos
    const existingUser = await prisma.user.findUnique({
        where: { email: demoEmail }
    });

    if (existingUser) {
        // Si existe, borramos sus categorías asociadas primero
        await prisma.category.deleteMany({
            where: { userId: existingUser.id }
        });
        // Y luego eliminamos al usuario para empezar desde cero
        await prisma.user.delete({
            where: { email: demoEmail }
        });
    }

    // Creamos el usuario utilizando la API de Better Auth para asegurar que la contraseña se encripte correctamente
    try {
        await auth.api.signUpEmail({
            body: {
                email: demoEmail,
                password: demoPassword,
                name: "Usuario Demo",
            }
        });
    } catch (error) {
        console.error("Hubo un problema al crear el usuario demo:", error);
        throw error;
    }

    // Recuperamos el usuario recién creado de la base de datos
    const newUser = await prisma.user.findUnique({
        where: { email: demoEmail }
    });

    if (!newUser) {
        throw new Error("No se pudo encontrar el usuario después de crearlo.");
    }

    // Actualizamos el usuario para marcarlo como verificado y asignarle el rol de usuario
    await prisma.user.update({
        where: { id: newUser.id },
        data: {
            emailVerified: true,
            role: "user",
        }
    });

    // Finalmente, creamos algunas categorías de ejemplo para que el usuario tenga contenido inicial
    await Promise.all([
        prisma.category.create({
            data: {
                name: "Redes Sociales",
                description: "Facebook, Instagram, Twitter, etc.",
                color: "#3b82f6",
                userId: newUser.id,
            }
        }),
        prisma.category.create({
            data: {
                name: "Trabajo",
                description: "Cuentas de trabajo y profesionales",
                color: "#10b981",
                userId: newUser.id,
            }
        }),
        prisma.category.create({
            data: {
                name: "Entretenimiento",
                description: "Netflix, Spotify, Steam, etc.",
                color: "#8b5cf6",
                userId: newUser.id,
            }
        }),
    ]);
}

main()
    .catch((e) => {
        console.error("Error crítico en el proceso de seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
