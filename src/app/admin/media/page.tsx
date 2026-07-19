"use client";

import { useState } from "react";
import { Upload, Grid, List, Search, Trash2, Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";

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

const GRADIENTS = [
  "from-[#1b3309] to-[#5ba12b]",
  "from-[#1e3a5f] to-[#3b82f6]",
  "from-[#4a1d96] to-[#8b5cf6]",
  "from-[#7c2d12] to-[#ea580c]",
];

/* ─── Halaman Media Library Admin ─── */
export default function AdminMediaPage() {
  const [items, setItems] = useState(mediaItems);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  /* ID yang menunggu konfirmasi hapus (bulk atau satuan) */
  const [pendingDelete, setPendingDelete] = useState<string[]>([]);

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const upload = () => {
    const n = items.length + 1;
    setItems((prev) => [
      {
        id: String(Date.now()),
        name: `upload-baru-${n}.jpg`,
        type: "image/jpeg",
        size: `${100 + n * 17} KB`,
        date: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
        gradient: GRADIENTS[n % GRADIENTS.length],
      },
      ...prev,
    ]);
    toast.success("File berhasil diupload");
  };

  const confirmDelete = () => {
    setItems((prev) => prev.filter((i) => !pendingDelete.includes(i.id)));
    setSelected((prev) => prev.filter((id) => !pendingDelete.includes(id)));
    toast.success(`${pendingDelete.length} file dihapus`);
  };

  const copyUrl = (name: string) => {
    navigator.clipboard?.writeText(`/images/uploads/${name}`).catch(() => {});
    toast.success("URL file disalin");
  };

  return (
    <>

      <div className="p-6 lg:p-8 space-y-6">
        {/* ─── Toolbar ─── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari file..."
                className="pl-9 rounded-xl h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="button" className="rounded-xl h-10 flex-shrink-0">
              Search
            </Button>
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
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => setPendingDelete(selected)}
              >
                <Trash2 size={14} />
                Hapus ({selected.length})
              </Button>
            )}
            <Button size="sm" className="gap-1.5 rounded-xl" onClick={upload}>
              <Upload size={14} />
              Upload
            </Button>
          </div>
        </div>

        {/* ─── Area upload drag & drop ─── */}
        <div className="border-2 border-dashed border-gray-300 rounded-2xl bg-white p-8 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer">
          <Upload size={28} className="text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">Drag & drop file di sini</p>
          <p className="text-xs text-gray-400 mt-1">atau klik untuk pilih file (JPG, PNG, SVG, WebP maks. 5MB)</p>
        </div>

        {/* ─── Grid/List Media ─── */}
        {view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group ${selected.includes(item.id) ? "border-primary shadow-md" : "border-admin-line hover:border-primary/30"}`}
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
          <div className="bg-white rounded-2xl border border-admin-line overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-line bg-gray-50/50">
                  <th className="w-10 px-4 py-3" />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama File</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Tipe</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Ukuran</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Tanggal</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item) => (
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
                        <button
                          onClick={() => copyUrl(item.name)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                          aria-label="Salin URL"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => toast.success(`Mengunduh ${item.name}`)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                          aria-label="Unduh"
                        >
                          <Download size={13} />
                        </button>
                        <button
                          onClick={() => setPendingDelete([item.id])}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label="Hapus file"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Konfirmasi hapus ─── */}
        <ConfirmDeleteDialog
          open={pendingDelete.length > 0}
          onOpenChange={(o) => !o && setPendingDelete([])}
          itemLabel={
            pendingDelete.length === 1
              ? `File "${items.find((i) => i.id === pendingDelete[0])?.name ?? ""}"`
              : `${pendingDelete.length} file terpilih`
          }
          onConfirm={confirmDelete}
        />
      </div>
    </>
  );
}
