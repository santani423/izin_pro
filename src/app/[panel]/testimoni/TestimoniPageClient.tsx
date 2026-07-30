"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus, Pencil, Trash2, Star, Video, Upload, Play, ChevronLeft, ChevronRight, Search,
  ImagePlus, Save, LayoutTemplate, Award,
} from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import type { ServiceCategory, Testimonial, TestimoniPageContent } from "@prisma/client";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SortableList } from "@/components/admin/SortableList";
import { IconPicker } from "@/components/admin/IconPicker";
import { cn } from "@/lib/utils";
import {
  createTestimonialAction,
  deleteTestimonialAction,
  toggleTestimonialActiveAction,
  updateTestimonialAction,
  uploadTestimonialThumbnailAction,
  type TestimonialFormData,
} from "@/lib/actions/testimonials";
import {
  saveTestimoniHeroContentAction,
  saveTestimoniHeroImageAction,
  saveTestimoniStatsAction,
  type TestimoniStatInput,
} from "@/lib/actions/testimoni-page";

/** Buang field `_key` sintetis (dipakai SortableList sbg id drag) sebelum
 * item balik disimpan ke state/DB — sama pola dgn AboutPageEditor. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function stripKey<T extends { _key: string }>({ _key, ...rest }: T): Omit<T, "_key"> {
  return rest;
}

type TestimonialWithRelations = Testimonial & {
  category: ServiceCategory | null;
  createdBy: { name: string } | null;
  updatedBy: { name: string } | null;
};

const AVATAR_COLORS = [
  "from-emerald-400 to-green-600",
  "from-sky-400 to-blue-600",
  "from-amber-400 to-orange-600",
  "from-violet-400 to-purple-600",
  "from-rose-400 to-red-500",
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function matchesSearch(t: TestimonialWithRelations, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    t.name.toLowerCase().includes(q) ||
    (t.role ?? "").toLowerCase().includes(q) ||
    (t.company ?? "").toLowerCase().includes(q) ||
    (t.content ?? "").toLowerCase().includes(q)
  );
}

/** Ekstrak video ID dari link YouTube (watch/short/embed). */
function getYouTubeVideoId(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1);
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/embed/")[1];
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/shorts/")[1];
    }
    return null;
  } catch {
    return null;
  }
}

