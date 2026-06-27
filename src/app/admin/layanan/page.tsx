"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Building2, ClipboardList, FileText, Clock, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import AdminHeader from "@/components/admin/AdminHeader";
import { SERVICES } from "@/lib/constants";

const ICONS: Record<string, React.ElementType> = {
  building: Building2,
  clipboard: ClipboardList,
  "file-text": FileText,
  clock: Clock,
  list: List,
};

/* ─── Halaman Manajemen Layanan Admin ─── */
export default function AdminLayananPage() {
  const [services, setServices] = useState(SERVICES.map((s) => ({ ...s, active: true })));

  const toggleActive = (id: string) =>
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s));

  return (
    <>
      <AdminHeader title="Layanan" subtitle="Kelola layanan yang ditampilkan di website" />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{services.length} layanan tersedia</p>
          <Button size="sm" className="gap-1.5 rounded-xl">
            <Plus size={14} />
            Tambah Layanan
          </Button>
        </div>

        <div className="space-y-3">
          {services.map((service) => {
            const Icon = ICONS[service.icon] ?? FileText;
            return (
              <div
                key={service.id}
                className={`bg-white rounded-2xl border transition-all ${service.active ? "border-gray-100" : "border-gray-100 opacity-60"}`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Drag handle */}
                  <GripVertical size={16} className="text-gray-300 cursor-grab flex-shrink-0" />

                  {/* Ikon */}
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                    style={{ backgroundColor: service.bgColor }}
                  >
                    <Icon size={18} style={{ color: service.color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-gray-900">{service.title}</h3>
                      {!service.active && (
                        <Badge variant="secondary" className="text-xs">Non-aktif</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{service.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {service.features.slice(0, 3).map((f) => (
                        <span key={f} className="text-xs px-2 py-0.5 bg-gray-50 rounded-full text-gray-500">
                          {f}
                        </span>
                      ))}
                      {service.features.length > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-50 rounded-full text-gray-400">
                          +{service.features.length - 3} lagi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Aksi */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      checked={service.active}
                      onCheckedChange={() => toggleActive(service.id)}
                      className="data-[state=checked]:bg-primary"
                    />
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
