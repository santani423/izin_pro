"use client";

import { forwardRef, type ComponentProps } from "react";
import { trackContact } from "@/lib/meta-pixel";

type WhatsAppLinkProps = ComponentProps<"a">;

/** Pengganti `<a href="https://wa.me/...">` biasa — nge-track event Meta
 * Pixel "Contact" pas diklik tanpa mengubah perilaku link aslinya (tetap
 * buka tab baru). Sengaja dipisah jadi Client Component kecil ini (bukan
 * nambah "use client" ke section yang makenya) supaya section-section
 * server tetap Server Component; komponen ini biasanya jadi child tunggal
 * `<Button asChild>` (Radix Slot), makanya semua props diteruskan apa
 * adanya ke `<a>`. */
export const WhatsAppLink = forwardRef<HTMLAnchorElement, WhatsAppLinkProps>(
  function WhatsAppLink({ onClick, ...props }, ref) {
    return (
      <a
        ref={ref}
        {...props}
        onClick={(event) => {
          trackContact();
          onClick?.(event);
        }}
      />
    );
  },
);
