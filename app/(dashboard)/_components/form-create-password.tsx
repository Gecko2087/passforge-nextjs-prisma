"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CaseLower, CaseUpper, CopyIcon, ArrowUp01, Hash, ShieldCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { generatePassword, PasswordConfig } from "@/lib/password"
import { useForm } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import FormSavePassword from "./form-save-password"
import { Logo } from "@/components/logo"

const options = [
    {
        key: "hasUppercase",
        label: "Mayúsculas (A-Z)",
        icon: <CaseUpper />
    },
    {
        key: "hasLowercase",
        label: "Minúsculas (a-z)",
        icon: <CaseLower />
    },
    {
        key: "hasNumbers",
        label: "Números (0-9)",
        icon: <ArrowUp01 />
    },
    {
        key: "hasSymbols",
        label: "Simbolos (!@#$%^&*()_+~`|}{[]:;?><,./-=)",
        icon: <Hash />
    }
] as const

const FormCreatePassword = () => {
    const [password, setPassword] = useState("");

    const form = useForm<PasswordConfig>({
        defaultValues: {
            hasLowercase: true,
            hasUppercase: true,
            hasNumbers: true,
            hasSymbols: true,
            length: 8
        }
    })

    useEffect(() => {
        const generated = generatePassword({
            hasLowercase: true,
            hasUppercase: true,
            hasNumbers: true,
            hasSymbols: true,
            length: 10
        })

        setPassword(generated)
    }, [])

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(password).then(() => {
            toast.success("Password copiada en el portapapeles");
        });
    };

    const handleGenerate = () => {
        const values = form.getValues()
        const newPassword = generatePassword(values)
        setPassword(newPassword)
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <header className="text-center space-y-2">
                <div className="flex justify-center mb-2">
                    <Logo className="h-12 w-auto" />
                </div>
                <p className="text-gray-600">Generador de contraseñas seguras y personalizadas</p>
            </header>

            <Card className="bg-gradient-to-r from-gray-900 to-gray-800">
                <CardContent className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-400 mb-1">
                            Tu contraseña generada:
                        </p>
                        <p className="text-xl font-mono break-all text-green-400 leading-relaxed">
                            {password}
                        </p>
                    </div>
                    <Button
                        onClick={handleCopyPassword}
                        className="shrink-0 bg-blue-600 hover:bg-blue-700
                        text-white px-4 py-2 rounded-lg transition-all 
                        duration-200 hover:scale-105 cursor-pointer">
                        <CopyIcon />
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuración</h2>
                    <Form {...form}>
                        <form
                            className="space-y-6"
                            onSubmit={form.handleSubmit(handleGenerate)}
                        >
                            <FormField
                                control={form.control}
                                name="length"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">
                                            Longitud de la contraseña
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                className="text-center text-lg font-semibold h-12"
                                                min={4}
                                                max={128}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-700">Incluir caracteres</h3>
                                <div className="grid grid-cols-2 sm-grid-cols-3 gap-3">
                                    {
                                        options.map(({ key, label, icon }) => (
                                            <FormField
                                                key={key}
                                                control={form.control}
                                                name={key}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium text-gray-700">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                            <span className="text-xl">
                                                                {icon}
                                                            </span>
                                                            <div>
                                                                <p>{label}</p>
                                                            </div>
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                            >
                                <ShieldCheck />
                                Generar nueva contraseña
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-3">
                        <FormSavePassword
                            password={password}
                            passwordConfig={form.watch()}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default FormCreatePassword