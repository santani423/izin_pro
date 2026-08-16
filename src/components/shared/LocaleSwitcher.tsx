"use client";

import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDictionary, useLocale } from "@/contexts/LocaleContext";
import { LOCALES, LOCALE_COOKIE, LOCALE_LABELS, LOCALE_SHORT_LABELS, localizeHref, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/* Simpan pilihan bahasa eksplisit (1 tahun) biar URL bare "/" tetap ngikut
 * pilihan pengunjung ini, bukan Settings.defaultLocale admin — lihat
 * getLocale() di src/i18n/get-dictionary.ts. */
function rememberLocale(target: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${target};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

/* ─── Ganti bahasa (id/en/zh) — link ke path yang sama dgn prefix locale
 * berbeda, ditangani proxy.ts (rewrite, id gak pakai prefix). Dipasang di
 * Navbar desktop & mobile sheet. ─── */
export function LocaleSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const locale = useLocale();
  const dict = useDictionary();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={dict.localeSwitcher.ariaLabel}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-2 text-sm font-medium text-foreground/80 outline-none transition-colors hover:text-primary data-popup-open:border-primary/50 data-popup-open:bg-primary/5 data-popup-open:text-primary",
          className,
        )}
      >
        <Globe className="size-4" aria-hidden="true" />
        {LOCALE_SHORT_LABELS[locale]}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-40 rounded-2xl border-none p-2 shadow-xl ring-1 ring-foreground/5"
      >
        {LOCALES.map((target) => (
          <DropdownMenuItem
            key={target}
            render={<a href={localizeHref(pathname, target)} onClick={() => rememberLocale(target)} />}
            className={cn(
              "gap-2.5 rounded-lg px-3 py-2 text-sm",
              target === locale ? "font-semibold text-primary" : "text-foreground/80",
            )}
          >
            {LOCALE_LABELS[target]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
