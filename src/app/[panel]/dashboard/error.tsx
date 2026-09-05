"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

/* ─── Error boundary Dashboard — tampil kalau query Prisma di
 * DashboardPage gagal (mis. koneksi database putus). ─── */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-admin-line p-8 sm:p-12 flex flex-col items-center text-center">
        <div className="p-3 rounded-full bg-red-50">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <h2 className="mt-4 font-bold text-base text-gray-900">Gagal memuat Dashboard</h2>
        <p className="mt-1.5 text-sm text-gray-500 max-w-sm">
          Terjadi kesalahan saat mengambil data dashboard. Silakan coba lagi.
        </p>
        <button
          onClick={reset}
          className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <RotateCcw size={14} />
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
