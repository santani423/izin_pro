"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Pencil, Trash2, GripVertical, FileText,
  Building2, ClipboardList, Clock, List, UserCheck, Briefcase, Globe,
  Receipt, Tag, Monitor, MapPin, BadgeCheck, Ship, Factory, Leaf, HardHat, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { Service, ServiceCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import {
  createServiceAction,
  deleteServiceAction,
  toggleServiceActiveAction,
  updateServiceAction,
} from "@/lib/actions/services";

/* 18 ikon dipakai lintas 18 layanan (sebelumnya cuma 5 termapping, sisanya
 * diam-diam fallback ke FileText — sekarang dilengkapi semua). */
const ICONS: Record<string, React.ElementType> = {
  building: Building2,
  clipboard: ClipboardList,
  "file-text": FileText,
  clock: Clock,
  list: List,
  "user-check": UserCheck,
  briefcase: Briefcase,
  globe: Globe,
  receipt: Receipt,
  tag: Tag,
  monitor: Monitor,
  "map-pin": MapPin,
  "badge-check": BadgeCheck,
  ship: Ship,
  factory: Factory,
  leaf: Leaf,
  "hard-hat": HardHat,
  refresh: RefreshCw,
};

type ServiceWithCategory = Service & {
  category: ServiceCategory;
  createdBy: { name: string } | null;
  updatedBy: { name: string } | null;
};

interface FormState {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  categoryId: string;
}

const emptyForm = (defaultCategoryId: string): FormState => ({
  id: "",
  title: "",
  description: "",
  icon: "file-text",
  color: "#5ba12b",
  bgColor: "#f3fae8",
  categoryId: defaultCategoryId,
});

/* ─── Halaman Manajemen Layanan Admin (tersambung Prisma) ─── */
export default function LayananManager({
  initialServices,
  categories,
}: {
  initialServices: ServiceWithCategory[];
  categories: ServiceCategory[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState | null>(null);
  const [featuresText, setFeaturesText] = useState("");
  const [toDelete, setToDelete] = useState<ServiceWithCategory | null>(null);

  const openForm = (svc: ServiceWithCategory | null) => {
    const target: FormState = svc
      ? {
          id: svc.id,
          title: svc.title,
          description: svc.description,
          icon: svc.icon ?? "file-text",
          color: svc.color ?? "#5ba12b",
          bgColor: svc.bgColor ?? "#f3fae8",
          categoryId: svc.categoryId,
        }
      : emptyForm(categories[0]?.id ?? "");
    setForm(target);
    setFeaturesText(svc ? (svc.features as string[]).join("\n") : "");
  };

  const toggleActive = (svc: ServiceWithCategory) => {
    startTransition(async () => {
      const res = await toggleServiceActiveAction(svc.id, !svc.isActive);
      if (res.ok) {
        toast.success("Status layanan diperbarui");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const save = () => {
    if (!form) return;
    if (!form.title.trim()) {
      toast.error("Nama layanan wajib diisi");
      return;
    }
    if (!form.categoryId) {
      toast.error("Kategori wajib dipilih");
      return;
    }
    const features = featuresText.split("\n").map((f) => f.trim()).filter(Boolean);
    const payload = {
      title: form.title,
      description: form.description,
      icon: form.icon,
      color: form.color,
      bgColor: form.bgColor,
      categoryId: form.categoryId,
      features,
    };

    startTransition(async () => {
      const res = form.id
        ? await updateServiceAction(form.id, payload)
        : await createServiceAction(payload);

      if (res.ok) {
        toast.success(form.id ? "Layanan diperbarui" : "Layanan baru ditambahkan");
        setForm(null);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const remove = () => {
    if (!toDelete) return;
    startTransition(async () => {
      const res = await deleteServiceAction(toDelete.id);
      if (res.ok) {
        toast.success("Layanan dihapus");
        router.refresh();
      } else {
        toast.error(res.message);
      }
      setToDelete(null);
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{initialServices.length} layanan tersedia</p>
        <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => openForm(null)}>
          <Plus size={14} />
          Tambah Layanan
        </Button>
      </div>

      <div className="space-y-3">
        {initialServices.map((service) => {
          const Icon = ICONS[service.icon ?? ""] ?? FileText;
          return (
            <div
              key={service.id}
              className={`bg-white rounded-2xl border transition-all ${service.isActive ? "border-admin-line" : "border-admin-line opacity-60"}`}
            >
              <div className="flex items-center gap-4 p-4">
                <GripVertical size={16} className="text-gray-300 cursor-grab flex-shrink-0" />

                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                  style={{ backgroundColor: service.bgColor ?? undefined }}
                >
                  <Icon size={18} style={{ color: service.color ?? undefined }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-gray-900">{service.title}</h3>
                    <Badge variant="secondary" className="text-xs">{service.category.name}</Badge>
                    {!service.isActive && (
                      <Badge variant="secondary" className="text-xs">Non-aktif</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{service.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(service.features as string[]).slice(0, 3).map((f) => (
                      <span key={f} className="text-xs px-2 py-0.5 bg-gray-50 rounded-full text-gray-500">
                        {f}
                      </span>
                    ))}
                    {(service.features as string[]).length > 3 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-50 rounded-full text-gray-400">
                        +{(service.features as string[]).length - 3} lagi
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Dibuat oleh {service.createdBy?.name ?? "—"} · Diubah oleh {service.updatedBy?.name ?? "—"}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch
                    checked={service.isActive}
                    disabled={isPending}
                    onCheckedChange={() => toggleActive(service)}
                    className="data-[state=checked]:bg-primary"
                  />
                  <button
                    onClick={() => openForm(service)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                    aria-label="Edit layanan"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setToDelete(service)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Hapus layanan"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {initialServices.length === 0 && (
          <div className="bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
            Belum ada layanan.
          </div>
        )}
      </div>

      {/* ─── Dialog tambah/edit layanan ─── */}
      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          {form && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                {form.id ? "Edit Layanan" : "Tambah Layanan"}
              </DialogTitle>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="s-title" className="text-sm font-semibold text-gray-700">Nama Layanan</Label>
                  <Input
                    id="s-title"
                    className="mt-1.5 rounded-lg"
                    placeholder="mis. Pendirian PT"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Kategori</Label>
                  <Select
                    items={Object.fromEntries(categories.map((c) => [c.id, c.name]))}
                    value={form.categoryId}
                    onValueChange={(v) => v && setForm({ ...form, categoryId: v })}
                  >
                    <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} align="start">
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="s-desc" className="text-sm font-semibold text-gray-700">Deskripsi</Label>
                  <Textarea
                    id="s-desc"
                    rows={2}
                    className="mt-1.5 rounded-lg resize-none"
                    placeholder="Deskripsi singkat layanan..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="s-features" className="text-sm font-semibold text-gray-700">
                    Fitur <span className="font-normal text-gray-400">(satu per baris)</span>
                  </Label>
                  <Textarea
                    id="s-features"
                    rows={4}
                    className="mt-1.5 rounded-lg resize-none"
                    placeholder={"Akta pendirian\nSK Kemenkumham\nNPWP perusahaan"}
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
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

      {/* ─── Konfirmasi hapus ─── */}
      <ConfirmDeleteDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete ? `Layanan "${toDelete.title}"` : ""}
        onConfirm={remove}
      />
    </div>
  );
}
