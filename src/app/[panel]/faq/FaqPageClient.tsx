"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ChevronDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Faq, FaqScope } from "@prisma/client";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { SortableList } from "@/components/admin/SortableList";
import { cn } from "@/lib/utils";
import {
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
  toggleFaqActiveAction,
  reorderFaqAction,
} from "@/lib/actions/faq";

type FaqWithService = Faq & { service: { title: string } | null };

interface FormState {
  id: string;
  question: string;
  answer: string;
  scope: FaqScope;
  serviceId: string | null;
}

const emptyForm = (): FormState => ({ id: "", question: "", answer: "", scope: "GLOBAL", serviceId: null });

const SCOPE_LABELS: Record<FaqScope, string> = {
  GLOBAL: "Global",
  KONTAK: "Kontak",
  SERVICE: "Layanan Tertentu",
};

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

/* ─── Halaman Manajemen FAQ Admin (tersambung Prisma) ─── */
export default function FaqPageClient({
  initialFaqs,
  services,
}: {
  initialFaqs: FaqWithService[];
  services: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isReordering, startReorderTransition] = useTransition();
  const [prevInitialFaqs, setPrevInitialFaqs] = useState(initialFaqs);
  const [faqs, setFaqs] = useState(initialFaqs);
  if (initialFaqs !== prevInitialFaqs) {
    setPrevInitialFaqs(initialFaqs);
    setFaqs(initialFaqs);
  }

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const toggleActive = (faq: FaqWithService) => {
    startTransition(async () => {
      try {
        const res = await toggleFaqActiveAction(faq.id, !faq.isActive);
        if (res.ok) {
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal mengubah status FAQ. Cek koneksi lalu coba lagi.");
      }
    });
  };

  const save = () => {
    if (!form) return;
    if (!form.question.trim() || !form.answer.trim()) {
      swalError("Pertanyaan dan jawaban wajib diisi");
      return;
    }
    if (form.scope === "SERVICE" && !form.serviceId) {
      swalError("Layanan wajib dipilih untuk scope Layanan Tertentu");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          question: form.question,
          answer: form.answer,
          scope: form.scope,
          serviceId: form.scope === "SERVICE" ? form.serviceId : null,
        };
        const res = form.id
          ? await updateFaqAction(form.id, payload)
          : await createFaqAction(payload);
        if (res.ok) {
          swalSuccess(form.id ? "FAQ diperbarui" : "FAQ ditambahkan");
          setForm(null);
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan FAQ. Cek koneksi lalu coba lagi.");
      }
    });
  };

  const removeFaq = async (faq: FaqWithService) => {
    const confirmed = await swalConfirmDelete(`FAQ "${faq.question}"`);
    if (!confirmed) return;
    startTransition(async () => {
      try {
        const res = await deleteFaqAction(faq.id);
        if (res.ok) {
          setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
          swalSuccess("FAQ dihapus");
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menghapus FAQ. Cek koneksi lalu coba lagi.");
      }
    });
  };

  const filtered = faqs.filter((f) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const canReorder = search.trim() === "" && totalPages === 1;

  const handleReorder = (next: FaqWithService[]) => {
    setFaqs(next);
    startReorderTransition(async () => {
      try {
        const res = await reorderFaqAction(next.map((f) => f.id));
        if (!res.ok) {
          swalError(res.message);
          setFaqs(initialFaqs);
        }
      } catch {
        swalError("Gagal mengubah urutan FAQ. Cek koneksi lalu coba lagi.");
        setFaqs(initialFaqs);
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
              placeholder="Cari pertanyaan atau jawaban..."
              className="pl-9 rounded-xl h-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <Button size="sm" className="gap-1.5 rounded-xl flex-shrink-0" onClick={() => setForm(emptyForm())}>
          <Plus size={14} />
          Tambah FAQ
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan {pageItems.length} dari {filtered.length} pertanyaan
        </p>
        {!canReorder && filtered.length > 0 && (
          <p className="text-xs text-gray-400">
            Kosongkan pencarian &amp; tampilkan &ldquo;Semua&rdquo; per halaman untuk mengurutkan drag-and-drop.
          </p>
        )}
      </div>

      <SortableList
        id="faq-list"
        items={pageItems}
        getId={(f) => f.id}
        disabled={!canReorder || isReordering}
        onReorder={handleReorder}
        renderItem={(faq) => (
          <div
            className={`bg-white rounded-2xl border border-admin-line overflow-hidden transition-all ${
              !faq.isActive ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center gap-3 px-5 py-4">
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 flex-shrink-0">
                {SCOPE_LABELS[faq.scope]}
                {faq.scope === "SERVICE" && faq.service ? ` · ${faq.service.title}` : ""}
              </span>

              <button
                className="flex-1 text-left text-sm font-semibold text-gray-800 hover:text-primary transition-colors"
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              >
                {faq.question}
              </button>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Switch
                  checked={faq.isActive}
                  disabled={isPending}
                  onCheckedChange={() => toggleActive(faq)}
                  className="scale-[0.85]"
                />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setForm({
                        id: faq.id,
                        question: faq.question,
                        answer: faq.answer,
                        scope: faq.scope,
                        serviceId: faq.serviceId,
                      })
                    }
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                    aria-label="Edit FAQ"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => removeFaq(faq)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Hapus FAQ"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronDown
                    size={16}
                    className={cn("transition-transform duration-200", expandedId === faq.id && "rotate-180")}
                  />
                </button>
              </div>
            </div>

            {expandedId === faq.id && (
              <div className="px-5 pb-4 pt-0">
                <div className="ml-1 text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 border border-admin-line">
                  {faq.answer}
                </div>
              </div>
            )}
          </div>
        )}
      />
      {pageItems.length === 0 && (
        <div className="bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
          {faqs.length === 0 ? "Belum ada FAQ." : "Tidak ada FAQ yang cocok."}
        </div>
      )}

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

      {/* ─── Dialog tambah/edit FAQ ─── */}
      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          {form && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                {form.id ? "Edit FAQ" : "Tambah FAQ"}
              </DialogTitle>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Scope</Label>
                  <Select
                    items={SCOPE_LABELS}
                    value={form.scope}
                    onValueChange={(v) => v && setForm({ ...form, scope: v as FaqScope, serviceId: v === "SERVICE" ? form.serviceId : null })}
                  >
                    <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} align="start">
                      {(Object.keys(SCOPE_LABELS) as FaqScope[]).map((s) => (
                        <SelectItem key={s} value={s}>{SCOPE_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.scope === "SERVICE" && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Layanan</Label>
                    <Select
                      items={Object.fromEntries(services.map((s) => [s.id, s.title]))}
                      value={form.serviceId ?? undefined}
                      onValueChange={(v) => v && setForm({ ...form, serviceId: v })}
                    >
                      <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg">
                        <SelectValue placeholder="Pilih layanan..." />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false} align="start">
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="f-question" className="text-sm font-semibold text-gray-700">Pertanyaan</Label>
                  <Input
                    id="f-question"
                    className="mt-1.5 rounded-lg"
                    placeholder="mis. Berapa lama proses pendirian PT?"
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="f-answer" className="text-sm font-semibold text-gray-700">Jawaban</Label>
                  <Textarea
                    id="f-answer"
                    rows={4}
                    className="mt-1.5 rounded-lg resize-none"
                    placeholder="Tulis jawaban lengkap..."
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
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
