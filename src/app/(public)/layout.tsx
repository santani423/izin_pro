import { headers } from "next/headers";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import WhatsAppFab from "@/components/shared/WhatsAppFab";
import BackToTop from "@/components/shared/BackToTop";
import MaintenancePage from "@/components/shared/MaintenancePage";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { getLocale, getDictionary } from "@/i18n/get-dictionary";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getBrandingAssetUrls } from "@/lib/branding";
import { getLocalizedGeneralSettings } from "@/lib/general-settings";
import { localizeMenuTree } from "@/lib/menu-locale";
import { fontSettingsKey, resolveFontOption } from "@/lib/fonts";
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
  const [settings, session, locale] = await Promise.all([
    prisma.settings.findUnique({
      where: { id: "1" },
      select: {
        maintenanceMode: true,
        maintenanceMessage: true,
        fontFamilyId: true,
        fontFamilyEn: true,
        fontFamilyZh: true,
      },
    }),
    auth.api.getSession({ headers: await headers() }),
    getLocale(),
  ]);
  const dict = getDictionary(locale);
  const fontOption = resolveFontOption(settings?.[fontSettingsKey(locale)], locale);

  const role = session?.user.role as Role | undefined;
  const isBypassed = role === "ADMIN" || role === "SUPER_ADMIN";

  if (settings?.maintenanceMode && !isBypassed) {
    const { companyName } = await getLocalizedGeneralSettings();
    return <MaintenancePage message={settings.maintenanceMessage} dict={dict.maintenance} companyName={companyName} />;
  }

  const [headerMenu, branding] = await Promise.all([
    prisma.menu.findUnique({
      where: { key: "header", deletedAt: null },
      include: {
        items: {
          where: { parentId: null, deletedAt: null },
          include: { children: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } } },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    getBrandingAssetUrls(),
  ]);
  const logoUrl = branding.logoUrl;
  const navItems = localizeMenuTree(headerMenu?.items ?? [], locale);

  return (
    <LocaleProvider locale={locale} dict={dict}>
      {/* className="contents" -> gak nambah box baru (layout flex body gak
       * kepengaruh), tapi font-family dari sini tetap ke-inherit semua
       * elemen di bawahnya. Lihat tab Font di /admin/settings. */}
      <div className={`${fontOption.font.className} contents`}>
        <Navbar items={navItems} logoUrl={logoUrl} />
        <main className="flex-1">{children}</main>
        <Footer dict={dict.footer} />
        <WhatsAppFab />
        <BackToTop />
      </div>
    </LocaleProvider>
  );
}
