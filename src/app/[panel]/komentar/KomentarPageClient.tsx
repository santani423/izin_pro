"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, Trash2, Check, Eye, ExternalLink, Clock, ChevronLeft, ChevronRight,
} from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import type { Comment, CommentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { approveCommentAction, deleteCommentAction } from "@/lib/actions/blog-comments";

type CommentWithPost = Comment & { post: { title: string; slug: string } };

const STATUS_LABEL: Record<CommentStatus, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
};

const STATUS_COLOR: Record<CommentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-600",
  APPROVED: "bg-emerald-50 text-emerald-600",
};

/** Waktu relatif ringkas ("5 menit lalu", "3 jam lalu", "Kemarin", dst). */
function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

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

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

/* ─── Halaman Manajemen Komentar Admin (lintas semua artikel) ───
 * Beda dari panel Statistik per-artikel di /admin/blog: di sini SEMUA
 * komentar dari SEMUA artikel dikelola dari satu tempat (cari, filter
 * status, approve, hapus) — gak perlu buka tiap artikel satu-satu. */
export default function KomentarPageClient({
  initialComments,
}: {
  initialComments: CommentWithPost[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CommentStatus | "Semua">("Semua");
  const [detail, setDetail] = useState<CommentWithPost | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const pendingCount = initialComments.filter((c) => c.status === "PENDING").length;

  const filtered = initialComments.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      (c.email?.toLowerCase().includes(q) ?? false) ||
      c.content.toLowerCase().includes(q) ||
      c.post.title.toLowerCase().includes(q);
    const matchFilter = filter === "Semua" || c.status === filter;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const approve = (comment: CommentWithPost) => {
    setBusyId(comment.id);
    startTransition(async () => {
      const res = await approveCommentAction(comment.id);
      setBusyId(null);
      if (res.ok) {
        setDetail((d) => (d && d.id === comment.id ? { ...d, status: "APPROVED" } : d));
        swalSuccess("Komentar disetujui");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const remove = async (comment: CommentWithPost) => {
    const confirmed = await swalConfirmDelete(`Komentar dari ${comment.name}`);
    if (!confirmed) return;
    setBusyId(comment.id);
    startTransition(async () => {
      const res = await deleteCommentAction(comment.id);
      setBusyId(null);
      if (res.ok) {
        setDetail((d) => (d && d.id === comment.id ? null : d));
        swalSuccess("Komentar dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ─── Toolbar: cari + filter status ─── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari nama, email, isi komentar, atau artikel..."
              className="pl-9 rounded-xl h-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 bg-gray-200 rounded-xl w-fit">
          {(["Semua", "PENDING", "APPROVED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setPage(1);
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                filter === s ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700",
              )}
            >
              {s === "Semua" ? "Semua" : STATUS_LABEL[s]}
              {s === "PENDING" && pendingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tabel Komentar ─── */}
      <div className="bg-white rounded-2xl border border-admin-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-line bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Komentar</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Artikel</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Waktu</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageItems.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 max-w-xs">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                        {getInitials(c.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{c.name}</div>
                        {c.email && <div className="text-xs text-gray-400 truncate">{c.email}</div>}
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{c.content}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell max-w-[200px]">
                    <Link
                      href={`/blog/${c.post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 truncate hover:text-primary hover:underline"
                      title={c.post.title}
                    >
                      <span className="truncate">{c.post.title}</span>
                      <ExternalLink size={11} className="flex-shrink-0" />
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                      <Clock size={11} />
                      {formatTimeAgo(c.createdAt)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap",
                        STATUS_COLOR[c.status],
                      )}
                    >
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDetail(c)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                        aria-label="Lihat detail"
                      >
                        <Eye size={14} />
                      </button>
                      {c.status === "PENDING" && (
                        <button
                          onClick={() => approve(c)}
                          disabled={isPending && busyId === c.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:pointer-events-none disabled:opacity-50"
                          aria-label="Setujui komentar"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => remove(c)}
                        disabled={isPending && busyId === c.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:pointer-events-none disabled:opacity-50"
                        aria-label="Hapus"
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
                    Tidak ada komentar yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-admin-line">
          <p className="text-xs text-gray-400">
            Menampilkan {pageItems.length} dari {filtered.length} komentar
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

      {/* ─── Dialog detail komentar ─── */}
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-md">
          {detail && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                Detail Komentar
              </DialogTitle>
              <div className="space-y-3 text-sm">
                {[
                  ["Nama", detail.name],
                  ["Email", detail.email ?? "-"],
                  ["Artikel", detail.post.title],
                  ["Waktu", formatTimeAgo(detail.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-3">
                    <span className="w-16 flex-shrink-0 text-gray-400">{label}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
                <div>
                  <span className="text-gray-400">Komentar</span>
                  <p className="mt-1 rounded-lg bg-gray-50 p-3 text-gray-700 leading-relaxed">
                    {detail.content}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full",
                      STATUS_COLOR[detail.status],
                    )}
                  >
                    {STATUS_LABEL[detail.status]}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                {detail.status === "PENDING" && (
                  <Button
                    variant="outline"
                    className="rounded-lg gap-1.5"
                    disabled={isPending && busyId === detail.id}
                    onClick={() => approve(detail)}
                  >
                    <Check size={14} /> Setujui
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="rounded-lg gap-1.5 text-red-500 hover:text-red-600"
                  disabled={isPending && busyId === detail.id}
                  onClick={() => remove(detail)}
                >
                  <Trash2 size={14} /> Hapus
                </Button>
                <Button variant="outline" className="rounded-lg" onClick={() => setDetail(null)}>
                  Tutup
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
