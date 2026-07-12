"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, ChevronDown } from "lucide-react";
import { toast } from "sonner";
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
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
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

/* ─── Halaman Manajemen FAQ Admin ─── */
export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState(faqData);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqRow | null>(null);
  const [toDelete, setToDelete] = useState<FaqRow | null>(null);

  const toggleActive = (id: string) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)),
    );
  };

  const save = () => {
    if (!form) return;
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Pertanyaan dan jawaban wajib diisi");
      return;
    }
    if (form.id) {
      setFaqs((prev) => prev.map((f) => (f.id === form.id ? form : f)));
      toast.success("FAQ diperbarui");
    } else {
      setFaqs((prev) => [...prev, { ...form, id: String(Date.now()) }]);
      toast.success("FAQ ditambahkan");
    }
    setForm(null);
  };

  return (
    <>

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{faqs.length} pertanyaan</p>
          <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => setForm(emptyForm(faqs.length + 1))}>
            <Plus size={14} />
            Tambah FAQ
          </Button>
        </div>

        {/* ─── Daftar FAQ ─── */}
        <div className="space-y-3">
          {faqs.map((faq) => (
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
                      onClick={() => setToDelete(faq)}
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
        </div>

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

        {/* ─── Konfirmasi hapus ─── */}
        <ConfirmDeleteDialog
          open={toDelete !== null}
          onOpenChange={(o) => !o && setToDelete(null)}
          itemLabel={toDelete ? `FAQ "${toDelete.question}"` : ""}
          onConfirm={() => {
            if (toDelete) {
              setFaqs((prev) => prev.filter((f) => f.id !== toDelete.id));
              toast.success("FAQ dihapus");
            }
          }}
        />
      </div>
    </>
  );
}
