"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";
import type { BlogPost, Category, Tag, PostTag } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { cn } from "@/lib/utils";
import { deleteBlogPostAction, toggleBlogPostStatusAction } from "@/lib/actions/blog";

type BlogPostRow = BlogPost & {
  category: Category;
  author: { name: string } | null;
  featuredMedia: { url: string } | null;
  tags: (PostTag & { tag: Tag })[];
};

const GRADIENTS = [
  "from-emerald-400 to-green-600",
  "from-sky-400 to-blue-600",
  "from-amber-400 to-orange-600",
  "from-violet-400 to-purple-600",
  "from-rose-400 to-red-500",
];

function hashGradient(seed: string) {
  const sum = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
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

export default function BlogPageClient({
  initialPosts,
}: {
  initialPosts: BlogPostRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [toDelete, setToDelete] = useState<BlogPostRow | null>(null);

  const filtered = initialPosts.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.name.toLowerCase().includes(q) ||
      p.tags.some((t) => t.tag.name.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleStatus = (post: BlogPostRow) => {
    const next = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    startTransition(async () => {
      const res = await toggleBlogPostStatusAction(post.id, next);
      if (res.ok) {
        toast.success("Status artikel diperbarui");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const remove = () => {
    if (!toDelete) return;
    startTransition(async () => {
      const res = await deleteBlogPostAction(toDelete.id);
      if (res.ok) {
        toast.success("Artikel dihapus");
        router.refresh();
      } else {
        toast.error(res.message);
      }
      setToDelete(null);
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex gap-2 sm:w-96">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari judul, kategori, atau tag..."
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
        <Button asChild size="sm" className="gap-1.5 rounded-xl self-start sm:self-auto">
          <Link href="/admin/blog/new">
            <Plus size={14} />
            Artikel Baru
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-admin-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-line bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Kategori</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Penulis</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageItems.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {post.featuredMedia?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.featuredMedia.url}
                          alt={post.title}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg bg-gradient-to-br flex-shrink-0",
                            hashGradient(post.slug),
                          )}
                        />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 line-clamp-1 max-w-[260px]">{post.title}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Eye size={11} />
                          {post.views.toLocaleString("id-ID")} views
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <Badge variant="secondary" className="text-xs rounded-lg">{post.category.name}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 hidden lg:table-cell">
                    {post.author?.name ?? "-"}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleStatus(post)}
                      disabled={isPending}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-50",
                        post.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500",
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full", post.status === "PUBLISHED" ? "bg-emerald-500" : "bg-gray-400")} />
                      {post.status === "PUBLISHED" ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/blog/${post.slug}/edit`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                        aria-label="Edit artikel"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => setToDelete(post)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Hapus artikel"
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
                    Tidak ada artikel yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-admin-line">
          <p className="text-xs text-gray-400">
            Menampilkan {pageItems.length} dari {filtered.length} artikel
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

      <ConfirmDeleteDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete ? `Artikel "${toDelete.title}"` : ""}
        onConfirm={remove}
      />
    </div>
  );
}
