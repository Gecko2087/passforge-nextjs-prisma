"use server"

import prisma from "@/lib/prisma"

export const DeletePasswordAction = async (id: string) => {
    return await prisma.password.delete({
        where: {id: id}
    })
}
