"use client"

import { PasswordConfig } from "@/lib/password"
import { Badge } from "@/components/ui/badge"

interface Props {
    passwordConfig: PasswordConfig
}

const PasswordOptionsTags = ({ passwordConfig }: Props) => {
    return (
        <div className="flex flex-wrap gap-2">
            {
                [
                    {
                        condition: passwordConfig.hasUppercase,
                        label: "Mayúsculas",
                    },
                    {
                        condition: passwordConfig.hasLowercase,
                        label: "Minúsculas",
                    },
                    {
                        condition: passwordConfig.hasNumbers,
                        label: "Números",
                    },
                    {
                        condition: passwordConfig.hasSymbols,
                        label: "Simbolos",
                    },
                ]
                    .filter((item) => item.condition)
                    .map((item, index) => (
                        <Badge key={index} className="bg-gray-900 text-gray-200">{item.label}</Badge>
                    ))
            }
        </div>
    )
}

export default PasswordOptionsTags