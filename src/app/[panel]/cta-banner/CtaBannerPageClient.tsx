"use client";

import { useState } from "react";
import { Headset, Pencil, Plus, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { COMPANY_INFO } from "@/lib/constants";

interface CtaVariant {
  id: string;
  /** Lokasi pemakaian — halaman publik tempat CTA tampil */
  location: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  whatsapp: string;
  active: boolean;
}

/* Lokasi CTA di website — sesuai pemakaian CtaSection saat ini */
const LOCATIONS = [
  "Beranda",
  "Layanan",
  "Detail Layanan",
  "Blog",
  "Detail Blog",
  "Promo",
  "Tentang Kami",
  "Testimoni",
  "Kontak",
  "Tracking",
];

const DEFAULT_CTA: { title: string; subtitle: string; buttonLabel: string; whatsapp: string } = {
  title: "Siap Memulai Perizinan Bisnis Anda?",
  subtitle: "Konsultasikan kebutuhan perizinan Anda sekarang gratis bersama tim ahli kami.",
  buttonLabel: "Konsultasikan Gratis Sekarang",
  whatsapp: COMPANY_INFO.whatsapp,
};

/* Varian awal — diambil dari override yang sekarang hardcoded di tiap halaman */
const SEED_VARIANTS: CtaVariant[] = [
  { id: "1", location: "Tentang Kami", title: "Siap Bekerja Sama dengan Kami?", subtitle: "Konsultasikan kebutuhan perizinan Anda sekarang juga secara gratis bersama tim ahli kami.", buttonLabel: "Konsultasikan Gratis Sekarang", whatsapp: COMPANY_INFO.whatsapp, active: true },
  { id: "2", location: "Blog", title: "Butuh Bantuan Mengurus Perizinan?", subtitle: "Konsultasikan kebutuhan perizinan Anda sekarang juga secara gratis bersama tim ahli kami.", buttonLabel: "Konsultasikan Gratis Sekarang", whatsapp: COMPANY_INFO.whatsapp, active: true },
  { id: "3", location: "Detail Layanan", title: "Siap Memulai Perizinan Bisnis Anda?", subtitle: "Konsultasikan kebutuhan layanan Anda sekarang juga, GRATIS!", buttonLabel: "Konsultasikan Sekarang", whatsapp: COMPANY_INFO.whatsapp, active: true },
];

const emptyForm = (location: string): CtaVariant => ({
  id: "",
  location,
  title: DEFAULT_CTA.title,
  subtitle: DEFAULT_CTA.subtitle,
  buttonLabel: DEFAULT_CTA.buttonLabel,
  whatsapp: DEFAULT_CTA.whatsapp,
  active: true,
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

/* ─── Halaman Manajemen CTA Banner Admin ─── */
export default function CtaBannerPageClient() {
  const [defaults, setDefaults] = useState(DEFAULT_CTA);
  const [variants, setVariants] = useState<CtaVariant[]>(SEED_VARIANTS);
  const [form, setForm] = useState<CtaVariant | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const usedLocations = variants.map((v) => v.location);
  const availableLocations = LOCATIONS.filter((l) => !usedLocations.includes(l));
  /* Saat edit, lokasi varian itu sendiri tetap bisa dipilih */
  const formLocations = form?.id
    ? [form.location, ...availableLocations]
    : availableLocations;

  const saveDefaults = () => {
    swalSuccess("CTA default disimpan");
  };

  const saveVariant = () => {
    if (!form) return;
    if (!form.title.trim() || !form.whatsapp.trim()) {
      swalError("Judul dan nomor WhatsApp wajib diisi");
      return;
    }
    if (form.id) {
      setVariants((prev) => prev.map((v) => (v.id === form.id ? form : v)));
      swalSuccess(`Varian CTA "${form.location}" diperbarui`);
    } else {
      setVariants((prev) => [...prev, { ...form, id: String(Date.now()) }]);
      swalSuccess(`Varian CTA "${form.location}" ditambahkan`);
    }
    setForm(null);
  };

  const removeVariant = async (variant: CtaVariant) => {
    const confirmed = await swalConfirmDelete(`Varian CTA "${variant.location}"`);
    if (!confirmed) return;
    setVariants((prev) => prev.filter((v) => v.id !== variant.id));
    swalSuccess("Varian CTA dihapus — halaman itu kembali memakai CTA default");
  };

  const toggleActive = (id: string) =>
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, active: !v.active } : v)),
    );

  const filteredVariants = variants.filter((v) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return v.location.toLowerCase().includes(q) || v.title.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredVariants.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredVariants.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* ─── CTA Default ─── */}
      <div className="bg-white rounded-2xl border border-admin-line p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
            <Headset size={18} />
          </span>
          <div>
            <h2 className="font-bold text-base text-gray-900">CTA Default</h2>
            <p className="text-sm text-gray-400">
              Dipakai di semua halaman yang tidak punya varian sendiri
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="d-title" className="text-sm font-semibold text-gray-700">Judul</Label>
            <Input
              id="d-title"
              className="mt-1.5 rounded-lg"
              value={defaults.title}
              onChange={(e) => setDefaults({ ...defaults, title: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="d-subtitle" className="text-sm font-semibold text-gray-700">Subjudul</Label>
            <Textarea
              id="d-subtitle"
              rows={2}
              className="mt-1.5 rounded-lg resize-none"
              value={defaults.subtitle}
              onChange={(e) => setDefaults({ ...defaults, subtitle: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="d-button" className="text-sm font-semibold text-gray-700">Label Tombol</Label>
            <Input
              id="d-button"
              className="mt-1.5 rounded-lg"
              value={defaults.buttonLabel}
              onChange={(e) => setDefaults({ ...defaults, buttonLabel: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="d-wa" className="text-sm font-semibold text-gray-700">Nomor WhatsApp</Label>
            <Input
              id="d-wa"
              className="mt-1.5 rounded-lg"
              placeholder="628123456789"
              value={defaults.whatsapp}
              onChange={(e) => setDefaults({ ...defaults, whatsapp: e.target.value })}
            />
          </div>
        </div>

        {/* Preview banner */}
        <div className="mt-5 rounded-xl bg-gradient-to-br from-primary via-brand-green-dark to-brand-green-dark px-5 py-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10">
                <Headset size={17} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">{defaults.title}</div>
                <div className="text-xs text-white/80 truncate">{defaults.subtitle}</div>
              </div>
            </div>
            <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand-green-dark whitespace-nowrap">
              {defaults.buttonLabel}
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button className="rounded-lg" onClick={saveDefaults}>
            Simpan CTA Default
          </Button>
        </div>
      </div>

      {/* ─── Varian per Halaman ─── */}
      <div className="bg-white rounded-2xl border border-admin-line overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-admin-line">
          <div>
            <h2 className="font-bold text-base text-gray-900">Varian per Halaman</h2>
            <p className="text-sm text-gray-400">
              Kata-kata & nomor WA berbeda untuk halaman tertentu
            </p>
          </div>
          <Button
            size="sm"
            className="gap-1.5 rounded-xl"
            disabled={availableLocations.length === 0}
            onClick={() => setForm(emptyForm(availableLocations[0]))}
          >
            <Plus size={14} />
            Tambah Varian
          </Button>
        </div>

        <div className="flex gap-2 px-5 sm:px-6 py-3 border-b border-admin-line sm:max-w-sm">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari halaman atau judul..."
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-line bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Halaman</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">WhatsApp</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aktif</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageItems.map((v) => (
                <tr key={v.id} className={`hover:bg-gray-50/50 transition-colors ${!v.active ? "opacity-50" : ""}`}>
                  <td className="px-5 py-3.5">
                    <Badge variant="secondary" className="text-xs rounded-lg">{v.location}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900 line-clamp-1 max-w-[280px]">{v.title}</div>
                    <div className="text-xs text-gray-400 line-clamp-1 max-w-[280px]">{v.subtitle}</div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 hidden lg:table-cell whitespace-nowrap">{v.whatsapp}</td>
                  <td className="px-5 py-3.5">
                    <Switch
                      checked={v.active}
                      onCheckedChange={() => toggleActive(v.id)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setForm(v)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                        aria-label="Edit varian"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => removeVariant(v)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Hapus varian"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                    {variants.length === 0
                      ? "Belum ada varian — semua halaman memakai CTA default."
                      : "Tidak ada varian yang cocok."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-admin-line">
          <p className="text-xs text-gray-400">
            Menampilkan {pageItems.length} dari {filteredVariants.length} varian
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

      {/* ─── Dialog tambah/edit varian ─── */}
      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          {form && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                {form.id ? "Edit Varian CTA" : "Tambah Varian CTA"}
              </DialogTitle>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Halaman</Label>
                  <Select
                    items={Object.fromEntries(formLocations.map((l) => [l, l]))}
                    value={form.location}
                    onValueChange={(v) => v && setForm({ ...form, location: v })}
                  >
                    <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} align="start">
                      {formLocations.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="v-title" className="text-sm font-semibold text-gray-700">Judul</Label>
                  <Input
                    id="v-title"
                    className="mt-1.5 rounded-lg"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="v-subtitle" className="text-sm font-semibold text-gray-700">Subjudul</Label>
                  <Textarea
                    id="v-subtitle"
                    rows={2}
                    className="mt-1.5 rounded-lg resize-none"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="v-button" className="text-sm font-semibold text-gray-700">Label Tombol</Label>
                    <Input
                      id="v-button"
                      className="mt-1.5 rounded-lg"
                      value={form.buttonLabel}
                      onChange={(e) => setForm({ ...form, buttonLabel: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="v-wa" className="text-sm font-semibold text-gray-700">Nomor WhatsApp</Label>
                    <Input
                      id="v-wa"
                      className="mt-1.5 rounded-lg"
                      placeholder="628123456789"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setForm(null)}>
                  Batal
                </Button>
                <Button className="flex-1 rounded-lg" onClick={saveVariant}>
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
