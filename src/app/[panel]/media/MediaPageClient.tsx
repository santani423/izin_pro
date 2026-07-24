"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Grid, List, Search, Trash2, Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { uploadMediaFilesAction, deleteMediaFilesAction } from "@/lib/actions/media";

type MediaItem = {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
  uploadedBy: { name: string } | null;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

/* ─── Halaman Media Library Admin ─── */
export default function MediaPageClient({ initialItems }: { initialItems: MediaItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  /* ID yang menunggu konfirmasi hapus (bulk atau satuan) */
  const [pendingDelete, setPendingDelete] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = initialItems.filter((i) =>
    i.fileName.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const uploadFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    const formData = new FormData();
    list.forEach((file) => formData.append("files", file));
    startTransition(async () => {
      const res = await uploadMediaFilesAction(formData);
      if (res.ok) {
        toast.success(`${list.length} file berhasil diupload`);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const confirmDelete = () => {
    const ids = pendingDelete;
    startTransition(async () => {
      const res = await deleteMediaFilesAction(ids);
      if (res.ok) {
        toast.success(`${ids.length} file dihapus`);
      } else {
        toast.error(res.message);
      }
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
      setPendingDelete([]);
      router.refresh();
    });
  };

  const copyUrl = (url: string) => {
    const absolute = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
    navigator.clipboard?.writeText(absolute).catch(() => {});
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
                disabled={isPending}
                onClick={() => setPendingDelete(selected)}
              >
                <Trash2 size={14} />
                Hapus ({selected.length})
              </Button>
            )}
            <Button
              size="sm"
              className="gap-1.5 rounded-xl"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} />
              Upload
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {/* ─── Area upload drag & drop ─── */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-gray-300 rounded-2xl bg-white p-8 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <Upload size={28} className="text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {isPending ? "Mengunggah..." : "Drag & drop file di sini"}
          </p>
          <p className="text-xs text-gray-400 mt-1">atau klik untuk pilih file (JPG, PNG, WebP maks. 15MB)</p>
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.fileName} className="aspect-square w-full object-cover bg-gray-100" />
                {selected.includes(item.id) && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-[10px] font-medium truncate">{item.fileName}</p>
                  <p className="text-white/60 text-[9px]">{formatSize(item.sizeBytes)}</p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full text-center text-sm text-gray-400 py-10">
                Tidak ada file yang cocok.
              </p>
            )}
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.fileName} className="w-8 h-8 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-xs">{item.fileName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs">{item.mimeType.split("/")[1]?.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{formatSize(item.sizeBytes)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => copyUrl(item.url)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                          aria-label="Salin URL"
                        >
                          <Copy size={13} />
                        </button>
                        <a
                          href={item.url}
                          download={item.fileName}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                          aria-label="Unduh"
                        >
                          <Download size={13} />
                        </a>
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                      Tidak ada file yang cocok.
                    </td>
                  </tr>
                )}
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
              ? `File "${initialItems.find((i) => i.id === pendingDelete[0])?.fileName ?? ""}"`
              : `${pendingDelete.length} file terpilih`
          }
          onConfirm={confirmDelete}
        />
      </div>
    </>
  );
}
