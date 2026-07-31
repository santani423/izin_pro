"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import type { WorkflowTemplate, WorkflowTemplateStep, WorkflowStepStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SortableList } from "@/components/admin/SortableList";
import { WORKFLOW_STEP_STATUS_LABELS } from "@/lib/transaction-status";
import {
  createWorkflowStepAction,
  updateWorkflowStepAction,
  deleteWorkflowStepAction,
  reorderWorkflowStepsAction,
} from "@/lib/actions/workflow-templates";

type TemplateWithSteps = WorkflowTemplate & {
  service: { id: string; title: string };
  steps: WorkflowTemplateStep[];
};

type StepDraft = WorkflowTemplateStep & { _requiredDocsText: string };

function toDraft(s: WorkflowTemplateStep): StepDraft {
  return { ...s, _requiredDocsText: ((s.requiredDocuments as string[]) ?? []).join("\n") };
}

const STATUS_OPTIONS = Object.fromEntries(
  Object.entries(WORKFLOW_STEP_STATUS_LABELS),
) as Record<WorkflowStepStatus, string>;

/* ─── Kelola langkah-langkah 1 Workflow Template — drag reorder via
 * SortableList, tiap langkah disimpan sendiri-sendiri (bukan 1 tombol
 * simpan global), sama pola dgn Paket Harga di LayananDetailEditor.tsx. ─── */
export default function WorkflowTemplateEditor({
  template,
  panel,
}: {
  template: TemplateWithSteps;
  panel: string;
}) {
  const [steps, setSteps] = useState<StepDraft[]>(template.steps.map(toDraft));
  const [isBusy, startTransition] = useTransition();
  const [isReordering, startReorderTransition] = useTransition();

  const addStep = () => {
    startTransition(async () => {
      const res = await createWorkflowStepAction(template.id, {
        name: "Langkah Baru",
        description: null,
        estimatedDays: null,
        requiredDocuments: [],
        defaultStatus: "PENDING",
      });
      if (res.ok) {
        window.location.reload();
      } else {
        swalError(res.message);
      }
    });
  };

  const saveStep = (step: StepDraft) => {
    startTransition(async () => {
      const res = await updateWorkflowStepAction(step.id, {
        name: step.name,
        description: step.description,
        estimatedDays: step.estimatedDays,
        requiredDocuments: step._requiredDocsText.split("\n").map((s) => s.trim()).filter(Boolean),
        defaultStatus: step.defaultStatus,
      });
      if (res.ok) {
        swalSuccess("Langkah disimpan");
      } else {
        swalError(res.message);
      }
    });
  };

  const removeStep = async (step: StepDraft) => {
    const confirmed = await swalConfirmDelete(`Langkah "${step.name}"`);
    if (!confirmed) return;
    startTransition(async () => {
      const res = await deleteWorkflowStepAction(step.id);
      if (res.ok) {
        setSteps((prev) => prev.filter((s) => s.id !== step.id));
        swalSuccess("Langkah dihapus");
      } else {
        swalError(res.message);
      }
    });
  };

  const handleReorder = (next: StepDraft[]) => {
    setSteps(next);
    startReorderTransition(async () => {
      const res = await reorderWorkflowStepsAction(next.map((s) => s.id));
      if (!res.ok) swalError(res.message);
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${panel}/transaksi/workflow`}
          className="flex size-9 items-center justify-center rounded-xl border border-admin-line text-gray-500 hover:text-primary hover:border-primary/40"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">{template.name}</h1>
          <p className="text-xs text-gray-500">Layanan: {template.service.title} · {steps.length} langkah</p>
        </div>
      </div>

      <SortableList
        id="workflow-steps-list"
        items={steps}
        getId={(s) => s.id}
        disabled={isReordering}
        onReorder={handleReorder}
        renderItem={(step, index) => (
          <div className="space-y-2.5 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <Input
                value={step.name}
                onChange={(e) => setSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, name: e.target.value } : s)))}
                className="rounded-lg font-semibold"
                placeholder="Nama langkah"
              />
            </div>
            <Textarea
              value={step.description ?? ""}
              onChange={(e) => setSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, description: e.target.value || null } : s)))}
              rows={2}
              className="rounded-lg resize-none"
              placeholder="Deskripsi (opsional)"
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                type="number"
                min={0}
                value={step.estimatedDays ?? ""}
                onChange={(e) => setSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, estimatedDays: e.target.value === "" ? null : Number(e.target.value) } : s)))}
                className="rounded-lg"
                placeholder="Estimasi hari"
              />
              <Select
                items={STATUS_OPTIONS}
                value={step.defaultStatus}
                onValueChange={(v) => v && setSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, defaultStatus: v as WorkflowStepStatus } : s)))}
              >
                <SelectTrigger className="h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start">
                  {Object.entries(STATUS_OPTIONS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={step._requiredDocsText}
                onChange={(e) => setSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, _requiredDocsText: e.target.value } : s)))}
                className="rounded-lg"
                placeholder="Dokumen wajib, pisah baris"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" className="gap-1.5 rounded-lg" onClick={() => saveStep(step)} disabled={isBusy}>
                <Save size={13} /> Simpan
              </Button>
              <Button type="button" size="sm" variant="outline" className="gap-1.5 rounded-lg text-red-500 hover:bg-red-50" onClick={() => removeStep(step)} disabled={isBusy}>
                <Trash2 size={13} /> Hapus
              </Button>
            </div>
          </div>
        )}
      />

      {steps.length === 0 && (
        <div className="bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
          Belum ada langkah. Tambahkan langkah pertama di bawah.
        </div>
      )}

      <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={addStep} disabled={isBusy}>
        <Plus size={14} /> Tambah Langkah
      </Button>
    </div>
  );
}
