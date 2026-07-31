"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, Copy, ListOrdered } from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import type { WorkflowTemplate } from "@prisma/client";
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
import {
  createWorkflowTemplateAction,
  updateWorkflowTemplateAction,
  deleteWorkflowTemplateAction,
  duplicateWorkflowTemplateAction,
  toggleWorkflowTemplateActiveAction,
} from "@/lib/actions/workflow-templates";

type TemplateWithRelations = WorkflowTemplate & {
  service: { id: string; title: string };
  _count: { steps: number };
};

interface FormState {
  id: string;
  name: string;
  description: string;
  serviceId: string;
}

/* ─── Halaman Workflow Template Admin — list + form dasar (nama/deskripsi/
 * layanan). Kelola langkah-langkahnya sendiri di halaman terpisah
 * ([id]/edit), sama pola dgn LayananManager -> LayananDetailEditor. ─── */
export default function WorkflowTemplateManager({
  initialTemplates,
  services,
  panel,
}: {
  initialTemplates: TemplateWithRelations[];
  services: { id: string; title: string }[];
  panel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState | null>(null);

  const filtered = initialTemplates.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return t.name.toLowerCase().includes(q) || t.service.title.toLowerCase().includes(q);
  });

  const openForm = (t: TemplateWithRelations | null) => {
    setForm(
      t
        ? { id: t.id, name: t.name, description: t.description ?? "", serviceId: t.serviceId }
        : { id: "", name: "", description: "", serviceId: services[0]?.id ?? "" },
    );
  };

  const save = () => {
    if (!form) return;
    if (!form.name.trim()) return swalError("Nama template wajib diisi");
    if (!form.serviceId) return swalError("Layanan wajib dipilih");

    const payload = { name: form.name, description: form.description.trim() || null, serviceId: form.serviceId };
    startTransition(async () => {
      const res = form.id
        ? await updateWorkflowTemplateAction(form.id, payload)
        : await createWorkflowTemplateAction(payload);
      if (res.ok) {
        swalSuccess(form.id ? "Template diperbarui" : "Template baru ditambahkan");
        setForm(null);
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const toggleActive = (t: TemplateWithRelations) => {
    startTransition(async () => {
      const res = await toggleWorkflowTemplateActiveAction(t.id, !t.isActive);
      if (res.ok) router.refresh();
      else swalError(res.message);
    });
  };

  const duplicate = (t: TemplateWithRelations) => {
    startTransition(async () => {
      const res = await duplicateWorkflowTemplateAction(t.id);
      if (res.ok) {
        swalSuccess("Template diduplikat");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const remove = async (t: TemplateWithRelations) => {
    const confirmed = await swalConfirmDelete(`Template "${t.name}"`);
    if (!confirmed) return;
    startTransition(async () => {
      const res = await deleteWorkflowTemplateAction(t.id);
      if (res.ok) {
        swalSuccess("Template dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama template atau layanan..."
            className="pl-9 rounded-xl h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" className="gap-1.5 rounded-xl flex-shrink-0" onClick={() => openForm(null)}>
          <Plus size={14} /> Tambah Template
        </Button>
      </div>

      <div className="space-y-2.5">
        {filtered.map((t) => (
          <div key={t.id} className={`bg-white rounded-2xl border p-4 ${t.isActive ? "border-admin-line" : "border-admin-line opacity-60"}`}>
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-gray-900">{t.name}</h3>
                  <Badge variant="secondary" className="text-xs">{t.service.title}</Badge>
                  <Badge variant="secondary" className="text-xs">{t._count.steps} langkah</Badge>
                  {!t.isActive && <Badge variant="secondary" className="text-xs">Non-aktif</Badge>}
                </div>
                {t.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{t.description}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Switch
                  checked={t.isActive}
                  disabled={isPending}
                  onCheckedChange={() => toggleActive(t)}
                  className="data-[state=checked]:bg-primary"
                />
                <button
                  onClick={() => router.push(`/${panel}/transaksi/workflow/${t.id}/edit`)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                  aria-label="Kelola langkah workflow"
                  title="Kelola Langkah"
                >
                  <ListOrdered size={14} />
                </button>
                <button
                  onClick={() => openForm(t)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                  aria-label="Edit template"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => duplicate(t)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                  aria-label="Duplikat template"
                  title="Duplikat"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={() => remove(t)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Hapus template"
                  title="Hapus"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
            {initialTemplates.length === 0 ? "Belum ada template workflow." : "Tidak ada template yang cocok."}
          </div>
        )}
      </div>

      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          {form && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                {form.id ? "Edit Template Workflow" : "Tambah Template Workflow"}
              </DialogTitle>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="wf-name" className="text-sm font-semibold text-gray-700">Nama Template</Label>
                  <Input
                    id="wf-name"
                    className="mt-1.5 rounded-lg"
                    placeholder="mis. Pendirian PT"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Layanan</Label>
                  <Select
                    items={Object.fromEntries(services.map((s) => [s.id, s.title]))}
                    value={form.serviceId}
                    onValueChange={(v) => v && setForm({ ...form, serviceId: v })}
                  >
                    <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} align="start">
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="wf-desc" className="text-sm font-semibold text-gray-700">
                    Deskripsi <span className="font-normal text-gray-400">(opsional)</span>
                  </Label>
                  <Textarea
                    id="wf-desc"
                    rows={2}
                    className="mt-1.5 rounded-lg resize-none"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setForm(null)}>
                  Batal
                </Button>
                <Button className="flex-1 rounded-lg" onClick={save} disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
