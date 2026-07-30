"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Eye, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import type { Inquiry, InquiryStatus } from "@prisma/client";
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
import { updateInquiryStatusAction, deleteInquiryAction } from "@/lib/actions/inquiry";

type InquiryWithService = Inquiry & { service: { title: string } | null };

const STATUS_ORDER: InquiryStatus[] = ["BARU", "DIPROSES", "SELESAI"];

const STATUS_LABEL: Record<InquiryStatus, string> = {
  BARU: "Baru",
  DIPROSES: "Diproses",
  SELESAI: "Selesai",
};

const statusColor: Record<InquiryStatus, string> = {
  BARU: "bg-primary/10 text-primary",
  DIPROSES: "bg-amber-50 text-amber-600",
  SELESAI: "bg-emerald-50 text-emerald-600",
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

/* ─── Halaman Manajemen Inquiry Admin (tersambung Prisma) ─── */
export default function InquiryPageClient({
  initialInquiries,
}: {
  initialInquiries: InquiryWithService[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<InquiryStatus | "Semua">("Semua");
  const [detail, setDetail] = useState<InquiryWithService | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const filtered = initialInquiries.filter((i) => {
    const q = search.toLowerCase();
    const layanan = i.service?.title ?? "Lainnya";
    const matchSearch =
      i.name.toLowerCase().includes(q) || layanan.toLowerCase().includes(q);
    const matchFilter = filter === "Semua" || i.status === filter;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const setStatus = (id: string, status: InquiryStatus) => {
    startTransition(async () => {
      const res = await updateInquiryStatusAction(id, status);
      if (res.ok) {
        setDetail((d) => (d && d.id === id ? { ...d, status } : d));
        swalSuccess(`Status inquiry diubah ke "${STATUS_LABEL[status]}"`);
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const remove = async (item: InquiryWithService) => {
    const confirmed = await swalConfirmDelete(`Inquiry dari ${item.name}`);
    if (!confirmed) return;
    startTransition(async () => {
      const res = await deleteInquiryAction(item.id);
      if (res.ok) {
        swalSuccess("Inquiry dihapus");
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
              placeholder="Cari nama atau layanan..."
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
        <div className="flex items-center gap-1 p-1 bg-gray-200 rounded-xl w-fit">
          {(["Semua", ...STATUS_ORDER] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setPage(1);
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                filter === s ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700",
              )}
            >
              {s === "Semua" ? "Semua" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tabel Inquiry ─── */}
      <div className="bg-white rounded-2xl border border-admin-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-line bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Layanan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Waktu</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                        {item.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{item.name}</div>
                        <div className="text-xs text-gray-400 truncate">{item.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell whitespace-nowrap">{item.service?.title ?? "Lainnya"}</td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                      <Clock size={11} />
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {/* Klik pill status untuk lanjut ke status berikutnya */}
                    <button
                      disabled={isPending}
                      onClick={() =>
                        setStatus(
                          item.id,
                          STATUS_ORDER[(STATUS_ORDER.indexOf(item.status) + 1) % STATUS_ORDER.length],
                        )
                      }
                      title="Klik untuk ubah status"
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-opacity hover:opacity-75 disabled:pointer-events-none disabled:opacity-50",
                        statusColor[item.status],
                      )}
                    >
                      {STATUS_LABEL[item.status]}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDetail(item)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                        aria-label="Lihat detail"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => remove(item)}
                        disabled={isPending}
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
                    Tidak ada inquiry yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-admin-line">
          <p className="text-xs text-gray-400">
            Menampilkan {pageItems.length} dari {filtered.length} inquiry
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

      {/* ─── Dialog detail inquiry ─── */}
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-md">
          {detail && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                Detail Inquiry
              </DialogTitle>
              <div className="space-y-3 text-sm">
                {[
                  ["Nama", detail.name],
                  ["Email", detail.email],
                  ["WhatsApp", detail.whatsapp],
                  ["Layanan", detail.service?.title ?? "Lainnya"],
                  ["Waktu", formatTimeAgo(detail.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-3">
                    <span className="w-24 flex-shrink-0 text-gray-400">{label}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
                <div>
                  <span className="text-gray-400">Pesan</span>
                  <p className="mt-1 rounded-lg bg-gray-50 p-3 text-gray-700 leading-relaxed">
                    {detail.message}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-gray-400">Status:</span>
                  {STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      disabled={isPending}
                      onClick={() => setStatus(detail.id, s)}
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full transition-all disabled:pointer-events-none disabled:opacity-50",
                        detail.status === s
                          ? statusColor[s]
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100",
                      )}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-lg"
                onClick={() => setDetail(null)}
              >
                Tutup
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
