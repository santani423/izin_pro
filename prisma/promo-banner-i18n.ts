/* Sumber terjemahan PromoBanner (ID/EN/ZH) — dipakai bareng prisma/seed.ts
 * (instalasi baru) & prisma/backfill-promo-banner-i18n.ts (DB lama yang udah
 * ke-seed sebelum kolom eyebrow/titleEn/titleZh/variant/sortOrder ada).
 * Key = `tag` legacy dari PROMOS (src/lib/constants.ts), dipakai buat
 * mencocokkan baris yang tepat pas backfill. Teks id/en/zh sama persis dgn
 * dict.promo.items lama (src/i18n/dictionaries/{id,en,zh}.ts) biar gak ada
 * perubahan visual pas PromoSection pindah dari dictionary ke tabel ini. */
export const PROMO_BANNER_I18N: Record<
  string,
  {
    variant: "DISCOUNT" | "FREE" | "PACKAGE";
    sortOrder: number;
    id: { eyebrow: string; title: string; description: string; ctaLabel: string };
    en: { eyebrow: string; title: string; description: string; ctaLabel: string };
    zh: { eyebrow: string; title: string; description: string; ctaLabel: string };
  }
> = {
  "🔥 Terbatas": {
    variant: "DISCOUNT",
    sortOrder: 0,
    id: { eyebrow: "DISKON", title: "25%", description: "Untuk Pendirian PT selama bulan ini", ctaLabel: "Klaim Sekarang" },
    en: { eyebrow: "DISCOUNT", title: "25%", description: "For PT (Limited Liability Company) formation this month", ctaLabel: "Claim Now" },
    zh: { eyebrow: "折扣", title: "25%", description: "本月办理有限公司（PT）设立享折扣", ctaLabel: "立即领取" },
  },
  "✨ Gratis": {
    variant: "FREE",
    sortOrder: 1,
    id: { eyebrow: "GRATIS", title: "Konsultasi", description: "untuk semua layanan", ctaLabel: "Konsultasi Sekarang" },
    en: { eyebrow: "FREE", title: "Consultation", description: "for all services", ctaLabel: "Consult Now" },
    zh: { eyebrow: "免费", title: "咨询", description: "所有服务均可享受", ctaLabel: "立即咨询" },
  },
  "💼 Hemat": {
    variant: "PACKAGE",
    sortOrder: 2,
    id: { eyebrow: "PAKET HEMAT", title: "Perizinan Lengkap", description: "Mulai dari Rp 5.200.000", ctaLabel: "Lihat Paket" },
    en: { eyebrow: "VALUE PACK", title: "Complete Licensing", description: "Starting from Rp 5,200,000", ctaLabel: "View Package" },
    zh: { eyebrow: "超值套餐", title: "完整办证套餐", description: "起价 Rp 5,200,000", ctaLabel: "查看套餐" },
  },
};
