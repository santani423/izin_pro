import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import WorkflowTemplateManager from "./WorkflowTemplateManager";

/* ─── Halaman Workflow Template Admin (list) ─── */
export default async function AdminWorkflowTemplatePage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/transaksi/workflow");

  const [templates, services] = await Promise.all([
    prisma.workflowTemplate.findMany({
      where: { deletedAt: null },
      include: {
        service: { select: { id: true, title: true } },
        _count: { select: { steps: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.service.findMany({
      where: { deletedAt: null },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return <WorkflowTemplateManager initialTemplates={templates} services={services} panel={panel} />;
}
