"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, FolderOpen, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

interface Category {
    id: string;
    name: string;
    description: string | null;
    color: string;
    createdAt: string;
    _count: {
        passwords: number;
    };
}

export default function CategoriesPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#6366f1");
    const queryClient = useQueryClient();

    const { data: categories, isLoading } = useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await fetch("/api/categories");
            if (!res.ok) {
                if (res.status === 401) throw new Error("Sesión expirada");
                throw new Error("Error al cargar");
            }
            return res.json();
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: { name: string; description: string; color: string }) => {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Error");
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Categoría creada");
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setIsCreateOpen(false);
            resetForm();
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: { name: string; description: string; color: string } }) => {
            const res = await fetch(`/api/categories/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Error");
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Categoría actualizada");
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setEditCategory(null);
            resetForm();
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Error");
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Categoría eliminada");
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const resetForm = () => {
        setName("");
        setDescription("");
        setColor("#6366f1");
    };

    const handleCreate = () => {
        if (!name.trim()) return;
        createMutation.mutate({ name, description, color });
    };

    const handleUpdate = () => {
        if (!editCategory || !name.trim()) return;
        updateMutation.mutate({
            id: editCategory.id,
            data: { name, description, color },
        });
    };

    const openEdit = (cat: Category) => {
        setEditCategory(cat);
        setName(cat.name);
        setDescription(cat.description || "");
        setColor(cat.color);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Categorías</h1>
                        <p className="text-muted-foreground">
                            Organiza tus contraseñas
                        </p>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Nueva
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nueva Categoría</DialogTitle>
                                <DialogDescription>
                                    Crea una categoría para organizar tus contraseñas
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Nombre</Label>
                                    <Input
                                        placeholder="Redes Sociales"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descripción</Label>
                                    <Input
                                        placeholder="Opcional"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            className="w-16 h-10 p-1 cursor-pointer"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                        />
                                        <Input
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleCreate} disabled={!name || createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    Crear
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {categories && categories.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {categories.map((cat) => (
                            <Link key={cat.id} href={`/categories/${cat.id}`}>
                                <Card className="relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-violet-500/50 group">
                                    <div
                                        className="absolute top-0 left-0 w-full h-1 transition-all group-hover:h-2"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <FolderOpen className="h-5 w-5" style={{ color: cat.color }} />
                                            {cat.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {cat.description || "Sin descripción"}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">
                                                {cat._count.passwords} contraseña(s)
                                            </span>
                                            <div className="flex gap-1" onClick={(e) => e.preventDefault()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); openEdit(cat); }}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={(e) => { e.preventDefault(); deleteMutation.mutate(cat.id); }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center py-12">
                            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Sin categorías</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Crea tu primera categoría
                            </p>
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Crear
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <Dialog open={!!editCategory} onOpenChange={(open) => !open && setEditCategory(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Categoría</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Color</Label>
                                <div className="flex gap-2">
                                    <Input type="color" className="w-16 h-10 p-1" value={color} onChange={(e) => setColor(e.target.value)} />
                                    <Input value={color} onChange={(e) => setColor(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setEditCategory(null); resetForm(); }}>
                                Cancelar
                            </Button>
                            <Button onClick={handleUpdate} disabled={!name || updateMutation.isPending}>
                                {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Guardar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
