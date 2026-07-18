"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import type { Media, Partner } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import {
  createPartnerAction,
  deletePartnerAction,
  togglePartnerActiveAction,
  updatePartnerAction,
} from "@/lib/actions/partners";

type PartnerWithLogo = Partner & {
  logoMedia: Media;
  createdBy: { name: string } | null;
  updatedBy: { name: string } | null;
};

interface FormState {
  id: string;
  name: string;
}

/* ─── Halaman Manajemen Klien / Partner Admin (tersambung Prisma) ─── */
export default function KlienManager({
  initialPartners,
}: {
  initialPartners: PartnerWithLogo[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toDelete, setToDelete] = useState<PartnerWithLogo | null>(null);

  const openForm = (p: PartnerWithLogo | null) => {
    setForm({ id: p?.id ?? "", name: p?.name ?? "" });
    setPreview(p?.logoMedia.url ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleActive = (p: PartnerWithLogo) => {
    startTransition(async () => {
      const res = await togglePartnerActiveAction(p.id, !p.isActive);
      if (res.ok) {
        toast.success("Status klien diperbarui");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const onFileChange = (file: File | null) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  const save = () => {
    if (!form) return;
    if (!form.name.trim()) {
      toast.error("Nama klien wajib diisi");
      return;
    }
    const file = fileInputRef.current?.files?.[0] ?? null;
    if (!form.id && !file) {
      toast.error("Logo wajib diunggah");
      return;
    }

    const fd = new FormData();
    fd.set("name", form.name);
    if (file) fd.set("logo", file);

    startTransition(async () => {
      const res = form.id
        ? await updatePartnerAction(form.id, fd)
        : await createPartnerAction(fd);

      if (res.ok) {
        toast.success(form.id ? "Klien diperbarui" : "Klien baru ditambahkan");
        setForm(null);
        setPreview(null);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const remove = () => {
    if (!toDelete) return;
    startTransition(async () => {
      const res = await deletePartnerAction(toDelete.id);
      if (res.ok) {
        toast.success("Klien dihapus");
        router.refresh();
      } else {
        toast.error(res.message);
      }
      setToDelete(null);
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{initialPartners.length} klien ditampilkan di website</p>
        <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => openForm(null)}>
          <Plus size={14} />
          Tambah Klien
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {initialPartners.map((partner) => (
          <div
            key={partner.id}
            className={`bg-white rounded-2xl border border-admin-line p-4 flex flex-col items-center gap-3 transition-all ${!partner.isActive ? "opacity-60" : ""}`}
          >
            <div className="w-full h-16 flex items-center justify-center">
              <Image
                src={partner.logoMedia.url}
                alt={partner.name}
                width={120}
                height={48}
                className="max-h-12 w-auto object-contain"
              />
            </div>
            <div className="w-full text-center">
              <p className="text-sm font-semibold text-gray-900 truncate">{partner.name}</p>
              {!partner.isActive && (
                <Badge variant="secondary" className="text-xs mt-1">Non-aktif</Badge>
              )}
              <p className="text-[11px] text-gray-400 mt-1">
                Dibuat: {partner.createdBy?.name ?? "—"}
                <br />
                Diubah: {partner.updatedBy?.name ?? "—"}
              </p>
            </div>
            <div className="flex items-center justify-between w-full pt-2 border-t border-admin-line">
              <Switch
                checked={partner.isActive}
                disabled={isPending}
                onCheckedChange={() => toggleActive(partner)}
                className="data-[state=checked]:bg-primary"
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openForm(partner)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                  aria-label="Edit klien"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setToDelete(partner)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Hapus klien"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {initialPartners.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
            <Building2 className="mx-auto mb-2 text-gray-300" size={28} />
            Belum ada klien.
          </div>
        )}
      </div>

      {/* ─── Dialog tambah/edit klien ─── */}
      <Dialog
        open={form !== null}
        onOpenChange={(o) => {
          if (!o) {
            setForm(null);
            setPreview(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          {form && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                {form.id ? "Edit Klien" : "Tambah Klien"}
              </DialogTitle>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="p-name" className="text-sm font-semibold text-gray-700">Nama Klien</Label>
                  <Input
                    id="p-name"
                    className="mt-1.5 rounded-lg"
                    placeholder="mis. Bank BJB"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="p-logo" className="text-sm font-semibold text-gray-700">
                    Logo <span className="font-normal text-gray-400">(PNG/JPG/WebP/SVG, maks 2MB)</span>
                  </Label>
                  {preview && (
                    <div className="mt-2 w-full h-20 rounded-lg border border-admin-line flex items-center justify-center bg-gray-50/50">
                      {/* eslint-disable-next-line @next/next/no-img-element -- preview blob URL, bukan aset statis */}
                      <img src={preview} alt="Preview logo" className="max-h-14 w-auto object-contain" />
                    </div>
                  )}
                  <Input
                    id="p-logo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="mt-2 rounded-lg"
                    ref={fileInputRef}
                    onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                  />
                  {form.id && (
                    <p className="mt-1.5 text-xs text-gray-400">Kosongkan kalau gak mau ganti logo.</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setForm(null)}>
                  Batal
                </Button>
                <Button className="flex-1 rounded-lg" onClick={save} disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan"}
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
        itemLabel={toDelete ? `Klien "${toDelete.name}"` : ""}
        onConfirm={remove}
      />
    </div>
  );
}
