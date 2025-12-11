import Cryptr from "cryptr"

if (!process.env.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is not defined")
}

export const cryptr = new Cryptr(process.env.ENCRYPTION_KEY);