import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./theme-providers";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "./query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PassForge | Generador de Contraseñas",
  description: "Genera contraseñas seguras y personalizadas con PassForge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <Navbar />
            <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
              {children}
            </main>
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

