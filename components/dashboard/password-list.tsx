"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CopyIcon, FolderOpen, Loader2, KeyRound } from "lucide-react"
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
    decryptedPassword: string;
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
    const { data: passwords, error, isPending } = useQuery({
        queryKey: ["passwords"],
        queryFn: fetchPasswords,
    });

    const handleCopy = (password: string) => {
        navigator.clipboard.writeText(password).then(() => {
            toast.success("Contraseña copiada");
        });
    };

    if (isPending) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <p className="text-center text-red-500 py-8">
                Error: {error.message}
            </p>
        );
    }

    if (!passwords?.length) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <Card>
                    <CardContent className="flex flex-col items-center py-12">
                        <KeyRound className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Sin contraseñas guardadas</h3>
                        <p className="text-muted-foreground text-center">
                            Genera y guarda tu primera contraseña
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
                    Tus contraseñas están protegidas. Cópialas cuando las necesites.
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
                                                onClick={() => handleCopy(item.decryptedPassword)}
                                            >
                                                <CopyIcon className="h-4 w-4" />
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