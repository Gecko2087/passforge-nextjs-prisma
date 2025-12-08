import { z } from "zod";

export const passwordSchema = z.object({
    title: z.string().trim().min(1, "Título requerido"),
    password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
    length: z.number().min(4).max(128).optional(),
    hasUppercase: z.boolean().optional(),
    hasLowercase: z.boolean().optional(),
    hasNumbers: z.boolean().optional(),
    hasSymbols: z.boolean().optional()
})

export type PasswordSchemaType = z.infer<typeof passwordSchema>