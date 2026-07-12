"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Nama item yang akan dihapus, ditampilkan di teks konfirmasi */
  itemLabel: string;
  onConfirm: () => void;
}

/* ─── Dialog konfirmasi hapus — dipakai semua halaman CRUD admin ─── */
export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  itemLabel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <div className="flex flex-col items-center text-center pt-2">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500">
            <Trash2 size={20} />
          </span>
          <DialogTitle className="mt-4 text-base font-bold text-gray-900">
            Hapus item ini?
          </DialogTitle>
          <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-700">{itemLabel}</span>{" "}
            akan dihapus. Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-lg"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            className="flex-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Hapus
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
