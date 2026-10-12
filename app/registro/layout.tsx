import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function RegistroLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    if (process.env.PASSFORGE_DEMO === "true") redirect("/login");
    return children;
}
