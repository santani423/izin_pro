"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, ChevronDown, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import type { BlogPost, Category, Tag, PostTag } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TagPicker } from "@/components/admin/TagPicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  createBlogPostAction,
  updateBlogPostAction,
  uploadBlogFeaturedImageAction,
  type BlogPostFormData,
  type TagOption,
} from "@/lib/actions/blog";

type BlogPostWithRelations = BlogPost & {
  category: Category;
  featuredMedia: { id: string; url: string } | null;
  tags: (PostTag & { tag: Tag })[];
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const STATUS_ITEMS: Record<string, string> = { DRAFT: "Draft", PUBLISHED: "Published" };

export default function BlogFormPageClient({
  mode,
  categories,
  post,
  panel,
}: {
  mode: "create" | "edit";
  categories: Category[];
  post?: BlogPostWithRelations;
  panel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [dragOver, setDragOver] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? categories[0]?.id ?? "");
  const [tags, setTags] = useState<TagOption[]>(post?.tags.map((pt) => pt.tag) ?? []);
  const [featuredMediaId, setFeaturedMediaId] = useState<string | null>(post?.featuredMediaId ?? null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(post?.featuredMedia?.url ?? null);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(post?.status ?? "DRAFT");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const uploadFeaturedImage = async (file: File) => {
    setUploadingImage(true);
    const fd = new FormData();
    fd.append("image", file);
    const res = await uploadBlogFeaturedImageAction(fd);
    setUploadingImage(false);
    if (res.ok) {
      setFeaturedMediaId(res.mediaId);
      setFeaturedImageUrl(res.url);
    } else {
      toast.error(res.message);
    }
  };

  const save = () => {
    if (!title.trim()) return toast.error("Judul wajib diisi");
    if (!slug.trim()) return toast.error("Slug wajib diisi");
    if (!excerpt.trim()) return toast.error("Ringkasan wajib diisi");
    if (!content.trim()) return toast.error("Isi artikel wajib diisi");
    if (!categoryId) return toast.error("Kategori wajib dipilih");

    const payload: BlogPostFormData = {
      title,
      slug,
      excerpt,
      content,
      categoryId,
      featuredMediaId,
      status,
      metaTitle: metaTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
      tagIds: tags.map((t) => t.id),
    };

    startTransition(async () => {
      const res =
        mode === "edit" && post
          ? await updateBlogPostAction(post.id, payload)
          : await createBlogPostAction(payload);

      if (res.ok) {
        toast.success(mode === "edit" ? "Artikel diperbarui" : "Artikel ditambahkan");
        if (mode === "edit" && post) {
          // Tetap di halaman edit — kalau slug berubah, betulkan URL-nya saja.
          if (payload.slug !== post.slug) {
            router.replace(`/${panel}/blog/${payload.slug}/edit`);
          }
        } else {
          router.push(`/${panel}/blog`);
        }
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/${panel}/blog`}
            className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label="Kembali ke daftar artikel"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">
            {mode === "edit" ? "Edit Artikel" : "Artikel Baru"}
          </h1>
        </div>
        {mode === "edit" && post?.status === "PUBLISHED" ? (
          <Button asChild type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg">
            <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
              <Eye size={14} />
              Preview
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="gap-1.5 rounded-lg"
            title={
              mode === "create"
                ? "Simpan artikel dulu untuk melihat preview"
                : "Artikel masih draft, publish dulu untuk melihat preview"
            }
          >
            <Eye size={14} />
            Preview
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom kiri: judul + konten */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-admin-line p-6 space-y-5 flex flex-col h-full">
          <div>
            <Label htmlFor="bp-title" className="text-sm font-semibold text-gray-700">Judul</Label>
            <Input
              id="bp-title"
              className="mt-1.5 rounded-lg"
              placeholder="Judul artikel"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <Label className="text-sm font-semibold text-gray-700">Isi Artikel</Label>
            <RichTextEditor value={content} onChange={setContent} className="flex-1" />
          </div>
        </div>

        {/* Kolom kanan: metadata */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5">
            <div>
              <Label htmlFor="bp-slug" className="text-sm font-semibold text-gray-700">Slug</Label>
              <Input
                id="bp-slug"
                className="mt-1.5 rounded-lg font-mono text-sm"
                placeholder="slug-artikel"
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugTouched(true);
                }}
              />
              <p className="mt-1 text-[11px] text-gray-400">URL publik: /blog/{slug || "..."}</p>
            </div>

            <div>
              <Label htmlFor="bp-excerpt" className="text-sm font-semibold text-gray-700">Ringkasan</Label>
              <Textarea
                id="bp-excerpt"
                rows={3}
                className="mt-1.5 rounded-lg resize-none"
                placeholder="Ringkasan singkat artikel (tampil di daftar &amp; hasil pencarian)..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">Kategori</Label>
              <Select
                items={Object.fromEntries(categories.map((c) => [c.id, c.name]))}
                value={categoryId}
                onValueChange={(v) => v && setCategoryId(v)}
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
              <Label className="text-sm font-semibold text-gray-700">Status</Label>
              <Select
                items={STATUS_ITEMS}
                value={status}
                onValueChange={(v) => v && setStatus(v as "DRAFT" | "PUBLISHED")}
              >
                <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start">
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">Tag</Label>
              <TagPicker value={tags} onChange={setTags} />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">Cover Image</Label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) uploadFeaturedImage(file);
                }}
                className={`mt-1.5 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                  dragOver ? "border-primary bg-primary/5" : "border-admin-line bg-gray-50/50"
                }`}
              >
                {featuredImageUrl ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setImagePreviewOpen(true)}
                      className="block w-full cursor-zoom-in"
                      aria-label="Lihat gambar secara detail"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredImageUrl}
                        alt="Cover"
                        className="h-32 w-full rounded-lg border border-admin-line object-cover"
                      />
                    </button>
                    <label
                      htmlFor="bp-featured-image"
                      className="cursor-pointer text-xs font-semibold text-primary hover:underline aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      aria-disabled={uploadingImage}
                    >
                      {uploadingImage ? "Mengunggah..." : "Ganti gambar"}
                    </label>
                  </>
                ) : (
                  <>
                    <ImagePlus size={22} className="text-gray-300" />
                    <p className="text-xs text-gray-400">
                      Drag and Drop Images atau{" "}
                      <label
                        htmlFor="bp-featured-image"
                        className="cursor-pointer font-semibold text-primary hover:underline aria-disabled:pointer-events-none aria-disabled:opacity-50"
                        aria-disabled={uploadingImage}
                      >
                        {uploadingImage ? "Mengunggah..." : "Upload Image"}
                      </label>
                    </p>
                  </>
                )}
                <input
                  type="file"
                  id="bp-featured-image"
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
              <p className="mt-1 text-[11px] text-gray-400">
                PNG/JPG/WebP, otomatis dikompres &amp; dikonversi ke WebP. Opsional.
              </p>

              <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
                <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-2xl">
                  <DialogTitle className="sr-only">Preview Cover Image</DialogTitle>
                  {featuredImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featuredImageUrl}
                      alt="Preview cover"
                      className="max-h-[70vh] w-full bg-gray-50 object-contain"
                    />
                  )}
                  <div className="flex items-center justify-between gap-3 border-t border-admin-line p-4">
                    <p className="text-xs text-gray-400">Belum jadi pakai gambar ini?</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => {
                        setFeaturedMediaId(null);
                        setFeaturedImageUrl(null);
                        setImagePreviewOpen(false);
                      }}
                    >
                      <Trash2 size={14} className="mr-1.5" />
                      Hapus Gambar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-admin-line p-6">
            <button
              type="button"
              onClick={() => setShowSeo((s) => !s)}
              className="flex w-full items-center justify-between text-sm font-semibold text-gray-700"
            >
              SEO (opsional)
              <ChevronDown size={16} className={showSeo ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
            {showSeo && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="bp-meta-title" className="text-sm font-semibold text-gray-700">Meta Title</Label>
                  <Input
                    id="bp-meta-title"
                    className="mt-1.5 rounded-lg"
                    placeholder="Kosongkan utk pakai judul artikel"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bp-meta-desc" className="text-sm font-semibold text-gray-700">Meta Description</Label>
                  <Textarea
                    id="bp-meta-desc"
                    rows={2}
                    className="mt-1.5 rounded-lg resize-none"
                    placeholder="Kosongkan utk pakai ringkasan artikel"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="rounded-lg" asChild>
          <Link href={`/${panel}/blog`}>Batal</Link>
        </Button>
        <Button className="rounded-lg" onClick={save} disabled={isPending || uploadingImage}>
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
