"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import AdminHeader from "@/components/admin/AdminHeader";
import { PROMOS } from "@/lib/constants";

/* ─── Data promo diperluas dengan tanggal & status ─── */
const promoData = PROMOS.map((p, i) => ({
  ...p,
  startDate: "01 Jun 2026",
  endDate: ["30 Jun 2026", "31 Des 2026", "31 Jul 2026"][i] ?? "30 Jun 2026",
  active: true,
  clicks: [142, 89, 67][i] ?? 50,
}));

/* ─── Halaman Manajemen Promo Admin ─── */
export default function AdminPromoPage() {
  const [promos, setPromos] = useState(promoData);

  const toggleActive = (id: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    );
  };

  return (
    <>
      <AdminHeader title="Promo & Banner" subtitle="Kelola penawaran dan banner promosi" />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{promos.length} promo aktif</p>
          <Button size="sm" className="gap-1.5 rounded-xl">
            <Plus size={14} />
            Tambah Promo
          </Button>
        </div>

        {/* ─── Grid Kartu Promo ─── */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className={`bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all ${
                !promo.active ? "opacity-60" : ""
              }`}
            >
              {/* Preview gradient */}
              <div className={`h-28 bg-gradient-to-br ${promo.gradient} p-5 flex flex-col justify-between`}>
                <span className="text-xs font-semibold text-white/80 bg-white/20 px-2.5 py-0.5 rounded-full w-fit">
                  {promo.tag}
                </span>
                <div className="text-white">
                  <div className="text-xl font-extrabold leading-none">{promo.title}</div>
                  <div className="text-2xl font-extrabold leading-none mt-0.5">{promo.subtitle}</div>
                </div>
              </div>

              {/* Detail */}
              <div className="p-4">
                <p className="text-xs text-gray-600 leading-relaxed mb-3">{promo.description}</p>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                  <Calendar size={11} />
                  <span>{promo.startDate} – {promo.endDate}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={promo.active}
                      onCheckedChange={() => toggleActive(promo.id)}
                      className="scale-90"
                    />
                    <span className="text-xs text-gray-500">{promo.active ? "Aktif" : "Nonaktif"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
                      <Eye size={13} />
                    </button>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
