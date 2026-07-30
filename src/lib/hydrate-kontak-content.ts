/* ─── Hydrasi KontakPageContent (DB) -> props section /kontak ───
 * Sama pola dgn hydrate-promo-content.ts: Json content nyimpen ikon sbg
 * string key, di-convert balik jadi LucideIcon SEBELUM dikirim ke komponen
 * section. Kartu WhatsApp butuh brand icon custom (bukan lucide-react), jadi
 * icon key "whatsapp" sengaja dibiarkan sbg string literal — komponen yg
 * konsumsi ini yg cek `icon === "whatsapp"` & render WhatsAppIcon sendiri
 * (pola yg sama persis dgn KontakInfoBar/KontakFormSection versi lama). */
import type { LucideIcon } from "lucide-react";
import type { KontakPageContent } from "@prisma/client";
import { resolveDetailIcon } from "@/lib/detail-icons";

interface RawInfoCard {
  icon: string;
  title: string;
  value: string;
  note: string;
}

interface RawChannel {
  icon: string;
  title: string;
  value: string | null;
  note: string | null;
  href: string;
}

export interface KontakInfoCardItem {
  icon: LucideIcon | "whatsapp";
  title: string;
  value: string;
  note: string;
}

/** Channel kanal kontak (sidebar form) — icon SENGAJA dibiarkan string key
 * mentah (bukan LucideIcon), krn ini dikonsumsi KontakFormSection yang
 * "use client": komponen React (fungsi) gak bisa lolos serialisasi RSC dari
 * Server ke Client Component sebagai prop — beda dgn infoCards yang
 * dikonsumsi KontakInfoBar (Server Component juga, jadi aman di-hydrate). */
export interface KontakChannelRaw {
  icon: string;
  title: string;
  value?: string;
  note?: string;
  href: string;
}

function hydrateIcon(icon: string): LucideIcon | "whatsapp" {
  return icon === "whatsapp" ? "whatsapp" : resolveDetailIcon(icon);
}

export interface HydratedKontakContent {
  hero: {
    kicker: string | null;
    title: string;
    titleHighlight: string;
    description: string;
    imageUrl: string | null;
  };
  infoCards: KontakInfoCardItem[];
  form: {
    title: string;
    subtitle: string;
    sidebarTitle: string;
    sidebarSubtitle: string;
    channels: KontakChannelRaw[];
  };
  location: {
    title: string;
    mapsEmbedUrl: string;
  };
  faq: {
    titlePrefix: string;
    titleHighlight: string;
    helpCard: {
      title: string;
      description: string;
      buttonLabel: string;
      imageUrl: string | null;
    };
  };
}

export function hydrateKontakContent(content: KontakPageContent): HydratedKontakContent {
  const infoCards = content.infoCards as unknown as RawInfoCard[];
  const channels = content.channels as unknown as RawChannel[];

  return {
    hero: {
      kicker: content.heroKicker,
      title: content.heroTitle,
      titleHighlight: content.heroTitleHighlight,
      description: content.heroDescription,
      imageUrl: content.heroImageUrl,
    },
    infoCards: infoCards.map((c) => ({
      icon: hydrateIcon(c.icon),
      title: c.title,
      value: c.value,
      note: c.note,
    })),
    form: {
      title: content.formTitle,
      subtitle: content.formSubtitle,
      sidebarTitle: content.sidebarTitle,
      sidebarSubtitle: content.sidebarSubtitle,
      channels: channels.map((c) => ({
        icon: c.icon,
        title: c.title,
        value: c.value ?? undefined,
        note: c.note ?? undefined,
        href: c.href,
      })),
    },
    location: {
      title: content.locationTitle,
      mapsEmbedUrl: content.mapsEmbedUrl,
    },
    faq: {
      titlePrefix: content.faqTitlePrefix,
      titleHighlight: content.faqTitleHighlight,
      helpCard: {
        title: content.helpCardTitle,
        description: content.helpCardDescription,
        buttonLabel: content.helpCardButtonLabel,
        imageUrl: content.helpCardImageUrl,
      },
    },
  };
}
