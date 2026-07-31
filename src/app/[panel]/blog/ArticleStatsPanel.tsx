"use client";

import { useEffect, useState, useTransition } from "react";
import { BarChart3, Eye, MessageSquare, Monitor, Smartphone, Tablet, MapPin, Check, Trash2 } from "lucide-react";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import { getArticleStatsAction, type ArticleStatsData } from "@/lib/actions/blog-stats";
import { approveCommentAction, deleteCommentAction } from "@/lib/actions/blog-comments";

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
};

/* ─── Panel detail statistik 1 artikel (kunjungan, device, lokasi,
 * komentar) — dirender di dalam Sheet, dibuka dari tombol Statistik di
 * BlogPageClient. Fetch on-demand tiap kali postId berganti/dibuka. ─── */
export default function ArticleStatsPanel({ postId, postTitle }: { postId: string; postTitle: string }) {
  const [data, setData] = useState<ArticleStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [busyCommentId, setBusyCommentId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getArticleStatsAction(postId).then((res) => {
      setLoading(false);
      if (res.ok) setData(res.data);
      else setError(res.message);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const approve = (commentId: string) => {
    setBusyCommentId(commentId);
    startTransition(async () => {
      const res = await approveCommentAction(commentId);
      setBusyCommentId(null);
      if (res.ok) {
        swalSuccess("Komentar disetujui");
        load();
      } else {
        swalError(res.message);
      }
    });
  };

  const remove = async (commentId: string) => {
    const confirmed = await swalConfirmDelete("Komentar ini");
    if (!confirmed) return;
    setBusyCommentId(commentId);
    startTransition(async () => {
      const res = await deleteCommentAction(commentId);
      setBusyCommentId(null);
      if (res.ok) {
        swalSuccess("Komentar dihapus");
        load();
      } else {
        swalError(res.message);
      }
    });
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <BarChart3 size={16} className="text-primary" />
          Statistik Artikel
        </SheetTitle>
        <p className="text-xs text-gray-500 line-clamp-1">{postTitle}</p>
      </SheetHeader>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        )}

        {!loading && error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && data && (
          <>
            {/* Kartu ringkasan */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-admin-line p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                  <Eye size={13} /> Total Kunjungan
                </div>
                <div className="mt-1.5 text-xl font-extrabold text-gray-900">
                  {data.totalViews.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="rounded-xl border border-admin-line p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                  <MessageSquare size={13} /> Total Komentar
                </div>
                <div className="mt-1.5 text-xl font-extrabold text-gray-900">{data.comments.length}</div>
                {data.pendingCount > 0 && (
                  <div className="mt-0.5 text-[11px] font-medium text-amber-600">
                    {data.pendingCount} menunggu
                  </div>
                )}
              </div>
            </div>

            {/* Breakdown device */}
            <div>
              <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-gray-400">Perangkat</h3>
              {data.deviceBreakdown.length === 0 ? (
                <p className="text-xs text-gray-400">Belum ada data kunjungan.</p>
              ) : (
                <div className="space-y-3">
                  {data.deviceBreakdown.map((d) => {
                    const Icon = DEVICE_ICONS[d.device] ?? Monitor;
                    const total = data.deviceBreakdown.reduce((sum, x) => sum + x.count, 0);
                    const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
                    return (
                      <div key={d.device}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="flex items-center gap-1.5 font-medium text-gray-700">
                            <Icon size={13} /> {d.device}
                          </span>
                          <span className="text-gray-400">
                            {d.count} ({pct}%)
                          </span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Breakdown lokasi */}
            <div>
              <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
                <MapPin size={12} /> Lokasi Pengunjung
              </h3>
              {data.locationBreakdown.length === 0 ? (
                <p className="text-xs text-gray-400">Lokasi tidak terdeteksi.</p>
              ) : (
                <ul className="space-y-2">
                  {data.locationBreakdown.map((l) => (
                    <li key={l.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{l.label}</span>
                      <span className="text-xs text-gray-400">{l.count} kunjungan</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Komentar */}
            <div>
              <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-gray-400">Komentar</h3>
              {data.comments.length === 0 ? (
                <p className="text-xs text-gray-400">Belum ada komentar.</p>
              ) : (
                <ul className="space-y-3">
                  {data.comments.map((c) => (
                    <li key={c.id} className="rounded-xl border border-admin-line p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{c.name}</p>
                          <p className="truncate text-xs text-gray-400">{c.email}</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            c.status === "PENDING"
                              ? "shrink-0 bg-amber-50 text-[10px] text-amber-700"
                              : "shrink-0 bg-emerald-50 text-[10px] text-emerald-700"
                          }
                        >
                          {c.status === "PENDING" ? "Menunggu" : "Disetujui"}
                        </Badge>
                      </div>
                      <p className="mt-1.5 text-sm text-gray-600">{c.content}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <div className="flex items-center gap-1">
                          {c.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => approve(c.id)}
                              disabled={busyCommentId === c.id}
                              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                              aria-label="Setujui komentar"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => remove(c.id)}
                            disabled={busyCommentId === c.id}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                            aria-label="Hapus komentar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
