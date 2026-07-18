import Image from "next/image";

import { prisma } from "@/lib/db";

/* ─── Klien Kami — marquee logo auto-slide, jeda saat di-hover ───
 * Daftar logo digandakan 2x agar loop translateX(-50%) tersambung mulus.
 * Server Component: baca Partner (isActive: true) langsung dari Prisma,
 * jadi toggle Aktif/Nonaktif di admin/klien langsung berefek di sini.
 */
export default async function ClientsSection() {
  const partners = await prisma.partner.findMany({
    where: { isActive: true, deletedAt: null },
    include: { logoMedia: true },
    orderBy: { sortOrder: "asc" },
  });

  if (partners.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        Klien Kami
      </h2>

      {/* Viewport marquee + fade tepi kiri/kanan */}
      <div className="group relative mt-6 overflow-hidden">
        {/* Gradien fade agar logo muncul/menghilang halus di tepi */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

        <ul className="animate-marquee flex w-max items-center gap-4">
          {[...partners, ...partners].map((partner, index) => (
            <li
              key={`${partner.id}-${index}`}
              className="shrink-0"
              aria-hidden={index >= partners.length}
            >
              <div className="grid h-20 w-40 place-items-center rounded-xl border border-border/60 bg-white px-6 shadow-sm">
                <div className="relative h-10 w-full">
                  <Image
                    src={partner.logoMedia.url}
                    alt={partner.name}
                    fill
                    sizes="160px"
                    className="object-contain"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
