import { headers } from "next/headers";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import WhatsAppFab from "@/components/shared/WhatsAppFab";
import BackToTop from "@/components/shared/BackToTop";
import MaintenancePage from "@/components/shared/MaintenancePage";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

/* ─── Layout halaman publik (company profile) ───
 * Server Component: fetch Menu "header" dari Prisma di sini (Navbar butuh
 * "use client" utk interaktivitas, jadi datanya di-fetch di parent lalu
 * diteruskan sbg props). Footer fetch menu "footer"-nya sendiri langsung
 * (gak ada state client di situ).
 *
 * Gate mode maintenance: kalau Settings.maintenanceMode aktif, SEMUA
 * pengunjung publik cuma liat MaintenancePage — kecuali yang lagi login
 * sbg ADMIN/SUPER_ADMIN (bisa browsing situs asli utk cek sebelum
 * dimatiin lagi). auth.api.getSession baca cookies/headers -> otomatis
 * bikin layout ini dynamic, jadi toggle di Settings langsung kerasa
 * tanpa perlu revalidate manual. */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, session] = await Promise.all([
    prisma.settings.findUnique({
      where: { id: "1" },
      select: { maintenanceMode: true, maintenanceMessage: true },
    }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  const role = session?.user.role as Role | undefined;
  const isBypassed = role === "ADMIN" || role === "SUPER_ADMIN";

  if (settings?.maintenanceMode && !isBypassed) {
    return <MaintenancePage message={settings.maintenanceMessage} />;
  }

  const headerMenu = await prisma.menu.findUnique({
    where: { key: "header", deletedAt: null },
    include: {
      items: {
        where: { parentId: null, deletedAt: null },
        include: { children: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return (
    <>
      <Navbar items={headerMenu?.items ?? []} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFab />
      <BackToTop />
    </>
  );
}
