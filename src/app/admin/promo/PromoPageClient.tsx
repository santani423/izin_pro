"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { PROMOS } from "@/lib/constants";

/* ─── Data promo diperluas dengan tanggal & status ─── */
const promoData = PROMOS.map((p, i) => ({
  ...p,
  startDate: "01 Jun 2026",
  endDate: ["30 Jun 2026", "31 Des 2026", "31 Jul 2026"][i] ?? "30 Jun 2026",
  active: true,
  clicks: [142, 89, 67][i] ?? 50,
}));

type PromoRow = (typeof promoData)[number];

const GRADIENTS = [
  "from-primary via-brand-green-dark to-brand-green-dark",
  "from-sky-500 to-blue-700",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-700",
];

const emptyForm = (): PromoRow => ({
  id: "",
  tag: "",
  title: "",
  subtitle: "",
  description: "",
  ctaLabel: "Klaim Sekarang",
  ctaHref: "/kontak",
  gradient: GRADIENTS[0],
  startDate: "",
  endDate: "",
  active: true,
  clicks: 0,
});

/* ─── Halaman Manajemen Promo Admin ─── */
export default function PromoPageClient() {
  const [promos, setPromos] = useState(promoData);
  const [form, setForm] = useState<PromoRow | null>(null);
  const [toDelete, setToDelete] = useState<PromoRow | null>(null);

  const toggleActive = (id: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    );
  };

  const save = () => {
    if (!form) return;
    if (!form.title.trim()) {
      toast.error("Judul promo wajib diisi");
      return;
    }
    if (form.id) {
      setPromos((prev) => prev.map((p) => (p.id === form.id ? form : p)));
      toast.success("Promo diperbarui");
    } else {
      setPromos((prev) => [
        ...prev,
        { ...form, id: String(Date.now()), gradient: GRADIENTS[prev.length % GRADIENTS.length] },
      ]);
      toast.success("Promo ditambahkan");
    }
    setForm(null);
  };

  return (
    <>

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{promos.length} promo aktif</p>
          <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => setForm(emptyForm())}>
            <Plus size={14} />
            Tambah Promo
          </Button>
        </div>

        {/* ─── Grid Kartu Promo ─── */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className={`bg-white rounded-2xl border border-admin-line overflow-hidden transition-all ${
                !promo.active ? "opacity-60" : ""
              }`}
            >
              {/* Preview gradient */}
              <div className={`h-28 bg-gradient-to-br ${promo.gradient} p-5 flex flex-col justify-between`}>
                <span className="text-xs font-semibold text-white/80 bg-white/20 px-2.5 py-0.5 rounded-full w-fit">
                  {promo.tag}
                </span>
                <div className="text-white">
                  <div className="text-xl font-extrabold leading-none">{promo.title}</div>
                  <div className="text-2xl font-extrabold leading-none mt-0.5">{promo.subtitle}</div>
                </div>
              </div>

              {/* Detail */}
              <div className="p-4">
                <p className="text-xs text-gray-600 leading-relaxed mb-3">{promo.description}</p>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                  <Calendar size={11} />
                  <span>{promo.startDate} – {promo.endDate}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={promo.active}
                      onCheckedChange={() => toggleActive(promo.id)}
                      className="scale-90"
                    />
                    <span className="text-xs text-gray-500">{promo.active ? "Aktif" : "Nonaktif"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setForm(promo)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                      aria-label="Edit promo"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setToDelete(promo)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label="Hapus promo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Dialog tambah/edit promo ─── */}
        <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
          <DialogContent className="sm:max-w-md">
            {form && (
              <>
                <DialogTitle className="text-base font-bold text-gray-900">
                  {form.id ? "Edit Promo" : "Tambah Promo"}
                </DialogTitle>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="p-tag" className="text-sm font-semibold text-gray-700">Tag</Label>
                      <Input
                        id="p-tag"
                        className="mt-1.5 rounded-lg"
                        placeholder="mis. PROMO JUNI"
                        value={form.tag}
                        onChange={(e) => setForm({ ...form, tag: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="p-cta" className="text-sm font-semibold text-gray-700">Label Tombol</Label>
                      <Input
                        id="p-cta"
                        className="mt-1.5 rounded-lg"
                        value={form.ctaLabel}
                        onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="p-title" className="text-sm font-semibold text-gray-700">Judul</Label>
                      <Input
                        id="p-title"
                        className="mt-1.5 rounded-lg"
                        placeholder="mis. Diskon"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="p-subtitle" className="text-sm font-semibold text-gray-700">Subjudul</Label>
                      <Input
                        id="p-subtitle"
                        className="mt-1.5 rounded-lg"
                        placeholder="mis. 30%"
                        value={form.subtitle}
                        onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="p-desc" className="text-sm font-semibold text-gray-700">Deskripsi</Label>
                    <Textarea
                      id="p-desc"
                      rows={2}
                      className="mt-1.5 rounded-lg resize-none"
                      placeholder="Deskripsi singkat promo..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="p-start" className="text-sm font-semibold text-gray-700">Mulai</Label>
                      <Input
                        id="p-start"
                        className="mt-1.5 rounded-lg"
                        placeholder="01 Jun 2026"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="p-end" className="text-sm font-semibold text-gray-700">Berakhir</Label>
                      <Input
                        id="p-end"
                        className="mt-1.5 rounded-lg"
                        placeholder="30 Jun 2026"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      />
                    </div>
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
          itemLabel={toDelete ? `Promo "${toDelete.tag || toDelete.title}"` : ""}
          onConfirm={() => {
            if (toDelete) {
              setPromos((prev) => prev.filter((p) => p.id !== toDelete.id));
              toast.success("Promo dihapus");
            }
          }}
        />
      </div>
    </>
  );
}
