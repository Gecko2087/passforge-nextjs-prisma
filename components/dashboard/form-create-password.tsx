"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CaseLower, CaseUpper, CopyIcon, ArrowUp01, Hash, ShieldCheck, Sparkles, KeyRound } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { generatePassword, PasswordConfig } from "@/lib/password"
import { useForm } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import FormSavePassword from "./form-save-password"

const options = [
    {
        key: "hasUppercase",
        label: "Mayúsculas (A-Z)",
        icon: <CaseUpper className="h-5 w-5" />,
        color: "text-blue-500"
    },
    {
        key: "hasLowercase",
        label: "Minúsculas (a-z)",
        icon: <CaseLower className="h-5 w-5" />,
        color: "text-emerald-500"
    },
    {
        key: "hasNumbers",
        label: "Números (0-9)",
        icon: <ArrowUp01 className="h-5 w-5" />,
        color: "text-amber-500"
    },
    {
        key: "hasSymbols",
        label: "Símbolos (!@#$%...)",
        icon: <Hash className="h-5 w-5" />,
        color: "text-purple-500"
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
            length: 16
        }
    })

    useEffect(() => {
        const generated = generatePassword({
            hasLowercase: true,
            hasUppercase: true,
            hasNumbers: true,
            hasSymbols: true,
            length: 16
        })

        setPassword(generated)
    }, [])

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(password).then(() => {
            toast.success("Contraseña copiada al portapapeles");
        });
    };

    const handleGenerate = () => {
        const values = form.getValues()
        const newPassword = generatePassword(values)
        setPassword(newPassword)
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            {/* Header */}
            <header className="text-center space-y-4 py-8">
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-linear-to-r from-violet-600 to-indigo-600 blur-xl opacity-50 rounded-full" />
                        <div className="relative bg-linear-to-r from-violet-600 to-indigo-600 p-4 rounded-2xl">
                            <KeyRound className="h-10 w-10 text-white" />
                        </div>
                    </div>
                </div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    PassForge
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Genera contraseñas seguras, personalizadas y fáciles de guardar
                </p>
            </header>

            {/* Password Display Card */}
            <Card className="overflow-hidden border-0 shadow-2xl">
                <div className="bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-1">
                    <CardContent className="bg-linear-to-br from-slate-900/95 to-purple-900/95 backdrop-blur rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-amber-400" />
                            <span className="text-sm font-medium text-slate-300">Tu contraseña segura</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0 bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                                <p className="text-xl md:text-2xl font-mono break-all bg-linear-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent leading-relaxed tracking-wide">
                                    {password}
                                </p>
                            </div>
                            <Button
                                onClick={handleCopyPassword}
                                className="shrink-0 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white h-14 w-14 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-indigo-500/25"
                                size="icon"
                            >
                                <CopyIcon className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardContent>
                </div>
            </Card>

            {/* Configuration Card */}
            <Card className="border-border/50 shadow-xl">
                <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-violet-500" />
                        <span>Configuración</span>
                    </h2>
                    <Form {...form}>
                        <form
                            className="space-y-6"
                            onSubmit={form.handleSubmit(handleGenerate)}
                        >
                            {/* Length Input */}
                            <FormField
                                control={form.control}
                                name="length"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">
                                            Longitud de la contraseña
                                        </FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    className="text-center text-lg font-bold h-12 max-w-24 border-2 focus:border-violet-500"
                                                    min={4}
                                                    max={128}
                                                />
                                                <div className="flex-1 flex gap-2">
                                                    {[8, 12, 16, 24, 32].map((len) => (
                                                        <Button
                                                            key={len}
                                                            type="button"
                                                            variant={Number(field.value) === len ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => field.onChange(len)}
                                                            className={Number(field.value) === len
                                                                ? "bg-violet-600 hover:bg-violet-700"
                                                                : "hover:border-violet-500 hover:text-violet-500"}
                                                        >
                                                            {len}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Character Options */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Incluir caracteres</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {options.map(({ key, label, icon, color }) => (
                                        <FormField
                                            key={key}
                                            control={form.control}
                                            name={key}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel
                                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${field.value
                                                            ? 'border-violet-500/50 bg-violet-500/10 dark:bg-violet-500/5'
                                                            : 'border-border hover:border-muted-foreground/50'
                                                            }`}
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                                className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                                            />
                                                        </FormControl>
                                                        <span className={color}>
                                                            {icon}
                                                        </span>
                                                        <span className="text-sm font-medium">{label}</span>
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Generate Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <ShieldCheck className="h-5 w-5 mr-2" />
                                Generar nueva contraseña
                            </Button>
                        </form>
                    </Form>

                    {/* Save Button */}
                    <div className="mt-4">
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