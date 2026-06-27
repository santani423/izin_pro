import type { Metadata } from "next";
import { Suspense } from "react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import CtaBannerSection from "@/components/sections/CtaBannerSection";
import ServicesCatalog from "@/components/services/ServicesCatalog";
import { SearchFilterSkeleton, ServiceCardSkeleton } from "@/components/skeletons/ServiceCardSkeleton";

export const metadata: Metadata = {
  title: "Layanan Perizinan",
  description:
    "Layanan perizinan lengkap: Pendirian PT, NIB, Izin Usaha, Izin Komersial, dan perizinan lainnya. Cepat, legal, dan transparan.",
};

/* ─── Halaman Daftar Layanan ─── */
export default function LayananPage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="bg-gradient-to-br from-[#f3fae8] via-white to-[#f3fae8] py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center max-w-3xl">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Layanan Kami
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Solusi Perizinan
            <br />
            <span className="text-primary">Lengkap & Terpercaya</span>
          </h1>
          <p className="text-lg text-gray-500 mt-5">
            Berbagai layanan perizinan untuk mendukung legalitas dan kelancaran bisnis Anda di
            seluruh Indonesia.
          </p>
        </div>
      </section>

      {/* ─── Catalog: search + filter + grid ─── */}
      <SectionWrapper noPadding>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 md:py-14">
          <Suspense
            fallback={
              <>
                <SearchFilterSkeleton />
                <div className="h-4 w-40 rounded bg-gray-100 animate-pulse mb-5" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ServiceCardSkeleton key={i} />
                  ))}
                </div>
              </>
            }
          >
            <ServicesCatalog />
          </Suspense>
        </div>
      </SectionWrapper>

      <CtaBannerSection />
    </>
  );
}
