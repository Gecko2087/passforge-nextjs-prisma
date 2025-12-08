-- CreateTable
CREATE TABLE "Password" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "encryptedPassword" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "length" INTEGER NOT NULL DEFAULT 4,
    "hasUppercase" BOOLEAN NOT NULL DEFAULT false,
    "hasLowercase" BOOLEAN NOT NULL DEFAULT false,
    "hasNumbers" BOOLEAN NOT NULL DEFAULT false,
    "hasSymbols" BOOLEAN NOT NULL DEFAULT false
);
