"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import AdminHeader from "@/components/admin/AdminHeader";
import { FAQS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* ─── Data FAQ diperluas dengan status ─── */
const faqData = FAQS.map((f, i) => ({
  ...f,
  id: String(i + 1),
  active: true,
  order: i + 1,
}));

/* ─── Halaman Manajemen FAQ Admin ─── */
export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState(faqData);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleActive = (id: string) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)),
    );
  };

  return (
    <>
      <AdminHeader title="FAQ" subtitle="Kelola pertanyaan yang sering diajukan" />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{faqs.length} pertanyaan</p>
          <Button size="sm" className="gap-1.5 rounded-xl">
            <Plus size={14} />
            Tambah FAQ
          </Button>
        </div>

        {/* ─── Daftar FAQ ─── */}
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={`bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all ${
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
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
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
                  <div className="ml-[52px] text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
