import SectionWrapper from "@/components/shared/SectionWrapper";
import { ServiceCardSkeleton, SearchFilterSkeleton } from "@/components/skeletons/ServiceCardSkeleton";

/* ─── Skeleton: Halaman Layanan ─── */
export default function LayananLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="bg-gradient-to-br from-[#f3fae8] via-white to-[#f3fae8] py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center max-w-3xl space-y-4">
          <div className="h-4 w-28 rounded-full bg-gray-200 animate-pulse mx-auto" />
          <div className="h-10 w-72 rounded-lg bg-gray-200 animate-pulse mx-auto" />
          <div className="h-5 w-96 rounded bg-gray-200 animate-pulse mx-auto" />
          <div className="h-5 w-80 rounded bg-gray-200 animate-pulse mx-auto" />
        </div>
      </section>

      {/* Catalog skeleton */}
      <SectionWrapper noPadding>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 md:py-14">
          <SearchFilterSkeleton />
          <div className="h-4 w-40 rounded bg-gray-100 animate-pulse mb-5" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
