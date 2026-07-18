import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import WhatsAppFab from "@/components/shared/WhatsAppFab";
import BackToTop from "@/components/shared/BackToTop";
import { prisma } from "@/lib/db";

/* ─── Layout halaman publik (company profile) ───
 * Server Component: fetch Menu "header" dari Prisma di sini (Navbar butuh
 * "use client" utk interaktivitas, jadi datanya di-fetch di parent lalu
 * diteruskan sbg props). Footer fetch menu "footer"-nya sendiri langsung
 * (gak ada state client di situ). */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
