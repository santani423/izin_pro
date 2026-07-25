"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Building2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import type { Media, Partner } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  createPartnerAction,
  deletePartnerAction,
  togglePartnerActiveAction,
  updatePartnerAction,
} from "@/lib/actions/partners";

type PartnerWithLogo = Partner & {
  logoMedia: Media;
  createdBy: { name: string } | null;
  updatedBy: { name: string } | null;
};

interface FormState {
  id: string;
  name: string;
}

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

/* ─── Halaman Manajemen Klien / Partner Admin (tersambung Prisma) ─── */
export default function KlienManager({
  initialPartners,
}: {
  initialPartners: PartnerWithLogo[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const openForm = (p: PartnerWithLogo | null) => {
    setForm({ id: p?.id ?? "", name: p?.name ?? "" });
    setPreview(p?.logoMedia.url ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleActive = (p: PartnerWithLogo) => {
    startTransition(async () => {
      const res = await togglePartnerActiveAction(p.id, !p.isActive);
      if (res.ok) {
        swalSuccess("Status klien diperbarui");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const onFileChange = (file: File | null) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  const save = () => {
    if (!form) return;
    if (!form.name.trim()) {
      swalError("Nama klien wajib diisi");
      return;
    }
    const file = fileInputRef.current?.files?.[0] ?? null;
    if (!form.id && !file) {
      swalError("Logo wajib diunggah");
      return;
    }

    const fd = new FormData();
    fd.set("name", form.name);
    if (file) fd.set("logo", file);

    startTransition(async () => {
      const res = form.id
        ? await updatePartnerAction(form.id, fd)
        : await createPartnerAction(fd);

      if (res.ok) {
        swalSuccess(form.id ? "Klien diperbarui" : "Klien baru ditambahkan");
        setForm(null);
        setPreview(null);
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const remove = async (partner: PartnerWithLogo) => {
    const confirmed = await swalConfirmDelete(`Klien "${partner.name}"`);
    if (!confirmed) return;
    startTransition(async () => {
      const res = await deletePartnerAction(partner.id);
      if (res.ok) {
        swalSuccess("Klien dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const filtered = initialPartners.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

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
              placeholder="Cari nama klien..."
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
        <Button size="sm" className="gap-1.5 rounded-xl flex-shrink-0" onClick={() => openForm(null)}>
          <Plus size={14} />
          Tambah Klien
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        Menampilkan {pageItems.length} dari {filtered.length} klien
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {pageItems.map((partner) => (
          <div
            key={partner.id}
            className={`bg-white rounded-2xl border border-admin-line p-4 flex flex-col items-center gap-3 transition-all ${!partner.isActive ? "opacity-60" : ""}`}
          >
            <div className="w-full h-16 flex items-center justify-center">
              <Image
                src={partner.logoMedia.url}
                alt={partner.name}
                width={120}
                height={48}
                className="max-h-12 w-auto object-contain"
              />
            </div>
            <div className="w-full text-center">
              <p className="text-sm font-semibold text-gray-900 truncate">{partner.name}</p>
              {!partner.isActive && (
                <Badge variant="secondary" className="text-xs mt-1">Non-aktif</Badge>
              )}
              <p className="text-[11px] text-gray-400 mt-1">
                Dibuat: {partner.createdBy?.name ?? "—"}
                <br />
                Diubah: {partner.updatedBy?.name ?? "—"}
              </p>
            </div>
            <div className="flex items-center justify-between w-full pt-2 border-t border-admin-line">
              <Switch
                checked={partner.isActive}
                disabled={isPending}
                onCheckedChange={() => toggleActive(partner)}
                className="data-[state=checked]:bg-primary"
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openForm(partner)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                  aria-label="Edit klien"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => remove(partner)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Hapus klien"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {pageItems.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
            <Building2 className="mx-auto mb-2 text-gray-300" size={28} />
            {initialPartners.length === 0 ? "Belum ada klien." : "Tidak ada klien yang cocok."}
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

      {/* ─── Dialog tambah/edit klien ─── */}
      <Dialog
        open={form !== null}
        onOpenChange={(o) => {
          if (!o) {
            setForm(null);
            setPreview(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          {form && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                {form.id ? "Edit Klien" : "Tambah Klien"}
              </DialogTitle>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="p-name" className="text-sm font-semibold text-gray-700">Nama Klien</Label>
                  <Input
                    id="p-name"
                    className="mt-1.5 rounded-lg"
                    placeholder="mis. Bank BJB"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="p-logo" className="text-sm font-semibold text-gray-700">
                    Logo <span className="font-normal text-gray-400">(PNG/JPG/WebP/SVG, maks 2MB)</span>
                  </Label>
                  {preview && (
                    <div className="mt-2 w-full h-20 rounded-lg border border-admin-line flex items-center justify-center bg-gray-50/50">
                      {/* eslint-disable-next-line @next/next/no-img-element -- preview blob URL, bukan aset statis */}
                      <img src={preview} alt="Preview logo" className="max-h-14 w-auto object-contain" />
                    </div>
                  )}
                  <Input
                    id="p-logo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="mt-2 rounded-lg"
                    ref={fileInputRef}
                    onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                  />
                  {form.id && (
                    <p className="mt-1.5 text-xs text-gray-400">Kosongkan kalau gak mau ganti logo.</p>
                  )}
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
