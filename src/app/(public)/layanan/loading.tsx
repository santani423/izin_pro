/* ─── Skeleton: Halaman Daftar Layanan (desain baru) ─── */
export default function LayananLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="bg-brand-surface">
        <div className="mx-auto max-w-7xl space-y-4 px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-10 w-64 max-w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-5 w-96 max-w-full animate-pulse rounded bg-muted" />
        </div>
      </section>

      {/* Katalog skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto h-8 w-72 max-w-full animate-pulse rounded-lg bg-muted" />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </>
  );
}
