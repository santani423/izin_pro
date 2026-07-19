"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Star, Video, Upload, Play } from "lucide-react";
import { toast } from "sonner";
import type { ServiceCategory, Testimonial } from "@prisma/client";
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
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import {
  createTestimonialAction,
  deleteTestimonialAction,
  toggleTestimonialActiveAction,
  updateTestimonialAction,
  uploadTestimonialThumbnailAction,
  type TestimonialFormData,
} from "@/lib/actions/testimonials";

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

/** Konversi link YouTube (watch/short/embed) jadi URL embed. */
function getYouTubeEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") {
        videoId = u.searchParams.get("v");
      } else if (u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.split("/embed/")[1];
      } else if (u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.split("/shorts/")[1];
      }
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
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
}: {
  initialTestimonials: TestimonialWithRelations[];
  categories: ServiceCategory[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState | null>(null);
  const [toDelete, setToDelete] = useState<TestimonialWithRelations | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<TestimonialWithRelations | null>(null);

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

  const uploadThumbnail = async (file: File) => {
    setUploadingThumbnail(true);
    const fd = new FormData();
    fd.append("thumbnail", file);
    const res = await uploadTestimonialThumbnailAction(fd);
    setUploadingThumbnail(false);
    if (res.ok) {
      setForm((f) => (f ? { ...f, thumbnailUrl: res.url } : f));
    } else {
      toast.error(res.message);
    }
  };

  const toggleActive = (t: TestimonialWithRelations) => {
    startTransition(async () => {
      const res = await toggleTestimonialActiveAction(t.id, !t.isActive);
      if (res.ok) {
        toast.success("Status testimoni diperbarui");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const save = () => {
    if (!form) return;
    if (!form.name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    if (!form.isVideo && !form.content.trim()) {
      toast.error("Isi testimoni wajib diisi");
      return;
    }
    if (form.isVideo && !form.videoUrl.trim()) {
      toast.error("URL video wajib diisi untuk video testimoni");
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
        toast.success(form.id ? "Testimoni diperbarui" : "Testimoni ditambahkan");
        setForm(null);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const remove = () => {
    if (!toDelete) return;
    startTransition(async () => {
      const res = await deleteTestimonialAction(toDelete.id);
      if (res.ok) {
        toast.success("Testimoni dihapus");
        router.refresh();
      } else {
        toast.error(res.message);
      }
      setToDelete(null);
    });
  };

  const textTestimonials = initialTestimonials.filter((t) => !t.isVideo);
  const videoTestimonials = initialTestimonials.filter((t) => t.isVideo);

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
      {list.length === 0 && (
        <div className="col-span-full bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
          Belum ada testimoni.
        </div>
      )}
    </div>
  );

  const renderVideoGrid = (list: TestimonialWithRelations[]) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.map((t) => (
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
            {t.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.thumbnailUrl} alt={t.name} className="size-full object-cover" />
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
                  onClick={() => setToDelete(t)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Hapus video testimoni"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {list.length === 0 && (
        <div className="col-span-full bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
          Belum ada video testimoni.
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Tabs defaultValue="teks">
        <TabsList className="rounded-xl bg-gray-200">
          <TabsTrigger value="teks" className="rounded-lg">Testimoni</TabsTrigger>
          <TabsTrigger value="video" className="rounded-lg gap-1.5">
            <Video size={13} />
            Video Testimoni
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab Testimoni (teks) ─── */}
        <TabsContent value="teks" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{textTestimonials.length} testimoni</p>
            <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => openForm(null, false)}>
              <Plus size={14} />
              Tambah Testimoni
            </Button>
          </div>
          {renderTextGrid(textTestimonials)}
        </TabsContent>

        {/* ─── Tab Video Testimoni ─── */}
        <TabsContent value="video" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{videoTestimonials.length} video testimoni</p>
            <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => openForm(null, true)}>
              <Plus size={14} />
              Tambah Video Testimoni
            </Button>
          </div>
          {renderVideoGrid(videoTestimonials)}
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
                        {form.thumbnailUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewThumbnail(form.thumbnailUrl)}
                            className="flex-shrink-0 cursor-zoom-in"
                            aria-label="Lihat thumbnail lebih besar"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={form.thumbnailUrl}
                              alt="Thumbnail"
                              className="h-16 w-28 rounded-lg border border-admin-line object-cover"
                            />
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
                          <p className="mt-1 text-[11px] text-gray-400">PNG/JPG/WebP, maks 2MB. Opsional — kosongkan utk placeholder.</p>
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

      {/* ─── Konfirmasi hapus ─── */}
      <ConfirmDeleteDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete ? `Testimoni dari ${toDelete.name}` : ""}
        onConfirm={remove}
      />
    </div>
  );
}
