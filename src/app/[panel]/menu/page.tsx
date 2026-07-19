import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import MenuManager from "./MenuManager";

/* ─── Halaman Manajemen Menu Navigasi Admin (BARU, gak ada mock referensi) ───
 * Server Component: cek role (Author gak boleh) + fetch Menu "header" & "footer"
 * beserta MenuItem (top-level + children) asli dari Prisma. */
export default async function AdminMenuPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/menu");

  const itemInclude = {
    createdBy: { select: { name: true } },
    updatedBy: { select: { name: true } },
  };

  const menus = await prisma.menu.findMany({
    where: { key: { in: ["header", "footer"] }, deletedAt: null },
    include: {
      items: {
        where: { parentId: null, deletedAt: null },
        include: {
          children: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, include: itemInclude },
          ...itemInclude,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const header = menus.find((m) => m.key === "header") ?? null;
  const footer = menus.find((m) => m.key === "footer") ?? null;

  return <MenuManager header={header} footer={footer} />;
}
