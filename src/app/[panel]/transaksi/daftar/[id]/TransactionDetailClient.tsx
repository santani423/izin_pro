"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Pencil, Wallet, FileText, MessageSquare, History, Upload, Trash2,
  Eye, EyeOff, Download, ShieldCheck,
} from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import type {
  ServiceTransaction, TransactionWorkflowStep, TransactionAttachment,
  TransactionActivityLog, TransactionStatus, TransactionPriority, WorkflowStepStatus,
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import WorkflowTimeline, { type WorkflowTimelineStep } from "@/components/shared/WorkflowTimeline";
import {
  TRANSACTION_STATUS_LABELS, TRANSACTION_STATUS_COLORS,
  PRIORITY_LABELS, WORKFLOW_STEP_STATUS_LABELS,
} from "@/lib/transaction-status";
import {
  updateTransactionAction, updateTransactionNotesAction,
  updateWorkflowStepStatusAction, uploadTransactionAttachmentAction,
  deleteTransactionAttachmentAction, toggleAttachmentVisibilityAction,
  sendTransactionWhatsappAction,
} from "@/lib/actions/service-transactions";

type TransactionDetail = Omit<ServiceTransaction, "totalPrice" | "discount" | "tax" | "grandTotal"> & {
  totalPrice: number; discount: number; tax: number; grandTotal: number;
  service: { id: string; title: string; estimatedDurationLabel: string | null };
  package: { id: string; name: string; price: number } | null;
  assignedStaff: { id: string; name: string } | null;
  createdBy: { name: string } | null;
  updatedBy: { name: string } | null;
  workflowSteps: TransactionWorkflowStep[];
  attachments: (TransactionAttachment & { uploadedBy: { name: string } | null })[];
  activityLogs: (TransactionActivityLog & { user: { name: string } | null })[];
};

const NONE = "__none__";

function formatDate(d: Date | string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateTime(d: Date | string) {
  return new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TransactionDetailClient({
  transaction,
  packagesByService,
  staff,
  panel,
}: {
  transaction: TransactionDetail;
  packagesByService: Record<string, { id: string; name: string; price: number }[]>;
  staff: { id: string; name: string }[];
  panel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAuditDetail, setShowAuditDetail] = useState(false);
  const [showRevisionOnly, setShowRevisionOnly] = useState(false);

  /* ─── Edit info transaksi ─── */
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(() => ({
    customerName: transaction.customerName,
    customerEmail: transaction.customerEmail,
    customerPhone: transaction.customerPhone,
    customerCompany: transaction.customerCompany ?? "",
    packageId: transaction.packageId ?? NONE,
    assignedStaffId: transaction.assignedStaffId ?? NONE,
    priority: transaction.priority,
    status: transaction.status,
    startDate: transaction.startDate ? new Date(transaction.startDate).toISOString().slice(0, 10) : "",
    estimatedCompletionDate: transaction.estimatedCompletionDate
      ? new Date(transaction.estimatedCompletionDate).toISOString().slice(0, 10)
      : "",
    totalPrice: String(transaction.totalPrice),
    discount: String(transaction.discount),
    tax: String(transaction.tax),
  }));

  /* ─── Kirim invoice + link tracking + QR code via WhatsApp ─── */
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const sendWhatsapp = () => {
    setSendingWhatsapp(true);
    startTransition(async () => {
      const res = await sendTransactionWhatsappAction(transaction.id);
      setSendingWhatsapp(false);
      if (res.ok) {
        swalSuccess("Invoice & link tracking terkirim ke WhatsApp customer");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const saveEdit = () => {
    startTransition(async () => {
      const res = await updateTransactionAction(transaction.id, {
        customerName: editForm.customerName,
        customerEmail: editForm.customerEmail,
        customerPhone: editForm.customerPhone,
        customerCompany: editForm.customerCompany.trim() || null,
        packageId: editForm.packageId === NONE ? null : editForm.packageId,
        assignedStaffId: editForm.assignedStaffId === NONE ? null : editForm.assignedStaffId,
        priority: editForm.priority as TransactionPriority,
        status: editForm.status as TransactionStatus,
        startDate: editForm.startDate || null,
        estimatedCompletionDate: editForm.estimatedCompletionDate || null,
        totalPrice: Number(editForm.totalPrice) || 0,
        discount: Number(editForm.discount) || 0,
        tax: Number(editForm.tax) || 0,
      });
      if (res.ok) {
        swalSuccess("Transaksi diperbarui");
        setEditOpen(false);
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  /* ─── Catatan ─── */
  const [internalNotes, setInternalNotes] = useState(transaction.internalNotes ?? "");
  const [customerNotes, setCustomerNotes] = useState(transaction.customerNotes ?? "");
  const saveNotes = () => {
    startTransition(async () => {
      const res = await updateTransactionNotesAction(transaction.id, {
        internalNotes: internalNotes.trim() || null,
        customerNotes: customerNotes.trim() || null,
      });
      if (res.ok) {
        swalSuccess("Catatan disimpan");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  /* ─── Workflow step ─── */
  const [activeStep, setActiveStep] = useState<TransactionWorkflowStep | null>(null);
  const [stepForm, setStepForm] = useState({ status: "PENDING" as WorkflowStepStatus, notes: "", progressPercent: 0 });

  const openStep = (step: WorkflowTimelineStep) => {
    const full = transaction.workflowSteps.find((s) => s.id === step.id);
    if (!full) return;
    setActiveStep(full);
    setStepForm({ status: full.status, notes: full.notes ?? "", progressPercent: full.progressPercent });
  };

  const saveStep = () => {
    if (!activeStep) return;
    startTransition(async () => {
      const res = await updateWorkflowStepStatusAction(activeStep.id, {
        status: stepForm.status,
        notes: stepForm.notes.trim() || null,
        progressPercent: stepForm.progressPercent,
      });
      if (res.ok) {
        swalSuccess("Langkah workflow diperbarui");
        setActiveStep(null);
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  /* ─── Lampiran ─── */
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachStepId, setAttachStepId] = useState<string>(NONE);
  const [attachVisible, setAttachVisible] = useState(false);

  const uploadAttachment = async (file: File) => {
    setUploadingAttachment(true);
    try {
      const fd = new FormData();
      fd.append("transactionId", transaction.id);
      fd.append("file", file);
      if (attachStepId !== NONE) fd.append("workflowStepId", attachStepId);
      fd.append("visibleToCustomer", String(attachVisible));
      const res = await uploadTransactionAttachmentAction(fd);
      if (res.ok) {
        swalSuccess("Lampiran diunggah");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } finally {
      setUploadingAttachment(false);
    }
  };

  const removeAttachment = async (id: string, name: string) => {
    const confirmed = await swalConfirmDelete(`Lampiran "${name}"`);
    if (!confirmed) return;
    startTransition(async () => {
      const res = await deleteTransactionAttachmentAction(id);
      if (res.ok) {
        swalSuccess("Lampiran dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const toggleAttachmentVisible = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleAttachmentVisibilityAction(id, !current);
      if (res.ok) router.refresh();
      else swalError(res.message);
    });
  };

  const statusColor = TRANSACTION_STATUS_COLORS[transaction.status];
  const timelineSteps: WorkflowTimelineStep[] = transaction.workflowSteps.map((s) => ({
    id: s.id, name: s.name, description: s.description, status: s.status,
    estimatedDays: s.estimatedDays, startedAt: s.startedAt, completedAt: s.completedAt, notes: s.notes,
  }));

  const visibleActivityLogs = showRevisionOnly
    ? transaction.activityLogs.filter((l) => l.description?.toLowerCase().includes("revisi") || l.action === "STATUS_CHANGED" && JSON.stringify(l.newValue).includes("REVISION"))
    : transaction.activityLogs;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${panel}/transaksi/daftar`}
            className="flex size-9 items-center justify-center rounded-xl border border-admin-line text-gray-500 hover:text-primary hover:border-primary/40"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-mono text-lg font-bold text-gray-900">{transaction.code}</h1>
            <p className="text-xs text-gray-400">Dibuat {formatDate(transaction.createdAt)} oleh {transaction.createdBy?.name ?? "-"}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusColor.bg, statusColor.text)}>
            {TRANSACTION_STATUS_LABELS[transaction.status]}
          </span>
          <Badge variant="secondary" className="text-xs">{PRIORITY_LABELS[transaction.priority]}</Badge>
          <Button
            size="sm"
            className="gap-1.5 rounded-lg bg-[#25D366] text-white hover:bg-[#25D366]/90"
            onClick={sendWhatsapp}
            disabled={sendingWhatsapp}
            title="Kirim invoice, link tracking, dan QR code ke WhatsApp customer"
          >
            <WhatsAppIcon className="size-3.5" />
            {sendingWhatsapp ? "Mengirim..." : "Kirim WhatsApp"}
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 rounded-lg" onClick={() => setEditOpen(true)}>
            <Pencil size={13} /> Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Info */}
        <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-2">
          <h3 className="font-bold text-gray-900">Informasi Customer</h3>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-gray-400">Nama</dt><dd className="font-medium text-gray-900">{transaction.customerName}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Email</dt><dd className="font-medium text-gray-900">{transaction.customerEmail}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">WhatsApp</dt><dd className="font-medium text-gray-900">{transaction.customerPhone}</dd></div>
            {transaction.customerCompany && (
              <div className="flex justify-between"><dt className="text-gray-400">Perusahaan</dt><dd className="font-medium text-gray-900">{transaction.customerCompany}</dd></div>
            )}
          </dl>
        </div>

        {/* Service Info */}
        <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-2">
          <h3 className="font-bold text-gray-900">Informasi Layanan</h3>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-gray-400">Layanan</dt><dd className="font-medium text-gray-900">{transaction.service.title}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Paket</dt><dd className="font-medium text-gray-900">{transaction.package?.name ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Staff</dt><dd className="font-medium text-gray-900">{transaction.assignedStaff?.name ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Mulai</dt><dd className="font-medium text-gray-900">{formatDate(transaction.startDate)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Estimasi Selesai</dt><dd className="font-medium text-gray-900">{formatDate(transaction.estimatedCompletionDate)}</dd></div>
            {transaction.completionDate && (
              <div className="flex justify-between"><dt className="text-gray-400">Selesai</dt><dd className="font-medium text-gray-900">{formatDate(transaction.completionDate)}</dd></div>
            )}
          </dl>
        </div>
      </div>

      {/* Rincian Harga */}
      <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-3">
        <h3 className="flex items-center gap-2 font-bold text-gray-900"><Wallet size={16} className="text-primary" /> Rincian Harga</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Harga Dasar</p><p className="font-bold text-gray-900">Rp{transaction.totalPrice.toLocaleString("id-ID")}</p></div>
          <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Diskon</p><p className="font-bold text-gray-900">Rp{transaction.discount.toLocaleString("id-ID")}</p></div>
          <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Pajak</p><p className="font-bold text-gray-900">Rp{transaction.tax.toLocaleString("id-ID")}</p></div>
          <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Grand Total</p><p className="font-bold text-gray-900">Rp{transaction.grandTotal.toLocaleString("id-ID")}</p></div>
        </div>
      </div>

      {/* Workflow Timeline */}
      <div className="bg-white rounded-2xl border border-admin-line p-5">
        <h3 className="mb-4 font-bold text-gray-900">Workflow Transaksi</h3>
        <WorkflowTimeline steps={timelineSteps} onStepClick={openStep} />
      </div>

      {/* Notes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-3">
          <h3 className="flex items-center gap-2 font-bold text-gray-900"><FileText size={16} className="text-primary" /> Catatan Internal</h3>
          <Textarea rows={4} className="rounded-lg resize-none" value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Catatan internal — gak keliatan customer" />
          <Button size="sm" className="rounded-lg" onClick={saveNotes} disabled={isPending}>Simpan Catatan</Button>
        </div>
        <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-3">
          <h3 className="flex items-center gap-2 font-bold text-gray-900"><MessageSquare size={16} className="text-primary" /> Catatan untuk Customer</h3>
          <Textarea rows={4} className="rounded-lg resize-none" value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} placeholder="Tampil di halaman tracking publik" />
          <Button size="sm" className="rounded-lg" onClick={saveNotes} disabled={isPending}>Simpan Catatan</Button>
        </div>
      </div>

      {/* Attachments */}
      <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Lampiran</h3>
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-admin-line bg-gray-50/50 p-3">
          <div>
            <Label className="text-xs font-semibold text-gray-700">Terkait Langkah <span className="font-normal text-gray-400">(opsional)</span></Label>
            <Select
              items={{ [NONE]: "Umum", ...Object.fromEntries(transaction.workflowSteps.map((s) => [s.id, s.name])) }}
              value={attachStepId}
              onValueChange={(v) => v && setAttachStepId(v)}
            >
              <SelectTrigger className="mt-1 h-9 w-48 rounded-lg border-border/60 bg-background pl-3 text-xs hover:border-primary/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} align="start">
                <SelectItem value={NONE}>Umum</SelectItem>
                {transaction.workflowSteps.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-1.5 pb-2 text-xs text-gray-600">
            <Switch checked={attachVisible} onCheckedChange={setAttachVisible} className="data-[state=checked]:bg-primary" />
            Bisa dilihat customer
          </label>
          <label className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 aria-disabled:pointer-events-none aria-disabled:opacity-50">
            <Upload size={14} />
            {uploadingAttachment ? "Mengunggah..." : "Unggah File"}
            <input
              type="file"
              className="hidden"
              disabled={uploadingAttachment}
              accept=".pdf,.doc,.docx,.xls,.xlsx,image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAttachment(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {transaction.attachments.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-4">Belum ada lampiran.</p>
        ) : (
          <div className="divide-y divide-gray-50 rounded-xl border border-gray-100">
            {transaction.attachments.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-3.5 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{a.fileName}</p>
                  <p className="text-xs text-gray-400">{formatBytes(a.sizeBytes)} · {a.uploadedBy?.name ?? "-"} · {formatDate(a.createdAt)}</p>
                </div>
                <button
                  onClick={() => toggleAttachmentVisible(a.id, a.visibleToCustomer)}
                  className={cn("p-1.5 rounded-lg transition-colors", a.visibleToCustomer ? "text-primary hover:bg-primary/5" : "text-gray-400 hover:bg-gray-50")}
                  title={a.visibleToCustomer ? "Terlihat oleh customer" : "Tersembunyi dari customer"}
                >
                  {a.visibleToCustomer ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5" title="Unduh">
                  <Download size={14} />
                </a>
                <button onClick={() => removeAttachment(a.id, a.fileName)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50" title="Hapus">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity / Audit Log */}
      <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-bold text-gray-900"><History size={16} className="text-primary" /> Aktivitas & Audit Log</h3>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-gray-500">
              <Switch checked={showRevisionOnly} onCheckedChange={setShowRevisionOnly} className="data-[state=checked]:bg-primary" />
              Riwayat Revisi Saja
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-500">
              <Switch checked={showAuditDetail} onCheckedChange={setShowAuditDetail} className="data-[state=checked]:bg-primary" />
              Detail Teknis
            </label>
          </div>
        </div>
        {visibleActivityLogs.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-4">Belum ada aktivitas.</p>
        ) : (
          <ul className="space-y-2.5">
            {visibleActivityLogs.map((log) => (
              <li key={log.id} className="rounded-xl border border-gray-100 px-3.5 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{log.description ?? log.action}</p>
                  <span className="text-xs text-gray-400">{formatDateTime(log.createdAt)}</span>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">oleh {log.user?.name ?? "Sistem"}</p>
                {showAuditDetail && (
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-400">
                    <ShieldCheck size={11} /> IP: {log.ipAddress ?? "-"} · Device: {log.device ?? "-"}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dialog: Edit transaksi */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogTitle className="text-base font-bold text-gray-900">Edit Transaksi</DialogTitle>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Nama Customer</Label>
                <Input className="mt-1.5 rounded-lg" value={editForm.customerName} onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Email</Label>
                <Input className="mt-1.5 rounded-lg" value={editForm.customerEmail} onChange={(e) => setEditForm({ ...editForm, customerEmail: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">WhatsApp</Label>
                <Input className="mt-1.5 rounded-lg" value={editForm.customerPhone} onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Perusahaan</Label>
                <Input className="mt-1.5 rounded-lg" value={editForm.customerCompany} onChange={(e) => setEditForm({ ...editForm, customerCompany: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Paket</Label>
                <Select
                  items={{ [NONE]: "Tanpa paket", ...Object.fromEntries((packagesByService[transaction.serviceId] ?? []).map((p) => [p.id, p.name])) }}
                  value={editForm.packageId}
                  onValueChange={(v) => v && setEditForm({ ...editForm, packageId: v })}
                >
                  <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 hover:border-primary/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} align="start">
                    <SelectItem value={NONE}>Tanpa paket</SelectItem>
                    {(packagesByService[transaction.serviceId] ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Staff</Label>
                <Select
                  items={{ [NONE]: "Belum ditugaskan", ...Object.fromEntries(staff.map((u) => [u.id, u.name])) }}
                  value={editForm.assignedStaffId}
                  onValueChange={(v) => v && setEditForm({ ...editForm, assignedStaffId: v })}
                >
                  <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 hover:border-primary/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} align="start">
                    <SelectItem value={NONE}>Belum ditugaskan</SelectItem>
                    {staff.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Prioritas</Label>
                <Select items={PRIORITY_LABELS} value={editForm.priority} onValueChange={(v) => v && setEditForm({ ...editForm, priority: v as TransactionPriority })}>
                  <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 hover:border-primary/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} align="start">
                    {Object.entries(PRIORITY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Status</Label>
                <Select items={TRANSACTION_STATUS_LABELS} value={editForm.status} onValueChange={(v) => v && setEditForm({ ...editForm, status: v as TransactionStatus })}>
                  <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 hover:border-primary/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} align="start">
                    {Object.entries(TRANSACTION_STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Tanggal Mulai</Label>
                <Input type="date" className="mt-1.5 rounded-lg" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Estimasi Selesai</Label>
                <Input type="date" className="mt-1.5 rounded-lg" value={editForm.estimatedCompletionDate} onChange={(e) => setEditForm({ ...editForm, estimatedCompletionDate: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Harga Total</Label>
                <Input type="number" className="mt-1.5 rounded-lg" value={editForm.totalPrice} onChange={(e) => setEditForm({ ...editForm, totalPrice: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Diskon</Label>
                <Input type="number" className="mt-1.5 rounded-lg" value={editForm.discount} onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Pajak</Label>
                <Input type="number" className="mt-1.5 rounded-lg" value={editForm.tax} onChange={(e) => setEditForm({ ...editForm, tax: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button className="flex-1 rounded-lg" onClick={saveEdit} disabled={isPending}>{isPending ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Update langkah workflow */}
      <Dialog open={activeStep !== null} onOpenChange={(o) => !o && setActiveStep(null)}>
        <DialogContent className="sm:max-w-sm">
          {activeStep && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">{activeStep.name}</DialogTitle>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Status</Label>
                  <Select items={WORKFLOW_STEP_STATUS_LABELS} value={stepForm.status} onValueChange={(v) => v && setStepForm({ ...stepForm, status: v as WorkflowStepStatus })}>
                    <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 hover:border-primary/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} align="start">
                      {Object.entries(WORKFLOW_STEP_STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Progress (%)</Label>
                  <Input type="number" min={0} max={100} className="mt-1.5 rounded-lg" value={stepForm.progressPercent} onChange={(e) => setStepForm({ ...stepForm, progressPercent: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Catatan <span className="font-normal text-gray-400">(opsional)</span></Label>
                  <Textarea rows={3} className="mt-1.5 rounded-lg resize-none" value={stepForm.notes} onChange={(e) => setStepForm({ ...stepForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setActiveStep(null)}>Batal</Button>
                <Button className="flex-1 rounded-lg" onClick={saveStep} disabled={isPending}>{isPending ? "Menyimpan..." : "Simpan"}</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
