import { prisma } from "@/lib/db";
import type { TestimonialData } from "@/components/sections/TestimonialsSection";
import type { VideoTestimonialData } from "@/components/sections/VideoTestimonialsSection";
import type { TestimoniGridItem } from "@/components/sections/TestimoniGridSection";

/* ─── Fetch testimoni aktif dari Prisma, dipakai homepage & /testimoni ───
 * Satu query dibagi jadi 3 bentuk data sesuai kebutuhan tiap section:
 * carousel teks (homepage), grid berfilter kategori (/testimoni), dan video. */
export async function getPublicTestimonials() {
  const rows = await prisma.testimonial.findMany({
    where: { deletedAt: null, isActive: true },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });

  const textTestimonials: TestimonialData[] = rows
    .filter((t) => !t.isVideo)
    .map((t) => ({
      id: t.id,
      name: t.name,
      role: [t.role, t.company].filter(Boolean).join(", "),
      content: t.content ?? "",
      rating: t.rating ?? 0,
    }));

  const gridTestimonials: TestimoniGridItem[] = rows
    .filter((t) => !t.isVideo)
    .map((t) => ({
      id: t.id,
      name: t.name,
      role: [t.role, t.company].filter(Boolean).join(", "),
      content: t.content ?? "",
      categoryId: t.categoryId,
      categoryName: t.category?.name ?? null,
    }));

  const videoTestimonials: VideoTestimonialData[] = rows
    .filter((t) => t.isVideo)
    .map((t) => ({
      id: t.id,
      title: t.company ? `Testimoni ${t.company}` : `Testimoni ${t.name}`,
      service: t.category?.name ?? "Layanan IzinPro",
      name: t.name,
      role: [t.role, t.company].filter(Boolean).join(", "),
      duration: t.duration ?? "",
      videoUrl: t.videoUrl,
      thumbnailUrl: t.thumbnailUrl,
    }));

  return { textTestimonials, gridTestimonials, videoTestimonials };
}
