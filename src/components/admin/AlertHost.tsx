"use client";

import { useEffect, useSyncExternalStore } from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getSwalState, getSwalServerSnapshot, subscribeSwal, closeSwal } from "@/lib/swal";

/* ─── Host popup CRUD admin panel ───
 * Dipasang sekali di layout (kayak <Toaster/>) — baca state global dari
 * lib/swal.ts lewat useSyncExternalStore, render popup Success/Error/
 * Confirm sesuai state itu. Popup Success auto-close ~2 detik (dulu
 * timer:2000 di SweetAlert2). */
export default function AlertHost() {
  const state = useSyncExternalStore(subscribeSwal, getSwalState, getSwalServerSnapshot);

  useEffect(() => {
    if (state.type !== "success") return;
    const t = setTimeout(() => closeSwal(), 2000);
    return () => clearTimeout(t);
  }, [state]);

  const open = state.type !== "idle";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeSwal(false)}>
      <DialogContent showCloseButton={state.type !== "confirm"} className="text-center">
        {state.type === "success" && (
          <>
            <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 size={28} className="text-primary" />
            </div>
            <DialogTitle className="text-center text-base">{state.message}</DialogTitle>
          </>
        )}

        {state.type === "error" && (
          <>
            <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <XCircle size={28} className="text-red-500" />
            </div>
            <DialogTitle className="text-center text-base">Gagal</DialogTitle>
            <DialogDescription className="text-center">{state.message}</DialogDescription>
            <DialogFooter className="sm:justify-center">
              <Button onClick={() => closeSwal()} className="rounded-xl">
                OK
              </Button>
            </DialogFooter>
          </>
        )}

        {state.type === "confirm" && (
          <>
            <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <AlertTriangle size={28} className="text-amber-500" />
            </div>
            <DialogTitle className="text-center text-base">Yakin mau hapus?</DialogTitle>
            <DialogDescription className="text-center">{state.message}</DialogDescription>
            <DialogFooter className="sm:justify-center">
              <Button variant="outline" onClick={() => closeSwal(false)} className="rounded-xl">
                Batal
              </Button>
              <Button onClick={() => closeSwal(true)} className="rounded-xl bg-red-500 text-white hover:bg-red-600">
                Ya, hapus
              </Button>
            </DialogFooter>
          </>
        )}

        {/* state "idle" -> DialogContent tetap dirender React tapi Dialog itu sendiri "open=false", gak nongol */}
      </DialogContent>
    </Dialog>
  );
}
