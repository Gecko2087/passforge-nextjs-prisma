"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    FolderOpen,
    Key,
    Copy,
    Trash2,
    Loader2,
    Lock
} from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Category {
    id: string;
    name: string;
    description: string | null;
    color: string;
    passwords: Password[];
}

interface Password {
    id: string;
    title: string;
    encryptedPassword: string;
    decryptedPassword?: string;
    length: number;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSymbols: boolean;
    createdAt: string;
}

async function fetchCategory(id: string): Promise<Category> {
    const res = await fetch(`/api/categories/${id}`);
    if (!res.ok) {
        if (res.status === 401) throw new Error("Sesión expirada");
        if (res.status === 404) throw new Error("Categoría no encontrada");
        throw new Error("Error al cargar");
    }
    return res.json();
}

async function fetchPasswordsByCategory(categoryId: string): Promise<Password[]> {
    const res = await fetch(`/api/passwords?categoryId=${categoryId}`);
    if (!res.ok) {
        if (res.status === 401) throw new Error("Sesión expirada");
        throw new Error("Error al cargar contraseñas");
    }
    return res.json();
}

export default function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const queryClient = useQueryClient();

    const { data: category, isLoading: isLoadingCategory, error: categoryError } = useQuery({
        queryKey: ["category", id],
        queryFn: () => fetchCategory(id),
    });

    const { data: passwords = [], isLoading: isLoadingPasswords } = useQuery({
        queryKey: ["passwords", "category", id],
        queryFn: () => fetchPasswordsByCategory(id),
        enabled: !!category,
    });

    const deleteMutation = useMutation({
        mutationFn: async (passwordId: string) => {
            const res = await fetch(`/api/passwords/${passwordId}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al eliminar");
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Contraseña eliminada");
            queryClient.invalidateQueries({ queryKey: ["passwords", "category", id] });
            queryClient.invalidateQueries({ queryKey: ["category", id] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const handleCopyPassword = (password: string, title: string) => {
        navigator.clipboard.writeText(password).then(() => {
            toast.success(`Contraseña de "${title}" copiada`);
        });
    };

    if (isLoadingCategory) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    if (categoryError || !category) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Categoría no encontrada</h1>
                    <p className="text-muted-foreground mb-4">
                        La categoría que buscas no existe o fue eliminada.
                    </p>
                    <Link href="/categories">
                        <Button>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a categorías
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Link href="/categories">
                        <Button variant="ghost" size="icon" className="mt-1">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-3 rounded-xl"
                                style={{ backgroundColor: `${category.color}20` }}
                            >
                                <FolderOpen
                                    className="h-6 w-6"
                                    style={{ color: category.color }}
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{category.name}</h1>
                                <p className="text-muted-foreground">
                                    {category.description || "Sin descripción"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Passwords List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Key className="h-5 w-5 text-violet-500" />
                            Contraseñas guardadas
                        </h2>
                        <span className="text-sm text-muted-foreground">
                            {passwords.length} contraseña(s)
                        </span>
                    </div>

                    {isLoadingPasswords ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                        </div>
                    ) : passwords.length > 0 ? (
                        <div className="grid gap-3">
                            {passwords.map((pwd) => (
                                <Card key={pwd.id} className="group hover:border-violet-500/50 transition-colors">
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-violet-500/10">
                                                <Lock className="h-5 w-5 text-violet-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{pwd.title}</h3>
                                                <p className="text-sm text-muted-foreground font-mono">
                                                    {"•".repeat(Math.min(pwd.length, 16))}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                                                onClick={() => handleCopyPassword(
                                                    pwd.decryptedPassword || pwd.encryptedPassword,
                                                    pwd.title
                                                )}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Eliminar contraseña?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer. La contraseña
                                                            &quot;{pwd.title}&quot; será eliminada permanentemente.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-red-600 hover:bg-red-700"
                                                            onClick={() => deleteMutation.mutate(pwd.id)}
                                                        >
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center py-12">
                                <Key className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Sin contraseñas</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    No hay contraseñas guardadas en esta categoría.
                                </p>
                                <Link href="/">
                                    <Button>
                                        Ir al generador
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
