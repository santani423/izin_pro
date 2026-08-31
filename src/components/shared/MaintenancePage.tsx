import type { Dictionary } from "@/i18n/dictionaries/id";

/* Fallback ini mencerminkan Settings.maintenanceMessage yang admin isi di
 * panel — sengaja dibiarkan Bahasa Indonesia (sama seperti DEFAULT_HERO_CONTENT
 * di HeroSection) selaras dgn keputusan scope: konten yang admin kelola
 * lewat CMS gak ikut diterjemahkan, cuma chrome UI di sekitarnya. */
const DEFAULT_MESSAGE =
  "Kami sedang melakukan pemeliharaan sistem untuk meningkatkan layanan. Mohon coba lagi beberapa saat lagi.";

/* ─── Halaman Under Maintenance ───
 * Tampil menggantikan SELURUH halaman publik (tanpa Navbar/Footer) kalau
 * Settings.maintenanceMode aktif. ADMIN/SUPER_ADMIN yang login gak kena ini
 * (lihat bypass di (public)/layout.tsx) supaya tetap bisa cek situs asli. */
export default function MaintenancePage({
  message,
  dict,
  companyName,
  whatsapp,
}: {
  message?: string | null;
  dict: Dictionary["maintenance"];
  companyName: string;
  whatsapp: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f3fae8] via-white to-[#f0f9e8] px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/under-maintenance.webp"
          alt={dict.imageAlt}
          className="w-full max-w-md mx-auto mb-6"
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
          {dict.heading}
        </h1>
        <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-8">
          {message?.trim() || DEFAULT_MESSAGE}
        </p>
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-[#43791b] transition-colors"
        >
          {dict.button}
        </a>
        <p className="text-xs text-gray-400 mt-8">
          &copy; {new Date().getFullYear()} {companyName}. {dict.rightsReserved}
        </p>
      </div>
    </div>
  );
}
