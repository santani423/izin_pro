import { COMPANY_INFO } from "@/lib/constants";

const DEFAULT_MESSAGE =
  "Kami sedang melakukan pemeliharaan sistem untuk meningkatkan layanan. Mohon coba lagi beberapa saat lagi.";

/* ─── Halaman Under Maintenance ───
 * Tampil menggantikan SELURUH halaman publik (tanpa Navbar/Footer) kalau
 * Settings.maintenanceMode aktif. ADMIN/SUPER_ADMIN yang login gak kena ini
 * (lihat bypass di (public)/layout.tsx) supaya tetap bisa cek situs asli. */
export default function MaintenancePage({ message }: { message?: string | null }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f3fae8] via-white to-[#f0f9e8] px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/under-maintenance.webp"
          alt="Website sedang dalam pemeliharaan"
          className="w-full max-w-md mx-auto mb-6"
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
          Sedang Dalam Pemeliharaan
        </h1>
        <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-8">
          {message?.trim() || DEFAULT_MESSAGE}
        </p>
        <a
          href={`https://wa.me/${COMPANY_INFO.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-[#43791b] transition-colors"
        >
          Hubungi Kami via WhatsApp
        </a>
        <p className="text-xs text-gray-400 mt-8">
          &copy; {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
