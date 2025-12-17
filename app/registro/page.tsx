"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp, signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, KeyRound } from "lucide-react";
import { toast } from "sonner";

// Traducciones de errores comunes
const translateError = (error: string): string => {
    const translations: Record<string, string> = {
        "User already exists. Use another email.": "El usuario ya existe. Usa otro email.",
        "User already exists": "El usuario ya existe",
        "Invalid email": "Email inválido",
        "Email is required": "El email es requerido",
        "Password is required": "La contraseña es requerida",
        "Name is required": "El nombre es requerido",
        "Password too short": "La contraseña es muy corta",
        "Too many requests": "Demasiados intentos. Espera un momento.",
    };
    return translations[error] || error;
};

export default function RegistroPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setLoading(true);

        try {
            // Crear cuenta
            const signUpResult = await signUp.email({
                email,
                password,
                name,
            });

            if (signUpResult.error) {
                const errorMsg = signUpResult.error.message || "Error al registrarse";
                toast.error(translateError(errorMsg));
                return;
            }

            // Login automático después de registrar
            const signInResult = await signIn.email({
                email,
                password,
            });

            if (signInResult.error) {
                toast.success("Cuenta creada. Por favor inicia sesión.");
                window.location.href = "/login";
                return;
            }

            toast.success("¡Bienvenido!");
            window.location.href = "/";
        } catch {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
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
                        Crear Cuenta
                    </CardTitle>
                    <CardDescription>
                        Regístrate para guardar tus contraseñas
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Tu nombre"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
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
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                <UserPlus className="h-4 w-4 mr-2" />
                            )}
                            Crear Cuenta
                        </Button>
                        <p className="text-sm text-muted-foreground text-center pt-2">
                            ¿Ya tienes cuenta?{" "}
                            <Link href="/login" className="text-violet-500 hover:text-violet-400 hover:underline">
                                Inicia sesión
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
