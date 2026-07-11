/* ─── Skeleton: Halaman Artikel (desain baru) ─── */
export default function BlogLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="bg-brand-surface">
        <div className="mx-auto max-w-7xl space-y-4 px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-10 w-72 max-w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-5 w-96 max-w-full animate-pulse rounded bg-muted" />
        </div>
      </section>

      {/* Search + katalog skeleton */}
      <div className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-20 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </>
  );
}
