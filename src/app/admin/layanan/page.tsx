"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, Building2, ClipboardList, FileText, Clock, List } from "lucide-react";
import { toast } from "sonner";
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
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { SERVICES } from "@/lib/constants";

const ICONS: Record<string, React.ElementType> = {
  building: Building2,
  clipboard: ClipboardList,
  "file-text": FileText,
  clock: Clock,
  list: List,
};

type ServiceRow = (typeof SERVICES)[number] & { active: boolean };

const emptyForm = (): ServiceRow => ({
  id: "",
  slug: "",
  title: "",
  description: "",
  icon: "file-text",
  color: "#5ba12b",
  bgColor: "#f3fae8",
  features: [],
  active: true,
});

/* ─── Halaman Manajemen Layanan Admin ─── */
export default function AdminLayananPage() {
  const [services, setServices] = useState<ServiceRow[]>(SERVICES.map((s) => ({ ...s, active: true })));
  const [form, setForm] = useState<ServiceRow | null>(null);
  /* Fitur diedit sebagai teks per-baris */
  const [featuresText, setFeaturesText] = useState("");
  const [toDelete, setToDelete] = useState<ServiceRow | null>(null);

  const toggleActive = (id: string) =>
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s));

  const openForm = (svc: ServiceRow | null) => {
    const target = svc ?? emptyForm();
    setForm(target);
    setFeaturesText(target.features.join("\n"));
  };

  const save = () => {
    if (!form) return;
    if (!form.title.trim()) {
      toast.error("Nama layanan wajib diisi");
      return;
    }
    const features = featuresText.split("\n").map((f) => f.trim()).filter(Boolean);
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const next = { ...form, features, slug };
    if (form.id) {
      setServices((prev) => prev.map((s) => (s.id === form.id ? next : s)));
      toast.success("Layanan diperbarui");
    } else {
      setServices((prev) => [...prev, { ...next, id: String(Date.now()) }]);
      toast.success("Layanan baru ditambahkan");
    }
    setForm(null);
  };

  return (
    <>

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{services.length} layanan tersedia</p>
          <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => openForm(null)}>
            <Plus size={14} />
            Tambah Layanan
          </Button>
        </div>

        <div className="space-y-3">
          {services.map((service) => {
            const Icon = ICONS[service.icon] ?? FileText;
            return (
              <div
                key={service.id}
                className={`bg-white rounded-2xl border transition-all ${service.active ? "border-admin-line" : "border-admin-line opacity-60"}`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Drag handle */}
                  <GripVertical size={16} className="text-gray-300 cursor-grab flex-shrink-0" />

                  {/* Ikon */}
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                    style={{ backgroundColor: service.bgColor }}
                  >
                    <Icon size={18} style={{ color: service.color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-gray-900">{service.title}</h3>
                      {!service.active && (
                        <Badge variant="secondary" className="text-xs">Non-aktif</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{service.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {service.features.slice(0, 3).map((f) => (
                        <span key={f} className="text-xs px-2 py-0.5 bg-gray-50 rounded-full text-gray-500">
                          {f}
                        </span>
                      ))}
                      {service.features.length > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-50 rounded-full text-gray-400">
                          +{service.features.length - 3} lagi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Aksi */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      checked={service.active}
                      onCheckedChange={() => toggleActive(service.id)}
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
                  <Button className="flex-1 rounded-lg" onClick={save}>
                    Simpan
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
          onConfirm={() => {
            if (toDelete) {
              setServices((prev) => prev.filter((s) => s.id !== toDelete.id));
              toast.success("Layanan dihapus");
            }
          }}
        />
      </div>
    </>
  );
}
