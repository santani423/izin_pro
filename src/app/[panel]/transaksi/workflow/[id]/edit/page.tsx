import { notFound } from "next/navigation";
import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import WorkflowTemplateEditor from "./WorkflowTemplateEditor";

/* ─── Halaman Kelola Langkah Workflow Template ─── */
export default async function AdminWorkflowTemplateEditPage({
  params,
}: {
  params: Promise<{ panel: string; id: string }>;
}) {
  const { panel, id } = await params;
  await requirePanelAccess(panel, "/transaksi/workflow");

  const template = await prisma.workflowTemplate.findFirst({
    where: { id, deletedAt: null },
    include: {
      service: { select: { id: true, title: true } },
      steps: { orderBy: { order: "asc" } },
    },
  });
  if (!template) notFound();

  return <WorkflowTemplateEditor template={template} panel={panel} />;
}
