"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, ImagePlus, Layers,
} from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
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
import { cn } from "@/lib/utils";
import { SERVICE_ICONS, DEFAULT_SERVICE_ICON } from "@/lib/service-icons";
import { SortableList } from "@/components/admin/SortableList";
import {
  createServiceAction,
  deleteServiceAction,
  reorderServicesAction,
  toggleServiceActiveAction,
  updateServiceAction,
  uploadServiceFeaturedImageAction,
} from "@/lib/actions/services";

type ServiceWithCategory = Service & {
  category: ServiceCategory;
  featuredMedia: { id: string; url: string } | null;
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
  featuredMediaId: string | null;
}

const emptyForm = (defaultCategoryId: string): FormState => ({
  id: "",
  title: "",
  description: "",
  icon: "file-text",
  color: "#5ba12b",
  bgColor: "#f3fae8",
  categoryId: defaultCategoryId,
  featuredMediaId: null,
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

/* ─── Halaman Manajemen Layanan Admin (tersambung Prisma) ─── */
export default function LayananManager({
  initialServices,
  categories,
}: {
  initialServices: ServiceWithCategory[];
  categories: ServiceCategory[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const panel = pathname.split("/")[1] || "admin";
  const [isPending, startTransition] = useTransition();
  const [isReordering, startReorderTransition] = useTransition();
  const [form, setForm] = useState<FormState | null>(null);
  const [featuresText, setFeaturesText] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  // Salinan lokal biar drag-reorder kerasa instan — disinkron ulang tiap kali
  // router.refresh() ngasih initialServices baru (props reference berubah).
  // Reset state pas render (bukan di useEffect) — pola resmi React utk
  // "adjusting state when a prop changes", lihat react.dev/learn/you-might-not-need-an-effect.
  const [prevInitialServices, setPrevInitialServices] = useState(initialServices);
  const [services, setServices] = useState(initialServices);
  if (initialServices !== prevInitialServices) {
    setPrevInitialServices(initialServices);
    setServices(initialServices);
  }

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
          featuredMediaId: svc.featuredMediaId,
        }
      : emptyForm(categories[0]?.id ?? "");
    setForm(target);
    setFeaturesText(svc ? (svc.features as string[]).join("\n") : "");
    setFeaturedImageUrl(svc?.featuredMedia?.url ?? null);
  };

  const uploadFeaturedImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await uploadServiceFeaturedImageAction(fd);
      if (res.ok) {
        setForm((f) => (f ? { ...f, featuredMediaId: res.mediaId } : f));
        setFeaturedImageUrl(res.url);
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal mengunggah gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleActive = (svc: ServiceWithCategory) => {
    startTransition(async () => {
      const res = await toggleServiceActiveAction(svc.id, !svc.isActive);
      if (res.ok) {
        swalSuccess("Status layanan diperbarui");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const save = () => {
    if (!form) return;
    if (!form.title.trim()) {
      swalError("Nama layanan wajib diisi");
      return;
    }
    if (!form.categoryId) {
      swalError("Kategori wajib dipilih");
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
      featuredMediaId: form.featuredMediaId,
    };

    startTransition(async () => {
      const res = form.id
        ? await updateServiceAction(form.id, payload)
        : await createServiceAction(payload);

      if (res.ok) {
        swalSuccess(form.id ? "Layanan diperbarui" : "Layanan baru ditambahkan");
        setForm(null);
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const remove = async (service: ServiceWithCategory) => {
    const confirmed = await swalConfirmDelete(`Layanan "${service.title}"`);
    if (!confirmed) return;
    startTransition(async () => {
      const res = await deleteServiceAction(service.id);
      if (res.ok) {
        swalSuccess("Layanan dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const filtered = services.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.name.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reorder cuma masuk akal kalau pageItems == urutan lengkap yg gak
  // terpotong search/pagination — di luar itu, drag dimatikan (lihat
  // SortableList disabled di bawah).
  const canReorder = search.trim() === "" && totalPages === 1;

  const handleReorderServices = (nextOrder: ServiceWithCategory[]) => {
    setServices(nextOrder);
    startReorderTransition(async () => {
      try {
        const res = await reorderServicesAction(nextOrder.map((s) => s.id));
        if (!res.ok) {
          swalError(res.message);
          setServices(initialServices);
        }
      } catch {
        swalError("Gagal mengubah urutan layanan. Cek koneksi lalu coba lagi.");
        setServices(initialServices);
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex gap-2 flex-1 sm:max-w-sm">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari nama, deskripsi, atau kategori..."
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
          Tambah Layanan
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} layanan tersedia</p>
        {!canReorder && filtered.length > 0 && (
          <p className="text-xs text-gray-400">
            Kosongkan pencarian &amp; tampilkan &ldquo;Semua&rdquo; per halaman untuk mengurutkan drag-and-drop.
          </p>
        )}
      </div>

      <SortableList
        id="layanan-list"
        items={pageItems}
        getId={(s) => s.id}
        onReorder={handleReorderServices}
        disabled={!canReorder || isReordering}
        renderItem={(service) => {
          const Icon = SERVICE_ICONS[service.icon ?? ""] ?? DEFAULT_SERVICE_ICON;
          return (
            <div
              className={`bg-white rounded-2xl border transition-all ${service.isActive ? "border-admin-line" : "border-admin-line opacity-60"}`}
            >
              <div className="flex items-center gap-4 p-4">
                {service.featuredMedia ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.featuredMedia.url}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-admin-line"
                  />
                ) : (
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                    style={{ backgroundColor: service.bgColor ?? undefined }}
                  >
                    <Icon size={18} style={{ color: service.color ?? undefined }} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-gray-900">{service.title}</h3>
                    <Badge variant="secondary" className="text-xs">{service.category.name}</Badge>
                    {!service.isActive && (
                      <Badge variant="secondary" className="text-xs">Non-aktif</Badge>
                    )}
                    {service.status === "DRAFT" && (
                      <Badge variant="secondary" className="text-xs text-amber-600">Draft</Badge>
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
                    onClick={() => router.push(`/${panel}/layanan/${service.id}/edit`)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                    aria-label="Kelola konten detail layanan"
                    title="Kelola Konten Detail"
                  >
                    <Layers size={14} />
                  </button>
                  <button
                    onClick={() => openForm(service)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                    aria-label="Edit layanan"
                    title="Edit Metadata"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => remove(service)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Hapus layanan"
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        }}
      />
      {pageItems.length === 0 && (
        <div className="bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
          {initialServices.length === 0 ? "Belum ada layanan." : "Tidak ada layanan yang cocok."}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Menampilkan {pageItems.length} dari {filtered.length} layanan
      </p>

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
                  <Label className="text-sm font-semibold text-gray-700">Gambar Titel</Label>
                  <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-dashed border-admin-line bg-gray-50/50 p-3">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-admin-line bg-white">
                      {featuredImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={featuredImageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlus size={18} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex flex-1 items-center gap-2">
                      <label
                        htmlFor="s-featured-image"
                        className="cursor-pointer text-xs font-semibold text-primary hover:underline aria-disabled:pointer-events-none aria-disabled:opacity-50"
                        aria-disabled={uploadingImage}
                      >
                        {uploadingImage ? "Mengunggah..." : featuredImageUrl ? "Ganti gambar" : "Upload gambar"}
                      </label>
                      {featuredImageUrl && !uploadingImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setForm({ ...form, featuredMediaId: null });
                            setFeaturedImageUrl(null);
                          }}
                          className="text-xs font-semibold text-red-500 hover:underline"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="s-featured-image"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadFeaturedImage(file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">PNG/JPG/WebP, otomatis dikompres. Opsional.</p>
                </div>
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
    </div>
  );
}
