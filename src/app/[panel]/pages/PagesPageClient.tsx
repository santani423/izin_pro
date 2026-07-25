"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
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
import { cn } from "@/lib/utils";

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

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function Pagination({
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}) {
  const [jumpValue, setJumpValue] = useState("");

  const jumpToPage = () => {
    const n = Number(jumpValue);
    if (Number.isInteger(n) && n >= 1 && n <= totalPages) {
      onPageChange(n);
    }
    setJumpValue("");
  };

  return (
    <nav aria-label="Navigasi halaman" className="flex flex-wrap items-center justify-center gap-2 pt-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex items-center gap-1 rounded-lg border border-admin-line bg-white px-2.5 py-1.5 text-xs font-medium text-black transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronLeft size={14} aria-hidden="true" />
        Sebelumnya
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          aria-current={n === page ? "page" : undefined}
          onClick={() => onPageChange(n)}
          className={cn(
            "size-8 rounded-lg text-xs font-semibold transition-colors",
            n === page
              ? "bg-primary text-white"
              : "border border-admin-line bg-white text-black hover:border-primary/40 hover:text-primary",
          )}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex items-center gap-1 rounded-lg border border-admin-line bg-white px-2.5 py-1.5 text-xs font-medium text-black transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
      >
        Selanjutnya
        <ChevronRight size={14} aria-hidden="true" />
      </button>

      {/* Loncat langsung ke halaman tertentu */}
      <div className="flex items-center gap-1.5 ml-1">
        <span className="text-xs text-black">Ke halaman</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && jumpToPage()}
          placeholder={String(page)}
          className="h-8 w-14 rounded-lg border border-admin-line bg-white px-2 text-center text-xs text-black outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Loncat ke nomor halaman"
        />
        <button
          type="button"
          onClick={jumpToPage}
          className="rounded-lg border border-admin-line bg-white px-2.5 py-1.5 text-xs font-medium text-black transition-colors hover:border-primary/40 hover:text-primary"
        >
          Go
        </button>
      </div>

      {/* Ukuran halaman */}
      <div className="flex items-center gap-1.5 ml-1">
        <span className="text-xs text-black">per halaman</span>
        <Select
          items={Object.fromEntries(PAGE_SIZE_OPTIONS.map((n) => [String(n), String(n)]))}
          value={String(pageSize)}
          onValueChange={(v) => v && onPageSizeChange(Number(v))}
        >
          <SelectTrigger className="h-8 w-16 rounded-lg border border-admin-line bg-white px-2 text-xs font-medium text-black hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="end">
            {PAGE_SIZE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </nav>
  );
}

/* ─── Halaman Manajemen Pages Admin ─── */
export default function PagesPageClient() {
  const [pages, setPages] = useState<PageRow[]>(SEED);
  const [form, setForm] = useState<PageRow | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const save = () => {
    if (!form) return;
    if (!form.title.trim()) {
      swalError("Judul halaman wajib diisi");
      return;
    }
    const slug = form.core
      ? form.slug
      : form.slug || `/${form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
    const next = { ...form, slug, updatedAt: today() };
    if (form.id) {
      setPages((prev) => prev.map((p) => (p.id === form.id ? next : p)));
      swalSuccess(`Halaman "${form.title}" disimpan`);
    } else {
      setPages((prev) => [...prev, { ...next, id: String(Date.now()) }]);
      swalSuccess(`Halaman "${form.title}" ditambahkan sebagai draft`);
    }
    setForm(null);
  };

  const removePage = async (pageRow: PageRow) => {
    const confirmed = await swalConfirmDelete(`Halaman "${pageRow.title}"`);
    if (!confirmed) return;
    setPages((prev) => prev.filter((p) => p.id !== pageRow.id));
    swalSuccess("Halaman dihapus");
  };

  const filtered = pages.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex gap-2 flex-1 sm:max-w-sm">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari judul atau slug..."
              className="pl-9 rounded-xl h-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button type="button" className="rounded-xl h-10 flex-shrink-0">
            Search
          </Button>
        </div>
        <Button size="sm" className="gap-1.5 rounded-xl flex-shrink-0" onClick={() => setForm(emptyForm())}>
          <Plus size={14} />
          Halaman Baru
        </Button>
      </div>

      <p className="text-sm text-gray-500">{filtered.length} halaman</p>

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
              {pageItems.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{row.title}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 font-mono hidden md:table-cell">{row.slug}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyle[row.status]}`}>
                      {row.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell">{row.updatedAt}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={row.slug}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                        aria-label="Lihat halaman"
                      >
                        <Eye size={14} />
                      </a>
                      <button
                        onClick={() => setForm(row)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                        aria-label="Edit halaman"
                      >
                        <Pencil size={14} />
                      </button>
                      {!row.core && (
                        <button
                          onClick={() => removePage(row)}
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
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                    Tidak ada halaman yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-admin-line">
          <p className="text-xs text-gray-400">
            Menampilkan {pageItems.length} dari {filtered.length} halaman
          </p>
        </div>
      </div>

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

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
    </div>
  );
}
