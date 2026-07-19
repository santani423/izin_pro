import { requirePanelAccess } from "@/lib/admin-guard";
import InquiryPageClient from "./InquiryPageClient";

/* ─── Halaman Inquiry Admin ───
 * Server Component: cek role (Author gak boleh akses) lalu render konten
 * (masih mock React state, belum tersambung Prisma). */
export default async function AdminInquiryPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/inquiry");

  return <InquiryPageClient />;
}
