"use client";

import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import AdminHeader from "@/components/admin/AdminHeader";
import { TESTIMONIALS } from "@/lib/constants";

/* ─── Halaman Manajemen Testimoni Admin ─── */
export default function AdminTestimoniPage() {
  return (
    <>
      <AdminHeader title="Testimoni" subtitle="Kelola testimoni klien yang ditampilkan di website" />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{TESTIMONIALS.length} testimoni</p>
          <Button size="sm" className="gap-1.5 rounded-xl">
            <Plus size={14} />
            Tambah Testimoni
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              {/* Author */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} text-white text-xs font-bold flex-shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}, {t.company}</div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-0.5 mb-2">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Konten */}
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{t.content}</p>

              {/* Aksi */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
