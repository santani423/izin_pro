import { Skeleton } from "@/components/ui/skeleton";

/* ─── Skeleton loading Dashboard — dirender otomatis Next.js selama
 * DashboardPage (server component) menunggu query Prisma selesai. ─── */
export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <div className="bg-white rounded-2xl border border-admin-line p-5 sm:p-6">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-admin-line p-5 sm:p-6">
        <Skeleton className="h-5 w-52" />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Skeleton className="lg:col-span-6 h-72 rounded-2xl" />
        <Skeleton className="lg:col-span-6 h-72 rounded-2xl" />
      </div>
    </div>
  );
}
