"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CopyIcon, FolderOpen, Loader2, KeyRound, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import PasswordOptionsTags from "./password-options-tags"
import PasswordDeleteDialog from "./password-delete-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Password {
    id: string;
    title: string;
    length: number;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSymbols: boolean;
    category?: {
        id: string;
        name: string;
        color: string;
    } | null;
}

async function fetchPasswords(): Promise<Password[]> {
    const res = await fetch("/api/passwords", { cache: "no-store" });
    if (!res.ok) {
        if (res.status === 401) throw new Error("Sesión expirada");
        throw new Error("Error al cargar contraseñas");
    }
    return res.json();
}

export default function PasswordList() {
    const [copyingId, setCopyingId] = useState<string | null>(null);
    const { data: passwords, error, isPending, refetch } = useQuery({
        queryKey: ["passwords"],
        queryFn: fetchPasswords,
    });

    const handleCopy = async (id: string) => {
        if (copyingId) return;
        setCopyingId(id);
        try {
            const res = await fetch(`/api/passwords/${encodeURIComponent(id)}`, { cache: "no-store" });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || "No se pudo cargar esta contraseña");
            }
            const data = await res.json();
            if (typeof data.decryptedPassword !== "string" || !data.decryptedPassword) {
                throw new Error("La contraseña no está disponible");
            }
            if (!navigator.clipboard?.writeText) throw new Error("El portapapeles no está disponible en este navegador");
            await navigator.clipboard.writeText(data.decryptedPassword);
            toast.success("Contraseña copiada");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo copiar la contraseña");
        } finally {
            setCopyingId(null);
        }
    };

    if (isPending) {
        return (
            <div role="status" aria-label="Cargando contraseñas" className="flex items-center justify-center gap-3 py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cargando tu bóveda…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div role="alert" className="mx-auto flex max-w-xl flex-col items-center gap-3 py-8 text-center">
                <p className="text-red-500">No pudimos cargar la bóveda. {error.message}</p>
                <Button type="button" variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reintentar
                </Button>
                <p className="text-sm text-muted-foreground">
                    Si la sesión venció, <Link href="/login" className="underline underline-offset-4">vuelve a entrar</Link>.
                </p>
            </div>
        );
    }

    if (!passwords?.length) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <Card>
                    <CardContent className="flex flex-col items-center py-12">
                        <KeyRound className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Tu bóveda está vacía</h3>
                        <p className="text-muted-foreground text-center">
                            Genera una clave de prueba arriba y elige <span className="font-medium">Guardar contraseña</span> para añadirla a la bóveda. En la demo, usa solo claves ficticias.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <section className="text-center space-y-1">
                <h2 className="text-2xl font-bold">Mis contraseñas guardadas</h2>
                <p className="text-sm text-muted-foreground">
                    Los valores no se cargan junto con la lista. Se solicitan al servidor cuando eliges copiarlos.
                </p>
            </section>

            <section className="space-y-4">
                {passwords.map(item => (
                    <Card key={item.id}>
                        <CardContent className="p-4 flex justify-between items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-bold truncate">{item.title}</p>
                                    {item.category && (
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                                            style={{
                                                backgroundColor: `${item.category.color}20`,
                                                color: item.category.color
                                            }}
                                        >
                                            <FolderOpen className="h-3 w-3" />
                                            {item.category.name}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Longitud: <span className="font-medium">{item.length}</span>
                                </p>
                                <PasswordOptionsTags passwordConfig={item} />
                            </div>
                            <div className="flex gap-1">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleCopy(item.id)}
                                                disabled={copyingId !== null}
                                                aria-label={`Copiar contraseña de ${item.title}`}
                                                title={`Copiar contraseña de ${item.title}`}
                                            >
                                                {copyingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CopyIcon className="h-4 w-4" />}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Copiar contraseña</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <PasswordDeleteDialog id={item.id} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>
        </div>
    );
}
