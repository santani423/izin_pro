import { Check, X } from "lucide-react";
import { WORKFLOW_STEP_STATUS_LABELS, WORKFLOW_STEP_STATUS_COLORS } from "@/lib/transaction-status";
import { cn } from "@/lib/utils";
import type { WorkflowStepStatus } from "@prisma/client";

export interface WorkflowTimelineStep {
  id: string;
  name: string;
  description?: string | null;
  status: WorkflowStepStatus;
  estimatedDays?: number | null;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  notes?: string | null;
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/** ✔ selesai · ● sedang berjalan/revisi · ○ menunggu · ✕ ditolak — dipakai
 * baik di halaman detail transaksi admin maupun /tracking publik
 * (compact=true nyembunyiin deskripsi/catatan, cuma nama+status+tanggal). */
export default function WorkflowTimeline({
  steps,
  compact = false,
  onStepClick,
}: {
  steps: WorkflowTimelineStep[];
  compact?: boolean;
  onStepClick?: (step: WorkflowTimelineStep) => void;
}) {
  if (steps.length === 0) {
    return <p className="text-sm text-gray-400">Belum ada tahapan workflow.</p>;
  }

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const colors = WORKFLOW_STEP_STATUS_COLORS[step.status];
        const isLast = index === steps.length - 1;
        const isDone = step.status === "COMPLETED";
        const isRejected = step.status === "REJECTED";
        const isCurrent = step.status === "IN_PROGRESS" || step.status === "REVISION";

        return (
          <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  "absolute top-7 left-[13px] h-full w-0.5 -translate-x-1/2",
                  isDone ? "bg-emerald-400" : "bg-gray-200",
                )}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-7 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                isDone && "border-emerald-500 bg-emerald-500 text-white",
                isRejected && "border-red-500 bg-red-500 text-white",
                isCurrent && !isRejected && "border-blue-500 bg-blue-500 text-white",
                !isDone && !isRejected && !isCurrent && "border-gray-300 bg-white text-gray-300",
              )}
              aria-hidden="true"
            >
              {isDone ? <Check size={14} /> : isRejected ? <X size={14} /> : <span className="size-2 rounded-full bg-current" />}
            </span>

            <div
              role={onStepClick ? "button" : undefined}
              tabIndex={onStepClick ? 0 : undefined}
              onClick={onStepClick ? () => onStepClick(step) : undefined}
              onKeyDown={onStepClick ? (e) => (e.key === "Enter" || e.key === " ") && onStepClick(step) : undefined}
              className={cn("flex-1 pt-0.5 text-left", onStepClick && "cursor-pointer rounded-lg hover:bg-gray-50/80 -mt-1 -ml-1 p-1")}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">{step.name}</p>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", colors.bg, colors.text)}>
                  {WORKFLOW_STEP_STATUS_LABELS[step.status]}
                </span>
              </div>
              {!compact && step.description && (
                <p className="mt-0.5 text-xs text-gray-500">{step.description}</p>
              )}
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-400">
                {step.estimatedDays != null && <span>Estimasi {step.estimatedDays} hari</span>}
                {step.startedAt && <span>Mulai {formatDate(step.startedAt)}</span>}
                {step.completedAt && <span>Selesai {formatDate(step.completedAt)}</span>}
              </div>
              {!compact && step.notes && (
                <p className="mt-1 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-500">{step.notes}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
