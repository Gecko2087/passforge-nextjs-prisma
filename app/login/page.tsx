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

// Credenciales del usuario demo
const DEMO_CREDENTIALS = {
    email: "demo@passforge.com",
    password: "Demo123!"
};

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

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState(false);

    const handleLogin = async (emailValue: string, passwordValue: string, isDemo = false) => {
        if (isDemo) {
            setDemoLoading(true);
        } else {
            setLoading(true);
        }

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
            setDemoLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLogin(email, password, false);
    };

    const handleDemoLogin = async () => {
        setEmail(DEMO_CREDENTIALS.email);
        setPassword(DEMO_CREDENTIALS.password);
        await handleLogin(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password, true);
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
                        Iniciar Sesión
                    </CardTitle>
                    <CardDescription>
                        Ingresa tus credenciales para acceder
                    </CardDescription>
                </CardHeader>
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
                            disabled={loading || demoLoading}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <LogIn className="h-4 w-4 mr-2" />
                            )}
                            Iniciar Sesión
                        </Button>

                        {/* Separador */}
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">o prueba con</span>
                            </div>
                        </div>

                        {/* Botón de usuario demo */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
                            onClick={handleDemoLogin}
                            disabled={loading || demoLoading}
                        >
                            {demoLoading && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            Entrar como usuario demo
                        </Button>

                        <p className="text-sm text-muted-foreground text-center pt-2">
                            ¿No tienes cuenta?{" "}
                            <Link href="/registro" className="text-violet-500 hover:text-violet-400 hover:underline">
                                Regístrate
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
