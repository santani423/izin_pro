"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Calendar, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
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

/* ─── Halaman Manajemen Promo Admin ─── */
export default function PromoPageClient() {
  const [promos, setPromos] = useState(promoData);
  const [form, setForm] = useState<PromoRow | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const toggleActive = (id: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    );
  };

  const save = () => {
    if (!form) return;
    if (!form.title.trim()) {
      swalError("Judul promo wajib diisi");
      return;
    }
    if (form.id) {
      setPromos((prev) => prev.map((p) => (p.id === form.id ? form : p)));
      swalSuccess("Promo diperbarui");
    } else {
      setPromos((prev) => [
        ...prev,
        { ...form, id: String(Date.now()), gradient: GRADIENTS[prev.length % GRADIENTS.length] },
      ]);
      swalSuccess("Promo ditambahkan");
    }
    setForm(null);
  };

  const removePromo = async (promo: PromoRow) => {
    const confirmed = await swalConfirmDelete(`Promo "${promo.tag || promo.title}"`);
    if (!confirmed) return;
    setPromos((prev) => prev.filter((p) => p.id !== promo.id));
    swalSuccess("Promo dihapus");
  };

  const filtered = promos.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex gap-2 flex-1 sm:max-w-sm">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari judul, tag, atau deskripsi..."
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
            Tambah Promo
          </Button>
        </div>

        <p className="text-sm text-gray-500">
          Menampilkan {pageItems.length} dari {filtered.length} promo
        </p>

        {/* ─── Grid Kartu Promo ─── */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {pageItems.map((promo) => (
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
                      onClick={() => removePromo(promo)}
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
          {pageItems.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
              {promos.length === 0 ? "Belum ada promo." : "Tidak ada promo yang cocok."}
            </div>
          )}
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
      </div>
    </>
  );
}
