import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRolePanel } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import ForgotPasswordFormClient from "./ForgotPasswordFormClient";

/* ─── Halaman Lupa Password ─── sama pola kayak /admin/login: kalau
 * sesi masih valid, langsung lempar ke dashboard. */
export default async function ForgotPasswordPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;
  if (session && role) {
    redirect(`/${getRolePanel(role)}/dashboard`);
  }

  return <ForgotPasswordFormClient />;
}
