"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, Search, ChevronLeft, ChevronRight, Trash2, Eye,
} from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import type { ServiceTransaction, TransactionStatus, PaymentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  TRANSACTION_STATUS_LABELS, TRANSACTION_STATUS_COLORS,
  PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS,
} from "@/lib/transaction-status";
import { deleteTransactionAction } from "@/lib/actions/service-transactions";

type TransactionRow = Omit<ServiceTransaction, "totalPrice" | "discount" | "tax" | "grandTotal"> & {
  totalPrice: number;
  discount: number;
  tax: number;
  grandTotal: number;
  service: { id: string; title: string };
  package: { id: string; name: string } | null;
  assignedStaff: { id: string; name: string } | null;
  _count: { workflowSteps: number };
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const ALL = "__all__";

function Pagination({
  page, totalPages, onPageChange, pageSize, onPageSizeChange,
}: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
  pageSize: number; onPageSizeChange: (s: number) => void;
}) {
  return (
    <nav aria-label="Navigasi halaman" className="flex flex-wrap items-center justify-center gap-2 pt-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex items-center gap-1 rounded-lg border border-admin-line bg-white px-2.5 py-1.5 text-xs font-medium text-black transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronLeft size={14} /> Sebelumnya
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPageChange(n)}
          className={cn(
            "size-8 rounded-lg text-xs font-semibold transition-colors",
            n === page ? "bg-primary text-white" : "border border-admin-line bg-white text-black hover:border-primary/40 hover:text-primary",
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
        Selanjutnya <ChevronRight size={14} />
      </button>
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
            {PAGE_SIZE_OPTIONS.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </nav>
  );
}

/* ─── Halaman Daftar Transaksi Admin ─── */
export default function ServiceTransactionsManager({
  initialTransactions,
  panel,
}: {
  initialTransactions: TransactionRow[];
  panel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [paymentFilter, setPaymentFilter] = useState<string>(ALL);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const filtered = initialTransactions.filter((t) => {
    const q = search.trim().toLowerCase();
    const matchesQuery =
      !q ||
      t.code.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.customerEmail.toLowerCase().includes(q) ||
      t.service.title.toLowerCase().includes(q);
    const matchesStatus = statusFilter === ALL || t.status === statusFilter;
    const matchesPayment = paymentFilter === ALL || t.paymentStatus === paymentFilter;
    return matchesQuery && matchesStatus && matchesPayment;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const remove = async (t: TransactionRow) => {
    const confirmed = await swalConfirmDelete(`Transaksi "${t.code}"`);
    if (!confirmed) return;
    startTransition(async () => {
      const res = await deleteTransactionAction(t.id);
      if (res.ok) {
        swalSuccess("Transaksi dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex flex-1 flex-wrap gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari kode, customer, layanan..."
              className="pl-9 rounded-xl h-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select
            items={{ [ALL]: "Semua Status", ...TRANSACTION_STATUS_LABELS }}
            value={statusFilter}
            onValueChange={(v) => { if (v) { setStatusFilter(v); setPage(1); } }}
          >
            <SelectTrigger className="h-10 w-40 rounded-xl border-border/60 bg-background pl-3 font-medium hover:border-primary/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="start">
              <SelectItem value={ALL}>Semua Status</SelectItem>
              {Object.entries(TRANSACTION_STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            items={{ [ALL]: "Semua Pembayaran", ...PAYMENT_STATUS_LABELS }}
            value={paymentFilter}
            onValueChange={(v) => { if (v) { setPaymentFilter(v); setPage(1); } }}
          >
            <SelectTrigger className="h-10 w-44 rounded-xl border-border/60 bg-background pl-3 font-medium hover:border-primary/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="start">
              <SelectItem value={ALL}>Semua Pembayaran</SelectItem>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button asChild size="sm" className="gap-1.5 rounded-xl flex-shrink-0">
          <Link href={`/${panel}/transaksi/daftar/baru`}>
            <Plus size={14} /> Transaksi Baru
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-admin-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-line bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Layanan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Pembayaran</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Staff</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageItems.map((t) => {
                const statusColor = TRANSACTION_STATUS_COLORS[t.status as TransactionStatus];
                const paymentColor = PAYMENT_STATUS_COLORS[t.paymentStatus as PaymentStatus];
                return (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-xs font-semibold text-gray-900">{t.code}</div>
                      <div className="text-xs text-gray-400">Rp{t.grandTotal.toLocaleString("id-ID")}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-900">{t.customerName}</div>
                      <div className="text-xs text-gray-400">{t.customerEmail}</div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs">{t.service.title}</Badge>
                      {t.package && <div className="mt-1 text-xs text-gray-400">{t.package.name}</div>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", statusColor.bg, statusColor.text)}>
                        {TRANSACTION_STATUS_LABELS[t.status as TransactionStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", paymentColor.bg, paymentColor.text)}>
                        {PAYMENT_STATUS_LABELS[t.paymentStatus as PaymentStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 hidden lg:table-cell">
                      {t.assignedStaff?.name ?? "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/${panel}/transaksi/daftar/${t.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                          aria-label="Lihat detail transaksi"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          onClick={() => remove(t)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label="Hapus transaksi"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                    {initialTransactions.length === 0 ? "Belum ada transaksi." : "Tidak ada transaksi yang cocok."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-admin-line">
          <p className="text-xs text-gray-400">Menampilkan {pageItems.length} dari {filtered.length} transaksi</p>
        </div>
      </div>

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      />
    </div>
  );
}
