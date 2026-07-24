import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRolePanel } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import LoginFormClient from "./LoginFormClient";

/* ─── Halaman Login ─── Server Component pembungkus: kalau sesi masih
 * valid (mis. user pencet Back setelah login), langsung lempar ke
 * dashboard alih-alih nampilin form login lagi. Dipasangkan dgn header
 * no-store di proxy.ts supaya navigasi Back beneran ngehit server ini,
 * bukan ditampilin dari bfcache browser. */
export default async function AdminLoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;
  if (session && role) {
    redirect(`/${getRolePanel(role)}/dashboard`);
  }

  return <LoginFormClient />;
}
