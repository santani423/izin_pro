import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import InquiryPageClient from "./InquiryPageClient";

/* ─── Halaman Inquiry Admin ───
 * Server Component: cek role (Author gak boleh akses) lalu baca Inquiry asli
 * dari Prisma — pesan masuk dari form kontak publik (/kontak). */
export default async function AdminInquiryPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/inquiry");

  const inquiries = await prisma.inquiry.findMany({
    include: { service: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <InquiryPageClient initialInquiries={inquiries} />;
}
