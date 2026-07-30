"use client";

import { useState } from "react";
import { Check, ChevronDown, RotateCcw, Search, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DETAIL_ICONS, DEFAULT_DETAIL_ICON, DEFAULT_DETAIL_ICON_KEY } from "@/lib/detail-icons";
import { cn } from "@/lib/utils";

/** "circle-dollar-sign" -> "Circle Dollar Sign" — cuma buat label, key
 * yg disimpan ke DB tetap kebab-case (lihat DETAIL_ICONS). */
function iconLabel(key: string): string {
  return key.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const ICON_KEYS = Object.keys(DETAIL_ICONS);

/** Modal picker ikon — dipakai di editor Layanan & About Us (berbagi satu
 * registry DETAIL_ICONS). Grid responsif + search, klik langsung pilih &
 * tutup modal (instant preview di trigger), gak perlu tombol "konfirmasi"
 * terpisah — tombol Simpan section yg nyimpen ke DB tetap terpisah. */
export function IconPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const Icon = DETAIL_ICONS[value] ?? DEFAULT_DETAIL_ICON;
  const filtered = ICON_KEYS.filter((k) => k.includes(search.trim().toLowerCase()));

  const handlePick = (key: string) => {
    onChange(key);
    setOpen(false);
    setSearch("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSearch("");
      }}
    >
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="h-9 w-full justify-between gap-2 rounded-lg px-2.5 font-normal"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex size-6 flex-shrink-0 items-center justify-center rounded-md border border-gray-200 text-primary">
            <Icon size={14} />
          </span>
          <span className="truncate text-xs text-gray-700">{iconLabel(value)}</span>
        </span>
        <ChevronDown size={14} className="flex-shrink-0 text-gray-400" />
      </Button>
      <DialogContent className="max-w-lg gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pilih Ikon</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ikon…"
            className="rounded-xl pl-9"
          />
        </div>

        <div className="grid max-h-80 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-5">
          {filtered.map((key) => {
            const OptionIcon = DETAIL_ICONS[key];
            const selected = key === value;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePick(key)}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-colors",
                  selected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 text-gray-600 hover:border-primary/40 hover:bg-gray-50",
                )}
              >
                {selected && (
                  <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-white">
                    <Check size={10} />
                  </span>
                )}
                <OptionIcon size={20} />
                <span className="w-full truncate text-[10px] leading-tight">{iconLabel(key)}</span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-2 py-8 text-gray-400">
              <SearchX size={22} />
              <p className="text-xs">Ikon &quot;{search}&quot; gak ketemu.</p>
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-lg text-gray-500"
          onClick={() => handlePick(DEFAULT_DETAIL_ICON_KEY)}
        >
          <RotateCcw size={13} /> Pakai Ikon Default
        </Button>
      </DialogContent>
    </Dialog>
  );
}