/** Konversi link YouTube jadi URL embed. */
function getYouTubeEmbedUrl(url: string | null): string | null {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

/** Frame asli video dari YouTube — dipakai sbg thumbnail preview kalau admin belum unggah thumbnailUrl sendiri. */
function getYouTubeThumbnailUrl(url: string | null): string | null {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

interface FormState {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  categoryId: string;
  isVideo: boolean;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
}

const NO_CATEGORY = "__none__";
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

const emptyForm = (isVideo: boolean): FormState => ({
  id: "",
  name: "",
  role: "",
  company: "",
  content: "",
  rating: 5,
  categoryId: NO_CATEGORY,
  isVideo,
  videoUrl: "",
  thumbnailUrl: "",
  duration: "",
});

/* ─── Halaman Manajemen Testimoni Admin (tersambung Prisma) ─── */
export default function TestimoniPageClient({
  initialTestimonials,
  categories,
  bannerContent,
}: {
  initialTestimonials: TestimonialWithRelations[];
  categories: ServiceCategory[];
  bannerContent: TestimoniPageContent;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<TestimonialWithRelations | null>(null);
  const [textPage, setTextPage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);
  const [textPageSize, setTextPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [videoPageSize, setVideoPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [textSearch, setTextSearch] = useState("");
  const [videoSearch, setVideoSearch] = useState("");

  /* ─── Banner (Hero) ─── */
  const [heroKicker, setHeroKicker] = useState(bannerContent.heroKicker ?? "");
  const [heroTitle, setHeroTitle] = useState(bannerContent.heroTitle);
  const [heroTitleHighlight, setHeroTitleHighlight] = useState(bannerContent.heroTitleHighlight);
  const [heroDescription, setHeroDescription] = useState(bannerContent.heroDescription);
  const [heroImageUrl, setHeroImageUrl] = useState(bannerContent.heroImageUrl);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [isSavingBanner, startSaveBanner] = useTransition();
  const [stats, setStats] = useState<TestimoniStatInput[]>(
    bannerContent.stats as unknown as TestimoniStatInput[],
  );
  const [isSavingStats, startSaveStats] = useTransition();
  const statsList = useMemo(() => stats.map((s, i) => ({ ...s, _key: `s-${i}` })), [stats]);

  const openForm = (t: TestimonialWithRelations | null, isVideo: boolean) => {
    setForm(
      t
        ? {
            id: t.id,
            name: t.name,
            role: t.role ?? "",
            company: t.company ?? "",
            content: t.content ?? "",
            rating: t.rating ?? 5,
            categoryId: t.categoryId ?? NO_CATEGORY,
            isVideo: t.isVideo,
            videoUrl: t.videoUrl ?? "",
            thumbnailUrl: t.thumbnailUrl ?? "",
            duration: t.duration ?? "",
          }
        : emptyForm(isVideo),
    );
  };

  /* ─── Banner (Hero) ─── */
  const uploadHeroImage = async (file: File) => {
    setUploadingHeroImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await saveTestimoniHeroImageAction(fd);
      if (res.ok) {
        setHeroImageUrl(res.imageUrl);
        swalSuccess("Gambar banner berhasil disimpan");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal mengunggah gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const removeHeroImage = async () => {
    setUploadingHeroImage(true);
    try {
      const fd = new FormData();
      fd.append("reset", "true");
      const res = await saveTestimoniHeroImageAction(fd);
      if (res.ok) {
        setHeroImageUrl(null);
        swalSuccess("Gambar banner dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal menghapus gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const saveBanner = () => {
    startSaveBanner(async () => {
      try {
        const res = await saveTestimoniHeroContentAction({
          heroKicker,
          heroTitle,
          heroTitleHighlight,
          heroDescription,
        });
        if (res.ok) {
          swalSuccess("Banner berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan banner. Cek koneksi lalu coba lagi.");
      }
    });
  };

  const saveStats = () => {
    startSaveStats(async () => {
      try {
        const res = await saveTestimoniStatsAction({ stats });
        if (res.ok) {
          swalSuccess("Kartu statistik berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan kartu statistik. Cek koneksi lalu coba lagi.");
      }
    });
  };

  const uploadThumbnail = async (file: File) => {
    setUploadingThumbnail(true);
    const fd = new FormData();
    fd.append("thumbnail", file);
    const res = await uploadTestimonialThumbnailAction(fd);
    setUploadingThumbnail(false);
    if (res.ok) {
      setForm((f) => (f ? { ...f, thumbnailUrl: res.url } : f));
    } else {
      swalError(res.message);
    }
  };

  const toggleActive = (t: TestimonialWithRelations) => {
    startTransition(async () => {
      const res = await toggleTestimonialActiveAction(t.id, !t.isActive);
      if (res.ok) {
        swalSuccess("Status testimoni diperbarui");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const save = () => {
    if (!form) return;
    if (!form.name.trim()) {
      swalError("Nama wajib diisi");
      return;
    }
    if (!form.isVideo && !form.content.trim()) {
      swalError("Isi testimoni wajib diisi");
      return;
    }
    if (form.isVideo && !form.videoUrl.trim()) {
      swalError("URL video wajib diisi untuk video testimoni");
      return;
    }

    const payload: TestimonialFormData = {
      name: form.name,
      role: form.role,
      company: form.company,
      content: form.isVideo ? null : form.content,
      rating: form.isVideo ? null : form.rating,
      categoryId: form.categoryId === NO_CATEGORY ? null : form.categoryId,
      isVideo: form.isVideo,
      videoUrl: form.isVideo ? form.videoUrl : null,
      thumbnailUrl: form.isVideo ? form.thumbnailUrl : null,
      duration: form.isVideo ? form.duration : null,
    };

    startTransition(async () => {
      const res = form.id
        ? await updateTestimonialAction(form.id, payload)
        : await createTestimonialAction(payload);

      if (res.ok) {
        swalSuccess(form.id ? "Testimoni diperbarui" : "Testimoni ditambahkan");
        setForm(null);
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const remove = async (t: TestimonialWithRelations) => {
    const confirmed = await swalConfirmDelete(`Testimoni dari ${t.name}`);
    if (!confirmed) return;
    startTransition(async () => {
      const res = await deleteTestimonialAction(t.id);
      if (res.ok) {
        swalSuccess("Testimoni dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const textTestimonials = initialTestimonials.filter((t) => !t.isVideo && matchesSearch(t, textSearch));
  const videoTestimonials = initialTestimonials.filter((t) => t.isVideo && matchesSearch(t, videoSearch));

  /* Preview thumbnail di form edit — manual kalau ada, kalau kosong pakai frame otomatis dari YouTube */
  const formAutoThumbnail = form?.isVideo ? getYouTubeThumbnailUrl(form.videoUrl) : null;
  const formThumbnailPreview = form?.thumbnailUrl || formAutoThumbnail;
  const isAutoThumbnail = form?.isVideo && !form.thumbnailUrl && !!formAutoThumbnail;

  const textTotalPages = Math.max(1, Math.ceil(textTestimonials.length / textPageSize));
  const textCurrentPage = Math.min(textPage, textTotalPages);
  const textPageItems = textTestimonials.slice(
    (textCurrentPage - 1) * textPageSize,
    textCurrentPage * textPageSize,
  );

  const videoTotalPages = Math.max(1, Math.ceil(videoTestimonials.length / videoPageSize));
  const videoCurrentPage = Math.min(videoPage, videoTotalPages);
  const videoPageItems = videoTestimonials.slice(
    (videoCurrentPage - 1) * videoPageSize,
    videoCurrentPage * videoPageSize,
  );

  const renderTextGrid = (list: TestimonialWithRelations[]) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.map((t, index) => (
        <div
          key={t.id}
          className={`bg-white rounded-2xl border border-admin-line p-5 transition-all ${!t.isActive ? "opacity-50" : ""}`}
        >
          {/* Author */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} text-white text-xs font-bold flex-shrink-0`}
            >
              {getInitials(t.name)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-sm text-gray-900 truncate block">{t.name}</span>
              <div className="text-xs text-gray-400 truncate">
                {t.role}{t.role && t.company ? ", " : ""}{t.company}
              </div>
            </div>
          </div>

          {/* Rating */}
          {t.rating != null && (
            <div className="flex items-center gap-0.5 mb-2">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
          )}

          {/* Konten */}
          {t.content && (
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{t.content}</p>
          )}

          {t.category && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge variant="secondary" className="text-[10px]">{t.category.name}</Badge>
            </div>
          )}

          {/* Aksi */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-admin-line">
            <Switch
              checked={t.isActive}
              disabled={isPending}
              onCheckedChange={() => toggleActive(t)}
              className="data-[state=checked]:bg-primary"
            />
            <div className="flex gap-1">
              <button
                onClick={() => openForm(t, false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                aria-label="Edit testimoni"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => remove(t)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                aria-label="Hapus testimoni"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      ))}
      {list.length === 0 && (
        <div className="col-span-full bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
          Belum ada testimoni.
        </div>
      )}
    </div>
  );

  const renderVideoGrid = (list: TestimonialWithRelations[]) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.map((t) => {
        /* Thumbnail — thumbnailUrl manual, lalu frame asli dari YouTube, abu-abu sbg fallback terakhir.
         * Pakai || (bukan ??) krn thumbnailUrl kadang tersimpan "" (bukan null) dari form kosong. */
        const thumbnailSrc = t.thumbnailUrl || getYouTubeThumbnailUrl(t.videoUrl);
        return (
        <div
          key={t.id}
          className={`bg-white rounded-2xl border border-admin-line overflow-hidden transition-all ${!t.isActive ? "opacity-50" : ""}`}
        >
          {/* Thumbnail — klik utk preview video */}
          <button
            type="button"
            onClick={() => setPreviewVideo(t)}
            aria-label={`Putar video: ${t.name}`}
            className="group relative block aspect-video w-full overflow-hidden bg-gray-100"
          >
            {thumbnailSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnailSrc} alt={t.name} className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center bg-gradient-to-br from-gray-300 to-gray-400 text-[11px] text-gray-500">
                Belum ada thumbnail
              </div>
            )}
            <span className="absolute inset-0 grid place-items-center bg-black/10 transition-colors group-hover:bg-black/25">
              <span className="grid size-9 place-items-center rounded-full bg-white/90 text-gray-900 shadow-md">
                <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
              </span>
            </span>
            {t.duration && (
              <Badge variant="secondary" className="absolute bottom-2 right-2 bg-black/70 text-[10px] text-white">
                {t.duration}
              </Badge>
            )}
          </button>

          <div className="p-4">
            <span className="font-semibold text-sm text-gray-900 truncate block">{t.name}</span>
            <div className="text-xs text-gray-400 truncate mb-2">
              {t.role}{t.role && t.company ? ", " : ""}{t.company}
            </div>
            {t.category && (
              <Badge variant="secondary" className="text-[10px]">{t.category.name}</Badge>
            )}

            {/* Aksi */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-admin-line">
              <Switch
                checked={t.isActive}
                disabled={isPending}
                onCheckedChange={() => toggleActive(t)}
                className="data-[state=checked]:bg-primary"
              />
              <div className="flex gap-1">
                <button
                  onClick={() => openForm(t, true)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                  aria-label="Edit video testimoni"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => remove(t)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Hapus video testimoni"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })}
      {list.length === 0 && (
        <div className="col-span-full bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
          Belum ada video testimoni.
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Tabs defaultValue="banner">
        <TabsList className="rounded-xl bg-gray-200">
          <TabsTrigger value="banner" className="rounded-lg gap-1.5">
            <LayoutTemplate size={13} />
            Banner
          </TabsTrigger>
          <TabsTrigger value="teks" className="rounded-lg">Testimoni</TabsTrigger>
          <TabsTrigger value="video" className="rounded-lg gap-1.5">
            <Video size={13} />
            Video Testimoni
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab Banner (Hero /testimoni) ─── */}
        <TabsContent value="banner" className="space-y-4 mt-4">
          <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-4">
            <div>
              <h3 className="font-bold text-gray-900">Gambar Banner</h3>
              <p className="mt-1 text-sm text-gray-500">Kosongkan untuk pakai kartu gradient bawaan.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {heroImageUrl ? (
                  <Image src={heroImageUrl} alt="" width={128} height={80} unoptimized className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus size={20} className="text-gray-300" />
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <ImagePlus size={15} />
                {uploadingHeroImage ? "Mengunggah..." : "Pilih Gambar"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploadingHeroImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadHeroImage(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {heroImageUrl && (
                <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg text-red-500 hover:bg-red-50" onClick={removeHeroImage} disabled={uploadingHeroImage}>
                  <Trash2 size={13} /> Hapus
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-4">
            <h3 className="font-bold text-gray-900">Judul & Deskripsi</h3>
            <div>
              <Label htmlFor="banner-kicker" className="text-sm font-semibold text-gray-700">Kicker (label kecil di atas judul, opsional)</Label>
              <Input
                id="banner-kicker"
                className="mt-1.5 rounded-lg"
                value={heroKicker}
                onChange={(e) => setHeroKicker(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="banner-title" className="text-sm font-semibold text-gray-700">Judul</Label>
                <Input
                  id="banner-title"
                  className="mt-1.5 rounded-lg"
                  placeholder="Testimoni"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="banner-title-highlight" className="text-sm font-semibold text-gray-700">Judul (bagian hijau)</Label>
                <Input
                  id="banner-title-highlight"
                  className="mt-1.5 rounded-lg"
                  placeholder="Klien"
                  value={heroTitleHighlight}
                  onChange={(e) => setHeroTitleHighlight(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">Tampil sebagai: &quot;{heroTitle} {heroTitleHighlight}&quot;</p>
            <div>
              <Label htmlFor="banner-description" className="text-sm font-semibold text-gray-700">Deskripsi</Label>
              <Textarea
                id="banner-description"
                rows={3}
                className="mt-1.5 rounded-lg resize-none"
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
              />
            </div>
            <Button onClick={saveBanner} disabled={isSavingBanner} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingBanner ? "Menyimpan..." : "Simpan Banner"}
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Award size={16} className="text-primary" />
                Kartu Statistik
              </h3>
              <p className="mt-1 text-sm text-gray-500">Kartu putih yang menimpa bagian bawah banner.</p>
            </div>
            <SortableList
              id="testimoni-stats-list"
              items={statsList}
              getId={(s) => s._key}
              onReorder={(next) => setStats(next.map(stripKey))}
              renderItem={(s, i) => (
                <div className="grid grid-cols-[9rem_6rem_1fr_auto] items-center gap-2 rounded-xl border border-gray-200 p-2.5">
                  <IconPicker
                    value={s.icon}
                    onChange={(icon) => setStats((prev) => prev.map((x, idx) => (idx === i ? { ...x, icon } : x)))}
                  />
                  <Input
                    value={s.value}
                    onChange={(e) => setStats((prev) => prev.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))}
                    className="rounded-lg"
                    placeholder="5.000+"
                  />
                  <Input
                    value={s.label}
                    onChange={(e) => setStats((prev) => prev.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))}
                    className="rounded-lg"
                    placeholder="Label"
                  />
                  <button
                    type="button"
                    onClick={() => setStats((prev) => prev.filter((_, idx) => idx !== i))}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                    aria-label="Hapus statistik"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() => setStats((prev) => [...prev, { icon: "star", value: "", label: "" }])}
            >
              <Plus size={14} /> Tambah Statistik
            </Button>

            <Button onClick={saveStats} disabled={isSavingStats} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingStats ? "Menyimpan..." : "Simpan Statistik"}
            </Button>
          </div>
        </TabsContent>

        {/* ─── Tab Testimoni (teks) ─── */}
        <TabsContent value="teks" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex gap-2 sm:w-96">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Cari nama, perusahaan, atau isi testimoni..."
                  className="pl-9 rounded-xl h-10"
                  value={textSearch}
                  onChange={(e) => {
                    setTextSearch(e.target.value);
                    setTextPage(1);
                  }}
                />
              </div>
              <Button type="button" className="rounded-xl h-10 flex-shrink-0">
                Search
              </Button>
            </div>
            <Button size="sm" className="gap-1.5 rounded-xl self-start sm:self-auto" onClick={() => openForm(null, false)}>
              <Plus size={14} />
              Tambah Testimoni
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Menampilkan {textPageItems.length} dari {textTestimonials.length} testimoni
          </p>
          {renderTextGrid(textPageItems)}
          <Pagination
            page={textCurrentPage}
            totalPages={textTotalPages}
            onPageChange={setTextPage}
            pageSize={textPageSize}
            onPageSizeChange={(size) => {
              setTextPageSize(size);
              setTextPage(1);
            }}
          />
        </TabsContent>

        {/* ─── Tab Video Testimoni ─── */}
        <TabsContent value="video" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex gap-2 sm:w-96">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Cari nama atau perusahaan..."
                  className="pl-9 rounded-xl h-10"
                  value={videoSearch}
                  onChange={(e) => {
                    setVideoSearch(e.target.value);
                    setVideoPage(1);
                  }}
                />
              </div>
              <Button type="button" className="rounded-xl h-10 flex-shrink-0">
                Search
              </Button>
            </div>
            <Button size="sm" className="gap-1.5 rounded-xl self-start sm:self-auto" onClick={() => openForm(null, true)}>
              <Plus size={14} />
              Tambah Video Testimoni
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Menampilkan {videoPageItems.length} dari {videoTestimonials.length} video testimoni
          </p>
          {renderVideoGrid(videoPageItems)}
          <Pagination
            page={videoCurrentPage}
            totalPages={videoTotalPages}
            onPageChange={setVideoPage}
            pageSize={videoPageSize}
            onPageSizeChange={(size) => {
              setVideoPageSize(size);
              setVideoPage(1);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* ─── Dialog tambah/edit testimoni ─── */}
      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          {form && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                {form.id
                  ? form.isVideo ? "Edit Video Testimoni" : "Edit Testimoni"
                  : form.isVideo ? "Tambah Video Testimoni" : "Tambah Testimoni"}
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
                  <Label className="text-sm font-semibold text-gray-700">Kategori</Label>
                  <Select
                    items={{
                      [NO_CATEGORY]: "Tanpa kategori",
                      ...Object.fromEntries(categories.map((c) => [c.id, c.name])),
                    }}
                    value={form.categoryId}
                    onValueChange={(v) => v && setForm({ ...form, categoryId: v })}
                  >
                    <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} align="start">
                      <SelectItem value={NO_CATEGORY}>Tanpa kategori</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!form.isVideo && (
                  <>
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
                  </>
                )}

                {form.isVideo && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label htmlFor="ts-video-url" className="text-sm font-semibold text-gray-700">URL Video</Label>
                      <Input
                        id="ts-video-url"
                        className="mt-1.5 rounded-lg"
                        placeholder="https://..."
                        value={form.videoUrl}
                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-semibold text-gray-700">Thumbnail Video</Label>
                      <div className="mt-1.5 flex items-center gap-3">
                        {formThumbnailPreview && (
                          <button
                            type="button"
                            onClick={() => setPreviewThumbnail(formThumbnailPreview)}
                            className="relative flex-shrink-0 cursor-zoom-in"
                            aria-label="Lihat thumbnail lebih besar"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={formThumbnailPreview}
                              alt="Thumbnail"
                              className="h-16 w-28 rounded-lg border border-admin-line object-cover"
                            />
                            {isAutoThumbnail && (
                              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gray-900/80 px-1.5 py-0.5 text-[9px] font-medium text-white">
                                Otomatis dari YouTube
                              </span>
                            )}
                          </button>
                        )}
                        <div className="flex-1">
                          <input
                            type="file"
                            id="ts-thumbnail-file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            disabled={uploadingThumbnail}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadThumbnail(file);
                              e.target.value = "";
                            }}
                          />
                          <label
                            htmlFor="ts-thumbnail-file"
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-admin-line px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                            aria-disabled={uploadingThumbnail}
                          >
                            <Upload size={13} />
                            {uploadingThumbnail ? "Mengunggah..." : form.thumbnailUrl ? "Ganti gambar" : "Unggah gambar"}
                          </label>
                          <p className="mt-1 text-[11px] text-gray-400">
                            PNG/JPG/WebP, maks 2MB. Opsional — kalau kosong, otomatis pakai frame dari video YouTube di atas.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="ts-duration" className="text-sm font-semibold text-gray-700">Durasi</Label>
                      <Input
                        id="ts-duration"
                        className="mt-1.5 rounded-lg"
                        placeholder="mis. 1:28"
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setForm(null)}>
                  Batal
                </Button>
                <Button className="flex-1 rounded-lg" onClick={save} disabled={isPending || uploadingThumbnail}>
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Preview thumbnail ukuran penuh ─── */}
      <Dialog open={previewThumbnail !== null} onOpenChange={(o) => !o && setPreviewThumbnail(null)}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] overflow-hidden p-0 sm:max-w-2xl">
          <DialogTitle className="sr-only">Preview thumbnail</DialogTitle>
          {previewThumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewThumbnail}
              alt="Preview thumbnail"
              className="max-h-[80vh] w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Preview video testimoni ─── */}
      <Dialog open={previewVideo !== null} onOpenChange={(o) => !o && setPreviewVideo(null)}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] overflow-hidden p-0 sm:max-w-2xl">
          <DialogTitle className="sr-only">{previewVideo ? `Video testimoni ${previewVideo.name}` : "Video testimoni"}</DialogTitle>
          {previewVideo && (() => {
            const embedUrl = getYouTubeEmbedUrl(previewVideo.videoUrl);
            return embedUrl ? (
              <iframe
                src={`${embedUrl}?autoplay=1`}
                title={`Video testimoni ${previewVideo.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
              />
            ) : (
              <div className="grid aspect-video w-full place-items-center bg-gray-100 text-sm text-gray-500">
                URL video tidak valid.
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
