/* ─── Skeleton: Blog Card ─── */
export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-white">
      <div className="h-44 bg-gray-100 animate-pulse" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-gray-100 rounded-full animate-pulse w-2/5" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-4/5" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-full mt-1" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

/* ─── Skeleton: Blog Featured Card ─── */
export function BlogFeaturedSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-gray-100 bg-white mb-8">
      <div className="h-60 md:h-auto bg-gray-100 animate-pulse" />
      <div className="p-7 flex flex-col gap-3">
        <div className="h-6 bg-gray-100 rounded-full animate-pulse w-24" />
        <div className="h-5 bg-gray-100 rounded animate-pulse w-full" />
        <div className="h-5 bg-gray-100 rounded animate-pulse w-4/5" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-full mt-1" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between">
          <div className="h-3 bg-gray-100 rounded-full animate-pulse w-28" />
          <div className="h-3 bg-gray-100 rounded-full animate-pulse w-16" />
        </div>
      </div>
    </div>
  );
}
