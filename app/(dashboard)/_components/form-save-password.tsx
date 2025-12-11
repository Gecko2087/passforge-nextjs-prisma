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
import { SaveIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { passwordSchema, PasswordSchemaType } from "@/schema/password.schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { PasswordConfig } from "@/lib/password"
import PasswordOptionsTags from "./password-options-tags"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CreatePasswordAction } from "../_actions/create-password.action"

interface Props {
    password: string
    passwordConfig: PasswordConfig
}

export function FormSavePassword({ password, passwordConfig }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<PasswordSchemaType>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            title: "",
            password: "",

        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                title: "",
                password: password,
                length: typeof passwordConfig.length === 'string'
                    ? parseInt(passwordConfig.length)
                    : passwordConfig.length,
                hasUppercase: passwordConfig.hasUppercase,
                hasLowercase: passwordConfig.hasLowercase,
                hasNumbers: passwordConfig.hasNumbers,
                hasSymbols: passwordConfig.hasSymbols,
            });
        }
    }, [isOpen, password, passwordConfig, form]);

    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: CreatePasswordAction,
        async onSuccess(data) {
            toast.success(`Password ${data.title} fue guardada con éxito 🎉`)
            setIsOpen(false);
            // Reset form after closing to avoid conflicts with useEffect
            setTimeout(() => {
                form.reset({
                    title: "",
                    password: "",
                });
            }, 100);
            // TODO: revalidar la data
            queryClient.invalidateQueries({
                queryKey: ["passwords"],
            });
        },
        onError(error) {
            toast.error(`ERROR: ${error.message}`);
        }
    });

    function onSubmit(values: PasswordSchemaType) {
        mutate(values);
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"
                    className="w-full"
                >
                    <SaveIcon />
                    Guardar contraseña</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <SaveIcon />
                        Guardar contraseña
                    </DialogTitle>
                    <DialogDescription>
                        Guarda tu contraseña generada de forma segura con toda su configuración.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(
                        onSubmit,
                        (errors) => console.error("Form validation errors:", errors)
                    )} className="space-y-6">
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título de la contraseña</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Google, Gmail, Facebook..." {...field}
                                                className="h-12"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña generada</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled
                                                {...field}
                                                className="h-12 bg-gray-100 font-mono text-gray-800"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-blue-800 mb-3">Configuración aplicada</h3>
                                <div className="space-y-4 text-sm">
                                    <p>
                                        <span className="font-bold">Longitud: </span>
                                        {passwordConfig.length} caracteres
                                    </p>
                                    <PasswordOptionsTags
                                        passwordConfig={passwordConfig}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button
                                disabled={isPending}
                                type="submit"
                            >
                                Guardar contraseña
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default FormSavePassword