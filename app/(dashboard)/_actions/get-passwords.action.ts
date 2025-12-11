"use server"

import { cryptr } from "@/lib/cripto"
import prisma from "@/lib/prisma"

export const GetPasswordAction = async () => {
    const passwords = await prisma.password.findMany();
    
    return passwords.map(item => ({
        ...item,
        decryptedPassword: cryptr.decrypt(item.encryptedPassword),
    }));
};
