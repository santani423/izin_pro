"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, ChevronDown } from "lucide-react";
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
}: {
  mode: "create" | "edit";
  categories: Category[];
  post?: BlogPostWithRelations;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

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
        router.push("/admin/blog");
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/blog"
          className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
          aria-label="Kembali ke daftar artikel"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">
          {mode === "edit" ? "Edit Artikel" : "Artikel Baru"}
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5">
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
            rows={2}
            className="mt-1.5 rounded-lg resize-none"
            placeholder="Ringkasan singkat artikel (tampil di daftar &amp; hasil pencarian)..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700">Tag</Label>
          <TagPicker value={tags} onChange={setTags} />
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700">Gambar Unggulan</Label>
          <div className="mt-1.5 flex items-center gap-3">
            {featuredImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featuredImageUrl}
                alt="Gambar unggulan"
                className="h-16 w-28 flex-shrink-0 rounded-lg border border-admin-line object-cover"
              />
            )}
            <div className="flex-1">
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
              <label
                htmlFor="bp-featured-image"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-admin-line px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                aria-disabled={uploadingImage}
              >
                <Upload size={13} />
                {uploadingImage ? "Mengunggah..." : featuredImageUrl ? "Ganti gambar" : "Unggah gambar"}
              </label>
              <p className="mt-1 text-[11px] text-gray-400">PNG/JPG/WebP, maks 2MB. Opsional.</p>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700">Isi Artikel</Label>
          <RichTextEditor value={content} onChange={setContent} />
        </div>

        <div className="border-t border-admin-line pt-4">
          <button
            type="button"
            onClick={() => setShowSeo((s) => !s)}
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-700"
          >
            SEO (opsional)
            <ChevronDown size={16} className={showSeo ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
          {showSeo && (
            <div className="mt-3 space-y-4">
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

      <div className="flex gap-2">
        <Button variant="outline" className="rounded-lg" asChild>
          <Link href="/admin/blog">Batal</Link>
        </Button>
        <Button className="rounded-lg" onClick={save} disabled={isPending || uploadingImage}>
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
