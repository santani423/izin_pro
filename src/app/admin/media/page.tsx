"use client";

import { useState } from "react";
import { Upload, Grid, List, Search, Trash2, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AdminHeader from "@/components/admin/AdminHeader";

/* ─── Data media mock ─── */
const mediaItems = [
  { id: "1", name: "hero-background.jpg", type: "image/jpeg", size: "245 KB", date: "28 Jun 2026", gradient: "from-[#1b3309] to-[#5ba12b]" },
  { id: "2", name: "logo-izinpro.png", type: "image/png", size: "18 KB", date: "27 Jun 2026", gradient: "from-[#1e3a5f] to-[#3b82f6]" },
  { id: "3", name: "team-photo.jpg", type: "image/jpeg", size: "512 KB", date: "26 Jun 2026", gradient: "from-[#4a1d96] to-[#8b5cf6]" },
  { id: "4", name: "service-banner.jpg", type: "image/jpeg", size: "320 KB", date: "25 Jun 2026", gradient: "from-[#7c2d12] to-[#ea580c]" },
  { id: "5", name: "about-office.jpg", type: "image/jpeg", size: "678 KB", date: "24 Jun 2026", gradient: "from-[#0c4a6e] to-[#38bdf8]" },
  { id: "6", name: "client-logo-bjb.png", type: "image/png", size: "24 KB", date: "23 Jun 2026", gradient: "from-[#0f766e] to-[#34d399]" },
  { id: "7", name: "promo-banner-juni.jpg", type: "image/jpeg", size: "156 KB", date: "22 Jun 2026", gradient: "from-[#be185d] to-[#f472b6]" },
  { id: "8", name: "document-icon.svg", type: "image/svg+xml", size: "4 KB", date: "21 Jun 2026", gradient: "from-[#b45309] to-[#fbbf24]" },
];

/* ─── Halaman Media Library Admin ─── */
export default function AdminMediaPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <>
      <AdminHeader title="Media Library" subtitle="Kelola semua gambar dan file" />

      <div className="p-6 lg:p-8 space-y-6">
        {/* ─── Toolbar ─── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Cari file..." className="pl-9 rounded-xl" />
          </div>
          <div className="flex gap-2">
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`px-3 py-2 transition-colors ${view === "grid" ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-2 transition-colors ${view === "list" ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <List size={14} />
              </button>
            </div>
            {selected.length > 0 && (
              <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 size={14} />
                Hapus ({selected.length})
              </Button>
            )}
            <Button size="sm" className="gap-1.5 rounded-xl">
              <Upload size={14} />
              Upload
            </Button>
          </div>
        </div>

        {/* ─── Area upload drag & drop ─── */}
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-primary/2 transition-colors cursor-pointer">
          <Upload size={28} className="text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">Drag & drop file di sini</p>
          <p className="text-xs text-gray-400 mt-1">atau klik untuk pilih file (JPG, PNG, SVG, WebP maks. 5MB)</p>
        </div>

        {/* ─── Grid/List Media ─── */}
        {view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group ${selected.includes(item.id) ? "border-primary shadow-md" : "border-gray-100 hover:border-primary/30"}`}
              >
                <div className={`aspect-square bg-gradient-to-br ${item.gradient}`} />
                {selected.includes(item.id) && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-[10px] font-medium truncate">{item.name}</p>
                  <p className="text-white/60 text-[9px]">{item.size}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="w-10 px-4 py-3" />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama File</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Tipe</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Ukuran</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Tanggal</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mediaItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={() => toggle(item.id)}
                        className="rounded accent-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex-shrink-0`} />
                        <span className="font-medium text-gray-900 text-xs">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs">{item.type.split("/")[1].toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{item.size}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{item.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"><Copy size={13} /></button>
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"><Download size={13} /></button>
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
