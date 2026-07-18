"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

type PageStatus = "published" | "draft";

interface PageRow {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  updatedAt: string;
  /** Konten mock yang bisa diedit */
  heroTitle: string;
  heroSubtitle: string;
  /** Halaman inti website tidak bisa dihapus */
  core: boolean;
}

/* ─── Halaman publik yang benar-benar ada di website ─── */
const SEED: PageRow[] = [
  { id: "1", title: "Beranda", slug: "/", status: "published", updatedAt: "11 Jul 2026", heroTitle: "Urus Perizinan Bisnis Tanpa Ribet", heroSubtitle: "Layanan pengurusan legalitas & perizinan usaha yang cepat, transparan, dan terpercaya.", core: true },
  { id: "2", title: "Layanan", slug: "/layanan", status: "published", updatedAt: "11 Jul 2026", heroTitle: "Layanan Perizinan Lengkap", heroSubtitle: "Semua kebutuhan legalitas usaha Anda di satu tempat.", core: true },
  { id: "3", title: "Blog", slug: "/blog", status: "published", updatedAt: "10 Jul 2026", heroTitle: "Blog & Artikel", heroSubtitle: "Wawasan terbaru seputar perizinan dan legalitas usaha.", core: true },
  { id: "4", title: "Promo", slug: "/promo", status: "published", updatedAt: "10 Jul 2026", heroTitle: "Promo Spesial", heroSubtitle: "Penawaran terbaik untuk memulai legalitas usaha Anda.", core: true },
  { id: "5", title: "Tentang Kami", slug: "/tentang-kami", status: "published", updatedAt: "9 Jul 2026", heroTitle: "Tentang IzinPro", heroSubtitle: "Partner terpercaya pengurusan perizinan bisnis di Indonesia.", core: true },
  { id: "6", title: "Testimoni", slug: "/testimoni", status: "published", updatedAt: "9 Jul 2026", heroTitle: "Apa Kata Klien Kami", heroSubtitle: "Cerita nyata dari klien yang sudah kami bantu.", core: true },
  { id: "7", title: "Kontak", slug: "/kontak", status: "published", updatedAt: "8 Jul 2026", heroTitle: "Hubungi Kami", heroSubtitle: "Tim kami siap membantu kebutuhan perizinan Anda.", core: true },
  { id: "8", title: "Tracking", slug: "/tracking", status: "published", updatedAt: "8 Jul 2026", heroTitle: "Lacak Status Pengurusan", heroSubtitle: "Pantau progres dokumen Anda secara real-time.", core: true },
];

const statusStyle: Record<PageStatus, string> = {
  published: "bg-emerald-50 text-emerald-700",
  draft: "bg-amber-50 text-amber-700",
};

const today = () =>
  new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const emptyForm = (): PageRow => ({
  id: "",
  title: "",
  slug: "",
  status: "draft",
  updatedAt: today(),
  heroTitle: "",
  heroSubtitle: "",
  core: false,
});

/* ─── Halaman Manajemen Pages Admin ─── */
export default function PagesPageClient() {
  const [pages, setPages] = useState<PageRow[]>(SEED);
  const [form, setForm] = useState<PageRow | null>(null);
  const [toDelete, setToDelete] = useState<PageRow | null>(null);

  const save = () => {
    if (!form) return;
    if (!form.title.trim()) {
      toast.error("Judul halaman wajib diisi");
      return;
    }
    const slug = form.core
      ? form.slug
      : form.slug || `/${form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
    const next = { ...form, slug, updatedAt: today() };
    if (form.id) {
      setPages((prev) => prev.map((p) => (p.id === form.id ? next : p)));
      toast.success(`Halaman "${form.title}" disimpan`);
    } else {
      setPages((prev) => [...prev, { ...next, id: String(Date.now()) }]);
      toast.success(`Halaman "${form.title}" ditambahkan sebagai draft`);
    }
    setForm(null);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{pages.length} halaman</p>
        <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => setForm(emptyForm())}>
          <Plus size={14} />
          Halaman Baru
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-admin-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-line bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Judul</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Diperbarui</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{page.title}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 font-mono hidden md:table-cell">{page.slug}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyle[page.status]}`}>
                      {page.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell">{page.updatedAt}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={page.slug}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                        aria-label="Lihat halaman"
                      >
                        <Eye size={14} />
                      </a>
                      <button
                        onClick={() => setForm(page)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                        aria-label="Edit halaman"
                      >
                        <Pencil size={14} />
                      </button>
                      {!page.core && (
                        <button
                          onClick={() => setToDelete(page)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label="Hapus halaman"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Dialog edit konten halaman ─── */}
      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          {form && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                {form.id ? `Edit Halaman — ${form.title}` : "Halaman Baru"}
              </DialogTitle>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="pg-title" className="text-sm font-semibold text-gray-700">Judul</Label>
                    <Input
                      id="pg-title"
                      className="mt-1.5 rounded-lg"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pg-slug" className="text-sm font-semibold text-gray-700">Slug</Label>
                    <Input
                      id="pg-slug"
                      className="mt-1.5 rounded-lg font-mono text-xs"
                      disabled={form.core}
                      placeholder="otomatis dari judul"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pg-hero" className="text-sm font-semibold text-gray-700">Judul Hero</Label>
                  <Input
                    id="pg-hero"
                    className="mt-1.5 rounded-lg"
                    value={form.heroTitle}
                    onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pg-sub" className="text-sm font-semibold text-gray-700">Subjudul Hero</Label>
                  <Textarea
                    id="pg-sub"
                    rows={2}
                    className="mt-1.5 rounded-lg resize-none"
                    value={form.heroSubtitle}
                    onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Status</Label>
                  <Select
                    items={{ published: "Published", draft: "Draft" }}
                    value={form.status}
                    onValueChange={(v) => v && setForm({ ...form, status: v as PageStatus })}
                  >
                    <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} align="start">
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
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

      {/* ─── Konfirmasi hapus (hanya halaman non-inti) ─── */}
      <ConfirmDeleteDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete ? `Halaman "${toDelete.title}"` : ""}
        onConfirm={() => {
          if (toDelete) {
            setPages((prev) => prev.filter((p) => p.id !== toDelete.id));
            toast.success("Halaman dihapus");
          }
        }}
      />
    </div>
  );
}
