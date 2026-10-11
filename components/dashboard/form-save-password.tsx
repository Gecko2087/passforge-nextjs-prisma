"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SaveIcon, Loader2, FolderOpen } from "lucide-react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { PasswordConfig } from "@/lib/password"
import PasswordOptionsTags from "./password-options-tags"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"

interface Props {
    password: string
    passwordConfig: PasswordConfig
    disabled?: boolean
}

interface Category {
    id: string;
    name: string;
    color: string;
}

const formSchema = z.object({
    title: z.string().trim().min(1, "Escribe un título para este registro."),
    password: z.string().min(4),
    categoryId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

async function createPassword(data: {
    title: string;
    password: string;
    length: number;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSymbols: boolean;
    categoryId?: string;
}) {
    const res = await fetch("/api/passwords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || "No se pudo guardar el registro.");
    }
    return res.json();
}

async function fetchCategories(): Promise<Category[]> {
    const res = await fetch("/api/categories");
    if (!res.ok) {
        if (res.status === 401) throw new Error("Sesión expirada. Vuelve a entrar para continuar.");
        throw new Error("No pudimos cargar las categorías.");
    }
    return res.json();
}

export default function FormSavePassword({ password, passwordConfig, disabled = false }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: categories = [], isPending: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
    });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            password: "",
            categoryId: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                title: "",
                password: password,
                categoryId: "",
            });
        }
    }, [isOpen, password, form]);

    const { mutate, isPending } = useMutation({
        mutationFn: (data: FormData) => createPassword({
            title: data.title,
            password: data.password,
            length: typeof passwordConfig.length === 'string'
                ? parseInt(passwordConfig.length)
                : (passwordConfig.length ?? 8),
            hasUppercase: passwordConfig.hasUppercase ?? false,
            hasLowercase: passwordConfig.hasLowercase ?? false,
            hasNumbers: passwordConfig.hasNumbers ?? false,
            hasSymbols: passwordConfig.hasSymbols ?? false,
            categoryId: data.categoryId || undefined,
        }),
        onSuccess(data) {
            toast.success(`Contraseña "${data.title}" guardada`);
            setIsOpen(false);
            form.reset();
            queryClient.invalidateQueries({ queryKey: ["passwords"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
        onError(error: Error) {
            toast.error(error.message);
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" disabled={disabled} className="w-full gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
                    <SaveIcon className="h-4 w-4" />
                    Guardar contraseña
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <SaveIcon className="h-5 w-5 text-emerald-500" />
                        Guardar contraseña
                    </DialogTitle>
                    <DialogDescription>
                        Añade la clave generada con un título y una categoría opcional.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Gmail, Facebook, Netflix..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <FolderOpen className="h-4 w-4" />
                                        Categoría (opcional)
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una categoría" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    <span className="flex items-center gap-2">
                                                        <span
                                                            className="h-3 w-3 rounded-full"
                                                            style={{ backgroundColor: category.color }}
                                                        />
                                                        {category.name}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {categoriesLoading && <p role="status" className="text-sm text-muted-foreground">Cargando categorías…</p>}
                                    {categoriesError && (
                                        <div role="alert" className="space-y-2 text-sm text-destructive">
                                            <p>No pudimos cargar las categorías.</p>
                                            <Button type="button" variant="link" className="h-auto p-0" onClick={() => refetchCategories()}>
                                                Reintentar
                                            </Button>
                                        </div>
                                    )}
                                    {!categoriesLoading && !categoriesError && categories.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            Puedes guardar sin categoría o <Link href="/categories" className="underline underline-offset-4">crear una categoría</Link>.
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contraseña</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            readOnly
                                            {...field}
                                            aria-label="Contraseña que se guardará"
                                            className="font-mono bg-muted text-emerald-600 dark:text-emerald-400"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="bg-muted/50 rounded-lg p-4 space-y-2 border">
                            <h4 className="text-sm font-medium">Configuración aplicada</h4>
                            <p className="text-sm text-muted-foreground">
                                Longitud: {passwordConfig.length ?? 8} caracteres
                            </p>
                            <PasswordOptionsTags passwordConfig={passwordConfig} />
                        </div>

                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                {isPending ? "Guardando…" : "Guardar registro"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
