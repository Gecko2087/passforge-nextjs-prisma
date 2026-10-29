import { getAuth } from "@/lib/auth";

const allowed = new Set(["/api/auth/sign-in/anonymous", "/api/auth/get-session", "/api/auth/sign-out"]);
async function handle(request: Request) {
  if (!allowed.has(new URL(request.url).pathname)) {
    return Response.json({ error: "Ruta no disponible en la demo" }, { status: 404 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 2048) {
    return Response.json({ error: "Solicitud demasiado grande" }, { status: 413 });
  }
  return getAuth().handler(request);
}
export const POST = handle;
export const GET = handle;
