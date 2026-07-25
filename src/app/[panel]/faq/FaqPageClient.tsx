"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, ChevronDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import { FAQS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* ─── Data FAQ diperluas dengan status ─── */
const faqData = FAQS.map((f, i) => ({
  ...f,
  id: String(i + 1),
  active: true,
  order: i + 1,
}));

type FaqRow = (typeof faqData)[number];

const emptyForm = (order: number): FaqRow => ({
  id: "",
  question: "",
  answer: "",
  active: true,
  order,
});

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

/* ─── Halaman Manajemen FAQ Admin ─── */
export default function FaqPageClient() {
  const [faqs, setFaqs] = useState(faqData);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqRow | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const toggleActive = (id: string) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)),
    );
  };

  const save = () => {
    if (!form) return;
    if (!form.question.trim() || !form.answer.trim()) {
      swalError("Pertanyaan dan jawaban wajib diisi");
      return;
    }
    if (form.id) {
      setFaqs((prev) => prev.map((f) => (f.id === form.id ? form : f)));
      swalSuccess("FAQ diperbarui");
    } else {
      setFaqs((prev) => [...prev, { ...form, id: String(Date.now()) }]);
      swalSuccess("FAQ ditambahkan");
    }
    setForm(null);
  };

  const removeFaq = async (faq: FaqRow) => {
    const confirmed = await swalConfirmDelete(`FAQ "${faq.question}"`);
    if (!confirmed) return;
    setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
    swalSuccess("FAQ dihapus");
  };

  const filtered = faqs.filter((f) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>

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
            <Button type="button" className="rounded-xl h-10 flex-shrink-0">
              Search
            </Button>
          </div>
          <Button size="sm" className="gap-1.5 rounded-xl flex-shrink-0" onClick={() => setForm(emptyForm(faqs.length + 1))}>
            <Plus size={14} />
            Tambah FAQ
          </Button>
        </div>

        <p className="text-sm text-gray-500">
          Menampilkan {pageItems.length} dari {filtered.length} pertanyaan
        </p>

        {/* ─── Daftar FAQ ─── */}
        <div className="space-y-3">
          {pageItems.map((faq) => (
            <div
              key={faq.id}
              className={`bg-white rounded-2xl border border-admin-line overflow-hidden transition-all ${
                !faq.active ? "opacity-60" : ""
              }`}
            >
              {/* Header baris FAQ */}
              <div className="flex items-center gap-3 px-5 py-4">
                {/* Drag handle */}
                <button className="text-gray-300 hover:text-gray-400 cursor-grab flex-shrink-0">
                  <GripVertical size={16} />
                </button>

                {/* Nomor urut */}
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {faq.order}
                </span>

                {/* Pertanyaan */}
                <button
                  className="flex-1 text-left text-sm font-semibold text-gray-800 hover:text-primary transition-colors"
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                >
                  {faq.question}
                </button>

                {/* Status toggle */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Switch
                    checked={faq.active}
                    onCheckedChange={() => toggleActive(faq.id)}
                    className="scale-[0.85]"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setForm(faq)}
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

              {/* Jawaban (expandable) */}
              {expandedId === faq.id && (
                <div className="px-5 pb-4 pt-0">
                  <div className="ml-[52px] text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 border border-admin-line">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
          {pageItems.length === 0 && (
            <div className="bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
              {faqs.length === 0 ? "Belum ada FAQ." : "Tidak ada FAQ yang cocok."}
            </div>
          )}
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
                  <Button className="flex-1 rounded-lg" onClick={save}>
                    Simpan
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
