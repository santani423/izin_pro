import SectionWrapper from "@/components/shared/SectionWrapper";
import { BlogCardSkeleton, BlogFeaturedSkeleton } from "@/components/skeletons/BlogCardSkeleton";

/* ─── Skeleton: Halaman Blog ─── */
export default function BlogLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="bg-gradient-to-br from-[#f3fae8] via-white to-[#f3fae8] py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="max-w-2xl space-y-3">
            <div className="h-4 w-28 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-10 w-96 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-5 w-80 rounded bg-gray-200 animate-pulse" />
            <div className="h-5 w-64 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="relative max-w-md mt-6 h-11 rounded-xl bg-gray-200 animate-pulse" />
        </div>
      </section>

      <SectionWrapper>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Filter pills skeleton */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-8 w-24 rounded-full bg-gray-100 animate-pulse" />
            ))}
          </div>

          {/* Featured card skeleton */}
          <BlogFeaturedSkeleton />

          {/* Grid skeleton */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
