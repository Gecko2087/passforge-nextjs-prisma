import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas públicas que no requieren autenticación
const publicRoutes = ["/login", "/registro", "/api/auth"];

// Rutas que requieren rol de admin
const adminRoutes = ["/admin"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Permitir todas las rutas temporalmente para debug
    // TODO: Restaurar la protección después de verificar que el login funciona

    // Permitir rutas de API de auth
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // Verificar si es ruta pública
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(route + "/")
    );

    // Obtener token de sesión de cookies - probar múltiples nombres posibles
    const sessionToken =
        request.cookies.get("better-auth.session_token")?.value ||
        request.cookies.get("__Secure-better-auth.session_token")?.value ||
        request.cookies.get("session_token")?.value;

    // Si no hay sesión y no es ruta pública, redirigir a login
    if (!sessionToken && !isPublicRoute) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Si hay sesión y está en página de login/registro, redirigir a inicio
    if (sessionToken && (pathname === "/login" || pathname === "/registro")) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Para rutas de admin, la verificación de rol se hace en el componente
    // ya que el middleware no puede decodificar el token fácilmente

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
