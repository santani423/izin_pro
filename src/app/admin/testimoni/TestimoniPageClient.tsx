"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
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
import { TESTIMONIALS } from "@/lib/constants";
import type { TestimonialItem } from "@/types";

type TestimonialRow = TestimonialItem & { active: boolean };

const AVATAR_COLORS = [
  "from-emerald-400 to-green-600",
  "from-sky-400 to-blue-600",
  "from-amber-400 to-orange-600",
  "from-violet-400 to-purple-600",
  "from-rose-400 to-red-500",
];

const initialsOf = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const emptyForm = (): TestimonialRow => ({
  id: "",
  name: "",
  role: "",
  company: "",
  content: "",
  rating: 5,
  initials: "",
  avatarColor: AVATAR_COLORS[0],
  active: true,
});

/* ─── Halaman Manajemen Testimoni Admin ─── */
export default function TestimoniPageClient() {
  const [items, setItems] = useState<TestimonialRow[]>(
    TESTIMONIALS.map((t) => ({ ...t, active: true })),
  );
  const [form, setForm] = useState<TestimonialRow | null>(null);
  const [toDelete, setToDelete] = useState<TestimonialRow | null>(null);

  const toggleActive = (id: string) =>
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));

  const save = () => {
    if (!form) return;
    if (!form.name.trim() || !form.content.trim()) {
      toast.error("Nama dan isi testimoni wajib diisi");
      return;
    }
    const next = { ...form, initials: initialsOf(form.name) };
    if (form.id) {
      setItems((prev) => prev.map((t) => (t.id === form.id ? next : t)));
      toast.success("Testimoni diperbarui");
    } else {
      setItems((prev) => [
        ...prev,
        { ...next, id: String(Date.now()), avatarColor: AVATAR_COLORS[prev.length % AVATAR_COLORS.length] },
      ]);
      toast.success("Testimoni ditambahkan");
    }
    setForm(null);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{items.length} testimoni</p>
        <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => setForm(emptyForm())}>
          <Plus size={14} />
          Tambah Testimoni
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((t) => (
          <div
            key={t.id}
            className={`bg-white rounded-2xl border border-admin-line p-5 transition-all ${!t.active ? "opacity-50" : ""}`}
          >
            {/* Author */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} text-white text-xs font-bold flex-shrink-0`}
              >
                {t.initials}
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                <div className="text-xs text-gray-400">{t.role}, {t.company}</div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-0.5 mb-2">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Konten */}
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{t.content}</p>

            {/* Aksi */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-admin-line">
              <Switch
                checked={t.active}
                onCheckedChange={() => toggleActive(t.id)}
                className="data-[state=checked]:bg-primary"
              />
              <div className="flex gap-1">
                <button
                  onClick={() => setForm(t)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                  aria-label="Edit testimoni"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setToDelete(t)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Hapus testimoni"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Dialog tambah/edit testimoni ─── */}
      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          {form && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                {form.id ? "Edit Testimoni" : "Tambah Testimoni"}
              </DialogTitle>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ts-name" className="text-sm font-semibold text-gray-700">Nama Klien</Label>
                  <Input
                    id="ts-name"
                    className="mt-1.5 rounded-lg"
                    placeholder="Nama lengkap"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="ts-role" className="text-sm font-semibold text-gray-700">Jabatan</Label>
                    <Input
                      id="ts-role"
                      className="mt-1.5 rounded-lg"
                      placeholder="mis. Owner"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ts-company" className="text-sm font-semibold text-gray-700">Perusahaan</Label>
                    <Input
                      id="ts-company"
                      className="mt-1.5 rounded-lg"
                      placeholder="Nama usaha"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="ts-content" className="text-sm font-semibold text-gray-700">Isi Testimoni</Label>
                  <Textarea
                    id="ts-content"
                    rows={3}
                    className="mt-1.5 rounded-lg resize-none"
                    placeholder="Apa kata klien tentang layanan..."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Rating</Label>
                  <div className="mt-1.5 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setForm({ ...form, rating: r })}
                        aria-label={`Rating ${r} bintang`}
                        className="p-0.5"
                      >
                        <Star
                          size={20}
                          className={r <= form.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                        />
                      </button>
                    ))}
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
        itemLabel={toDelete ? `Testimoni dari ${toDelete.name}` : ""}
        onConfirm={() => {
          if (toDelete) {
            setItems((prev) => prev.filter((t) => t.id !== toDelete.id));
            toast.success("Testimoni dihapus");
          }
        }}
      />
    </div>
  );
}
