/* ─── Skeleton: Service Card ─── */
export function ServiceCardSkeleton() {
  return (
    <div className="flex flex-col p-7 bg-white rounded-3xl border border-gray-200">
      <div className="flex items-start justify-between mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-6 w-24 rounded-full bg-gray-100 animate-pulse" />
      </div>
      <div className="h-5 bg-gray-100 rounded animate-pulse w-3/4 mb-3" />
      <div className="space-y-1.5 mb-5">
        <div className="h-3.5 bg-gray-100 rounded animate-pulse w-full" />
        <div className="h-3.5 bg-gray-100 rounded animate-pulse w-5/6" />
        <div className="h-3.5 bg-gray-100 rounded animate-pulse w-4/6" />
      </div>
      <div className="space-y-2 mb-6 flex-1">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
            <div className="h-3.5 bg-gray-100 rounded animate-pulse flex-1" />
          </div>
        ))}
      </div>
      <div className="h-10 bg-gray-100 rounded-xl animate-pulse w-full" />
    </div>
  );
}

/* ─── Skeleton: Search + Filter bar ─── */
export function SearchFilterSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 mb-7">
      <div className="w-full max-w-xl h-12 rounded-full bg-gray-100 animate-pulse" />
      <div className="flex flex-wrap justify-center gap-2">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-9 w-28 rounded-full bg-gray-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
