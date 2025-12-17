"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Home, FolderOpen, Moon, Sun, LogOut, Shield, KeyRound } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const navItems = [
    {
        href: "/",
        label: "Dashboard",
        icon: Home,
    },
    {
        href: "/categories",
        label: "Categorías",
        icon: FolderOpen,
    },
];

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { data: session, isPending } = useSession();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        await signOut();
        toast.success("Sesión cerrada");
        router.push("/login");
        router.refresh();
    };

    // No mostrar navbar en páginas de auth
    if (pathname === "/login" || pathname === "/registro") {
        return null;
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-linear-to-r from-violet-600 to-indigo-600 p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-violet-500/25 transition-all duration-300">
                            <KeyRound className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                            PassForge
                        </span>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={isActive ? "default" : "ghost"}
                                        className={`gap-2 ${isActive
                                            ? "bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                                            : "hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400"}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="hidden sm:inline">{item.label}</span>
                                    </Button>
                                </Link>
                            );
                        })}

                        {/* Separator */}
                        <div className="mx-2 h-6 w-px bg-border hidden sm:block" />

                        {/* Admin badge */}
                        {session?.user?.role === "admin" && (
                            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 rounded-full text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <Shield className="h-3 w-3" />
                                Admin
                            </div>
                        )}

                        {/* User info */}
                        {!isPending && session?.user && (
                            <span className="hidden md:inline text-sm text-muted-foreground px-2 font-medium">
                                {session.user.name}
                            </span>
                        )}

                        {/* Theme Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="relative hover:bg-violet-500/10"
                        >
                            {mounted && (
                                <>
                                    <Sun className={`h-4 w-4 text-amber-500 transition-all ${theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
                                    <Moon className={`absolute h-4 w-4 text-violet-400 transition-all ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
                                </>
                            )}
                        </Button>

                        {/* Logout */}
                        {session && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
