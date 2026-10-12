"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogIn, KeyRound } from "lucide-react";
import { toast } from "sonner";

// Traducciones de errores comunes
const translateError = (error: string): string => {
    const translations: Record<string, string> = {
        "User already exists. Use another email.": "El usuario ya existe. Usa otro email.",
        "Invalid email or password": "Email o contraseña incorrectos",
        "User not found": "Usuario no encontrado",
        "Invalid password": "Contraseña incorrecta",
        "Email is required": "El email es requerido",
        "Password is required": "La contraseña es requerida",
        "Too many requests": "Demasiados intentos. Espera un momento.",
        "Account is locked": "La cuenta está bloqueada",
    };
    return translations[error] || error;
};

export default function LoginClient({ demoMode }: { demoMode: boolean }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState(false);

    const handleLogin = async (emailValue: string, passwordValue: string) => {
        setLoading(true);

        try {
            const result = await signIn.email({
                email: emailValue,
                password: passwordValue,
                callbackURL: "/",
            });

            if (result.error) {
                const errorMsg = result.error.message || "Error al iniciar sesión";
                toast.error(translateError(errorMsg));
            } else {
                toast.success("Sesión iniciada correctamente");
                window.location.href = "/";
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLogin(email, password);
    };

    const handleDemoLogin = async () => {
        setDemoLoading(true);
        try {
            const result = await signIn.anonymous();
            if (result.error) toast.error(result.error.message || "No se pudo iniciar la demo");
            else window.location.href = "/";
        } catch { toast.error("Error de conexión"); }
        finally { setDemoLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background via-background to-violet-950/20">
            <Card className="w-full max-w-md border-border/50 shadow-2xl">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-linear-to-r from-violet-600 to-indigo-600 blur-xl opacity-50 rounded-full" />
                            <div className="relative bg-linear-to-r from-violet-600 to-indigo-600 p-4 rounded-2xl">
                                <KeyRound className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        {demoMode ? "Probá PassForge" : "Iniciar Sesión"}
                    </CardTitle>
                    <CardDescription>
                        {demoMode ? "Entrá sin registrarte a un espacio de prueba individual." : "Ingresa tus credenciales para acceder"}
                    </CardDescription>
                </CardHeader>
                {demoMode ? (
                    <>
                        <CardContent className="space-y-3 pt-4 text-sm text-muted-foreground">
                            <p>Tu acceso vence en una hora. Podés generar, guardar y organizar claves en este espacio de prueba.</p>
                            <p>Usá solo claves ficticias: no ingreses contraseñas reales ni datos personales.</p>
                        </CardContent>
                        <CardFooter className="pt-4">
                            <Button
                                type="button"
                                className="w-full bg-linear-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500"
                                onClick={handleDemoLogin}
                                disabled={demoLoading}
                                aria-busy={demoLoading}
                            >
                                {demoLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                                {demoLoading ? "Preparando tu espacio demo…" : "Entrar como visitante"}
                            </Button>
                        </CardFooter>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 pt-6">
                            <Button
                                type="submit"
                                className="w-full bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <LogIn className="h-4 w-4 mr-2" />
                                )}
                                Iniciar Sesión
                            </Button>
                            <p className="text-sm text-muted-foreground text-center pt-2">
                                ¿No tienes cuenta?{" "}
                                <Link href="/registro" className="text-violet-500 hover:text-violet-400 hover:underline">
                                    Regístrate
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    );
}
