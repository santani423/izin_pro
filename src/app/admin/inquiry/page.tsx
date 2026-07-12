"use client";

import { useState } from "react";
import { Search, Trash2, Eye, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { cn } from "@/lib/utils";

type InquiryStatus = "Baru" | "Diproses" | "Selesai";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  layanan: string;
  pesan: string;
  time: string;
  status: InquiryStatus;
}

/* ─── Data mock inquiry (frontend-only) ─── */
const SEED: Inquiry[] = [
  { id: "1", name: "Andi Setiawan", email: "andi.s@gmail.com", whatsapp: "0812-1111-2233", layanan: "Pendirian PT", pesan: "Halo, saya ingin mendirikan PT untuk usaha kuliner. Kira-kira butuh dokumen apa saja dan berapa lama prosesnya?", time: "5 menit lalu", status: "Baru" },
  { id: "2", name: "Siti Nurhaliza", email: "siti.nur@yahoo.com", whatsapp: "0813-2222-3344", layanan: "NIB Online", pesan: "Saya butuh NIB untuk toko online saya. Apakah bisa dibantu prosesnya sampai selesai?", time: "1 jam lalu", status: "Diproses" },
  { id: "3", name: "Budi Santoso", email: "budi.santoso@gmail.com", whatsapp: "0821-3333-4455", layanan: "Izin Usaha", pesan: "Usaha bengkel saya belum ada izin resmi. Mohon info paket dan biayanya.", time: "3 jam lalu", status: "Selesai" },
  { id: "4", name: "Rina Wijaya", email: "rina.w@outlook.com", whatsapp: "0856-4444-5566", layanan: "Izin Komersial", pesan: "Perusahaan kami mau ekspansi dan butuh izin komersial baru. Bisa konsultasi dulu?", time: "5 jam lalu", status: "Selesai" },
  { id: "5", name: "Deni Hermawan", email: "deni.hermawan@gmail.com", whatsapp: "0877-5555-6677", layanan: "Pendirian PT", pesan: "Mau tanya paket pendirian PT yang termasuk virtual office ada tidak ya?", time: "Kemarin", status: "Diproses" },
  { id: "6", name: "Maya Kusuma", email: "maya.k@gmail.com", whatsapp: "0898-6666-7788", layanan: "Lainnya", pesan: "Saya ingin mengurus sertifikasi halal untuk produk makanan ringan. Apakah IzinPro melayani ini?", time: "Kemarin", status: "Baru" },
];

const STATUS_ORDER: InquiryStatus[] = ["Baru", "Diproses", "Selesai"];

const statusColor: Record<InquiryStatus, string> = {
  Baru: "bg-primary/10 text-primary",
  Diproses: "bg-amber-50 text-amber-600",
  Selesai: "bg-emerald-50 text-emerald-600",
};

/* ─── Halaman Manajemen Inquiry Admin ─── */
export default function AdminInquiryPage() {
  const [items, setItems] = useState<Inquiry[]>(SEED);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<InquiryStatus | "Semua">("Semua");
  const [detail, setDetail] = useState<Inquiry | null>(null);
  const [toDelete, setToDelete] = useState<Inquiry | null>(null);

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch =
      i.name.toLowerCase().includes(q) || i.layanan.toLowerCase().includes(q);
    const matchFilter = filter === "Semua" || i.status === filter;
    return matchSearch && matchFilter;
  });

  const setStatus = (id: string, status: InquiryStatus) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    setDetail((d) => (d && d.id === id ? { ...d, status } : d));
    toast.success(`Status inquiry diubah ke "${status}"`);
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Inquiry dihapus");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ─── Toolbar: cari + filter status ─── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama atau layanan..."
            className="pl-9 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {(["Semua", ...STATUS_ORDER] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                filter === s ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tabel Inquiry ─── */}
      <div className="bg-white rounded-2xl border border-admin-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-line bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Layanan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Waktu</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                        {item.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{item.name}</div>
                        <div className="text-xs text-gray-400 truncate">{item.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell whitespace-nowrap">{item.layanan}</td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                      <Clock size={11} />
                      {item.time}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {/* Klik pill status untuk lanjut ke status berikutnya */}
                    <button
                      onClick={() =>
                        setStatus(
                          item.id,
                          STATUS_ORDER[(STATUS_ORDER.indexOf(item.status) + 1) % STATUS_ORDER.length],
                        )
                      }
                      title="Klik untuk ubah status"
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-opacity hover:opacity-75",
                        statusColor[item.status],
                      )}
                    >
                      {item.status}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDetail(item)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                        aria-label="Lihat detail"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => setToDelete(item)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                    Tidak ada inquiry yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-admin-line">
          <p className="text-xs text-gray-400">
            Menampilkan {filtered.length} dari {items.length} inquiry
          </p>
        </div>
      </div>

      {/* ─── Dialog detail inquiry ─── */}
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-md">
          {detail && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                Detail Inquiry
              </DialogTitle>
              <div className="space-y-3 text-sm">
                {[
                  ["Nama", detail.name],
                  ["Email", detail.email],
                  ["WhatsApp", detail.whatsapp],
                  ["Layanan", detail.layanan],
                  ["Waktu", detail.time],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-3">
                    <span className="w-24 flex-shrink-0 text-gray-400">{label}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
                <div>
                  <span className="text-gray-400">Pesan</span>
                  <p className="mt-1 rounded-lg bg-gray-50 p-3 text-gray-700 leading-relaxed">
                    {detail.pesan}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-gray-400">Status:</span>
                  {STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(detail.id, s)}
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full transition-all",
                        detail.status === s
                          ? statusColor[s]
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-lg"
                onClick={() => setDetail(null)}
              >
                Tutup
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Konfirmasi hapus ─── */}
      <ConfirmDeleteDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete ? `Inquiry dari ${toDelete.name}` : ""}
        onConfirm={() => toDelete && remove(toDelete.id)}
      />
    </div>
  );
}
