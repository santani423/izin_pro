"use client";

import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { useDictionary } from "@/contexts/LocaleContext";
import { WHATSAPP_URL } from "@/lib/landing";
import { trackContact } from "@/lib/meta-pixel";

/* ─── Floating Action Button WhatsApp ───
 * Teks ajakan muncul dari balik ikon saat di-hover (desktop) atau focus (keyboard).
 */
export default function WhatsAppFab() {
  const dict = useDictionary();
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackContact()}
      aria-label={dict.whatsappFab.ariaLabel}
      className="group fixed bottom-5 right-5 z-50 flex items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="max-w-0 overflow-hidden whitespace-nowrap pl-0 text-sm font-semibold opacity-0 transition-all duration-300 ease-out group-hover:max-w-52 group-hover:pl-5 group-hover:opacity-100 group-focus-visible:max-w-52 group-focus-visible:pl-5 group-focus-visible:opacity-100">
        {dict.whatsappFab.hoverText}
      </span>
      <span className="grid size-16 shrink-0 place-items-center">
        <WhatsAppIcon className="size-8" />
      </span>
    </a>
  );
}
