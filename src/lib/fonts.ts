import {
  Plus_Jakarta_Sans,
  Inter,
  Poppins,
  Roboto,
  Nunito,
  Lato,
  Montserrat,
  Work_Sans,
  Sora,
  Manrope,
  Outfit,
  Space_Grotesk,
  Merriweather,
  Playfair_Display,
  Noto_Sans_SC,
  Noto_Serif_SC,
  ZCOOL_XiaoWei,
  ZCOOL_QingKe_HuangYou,
  Ma_Shan_Zheng,
  Zhi_Mang_Xing,
  Long_Cang,
  Liu_Jian_Mao_Cao,
} from "next/font/google";
import type { Locale } from "@/i18n/config";

/* ─── Registry font teks WEBSITE PUBLIK (tab Font di /admin/settings) ───
 * Panel admin/CMS TIDAK ikut berubah — tetap Plus Jakarta Sans dari
 * src/app/layout.tsx, terpisah dari registry ini.
 *
 * `preload: false` di semua entri di sini SENGAJA: cuma 1 font per bahasa
 * yang beneran dipakai tiap request (dipilih lewat Settings.fontFamilyId/
 * En/Zh), tapi karena next/font butuh pemanggilan statis (gak bisa dynamic
 * import per slug), semua opsi ke-load sbg @font-face di build. Kalau
 * preload nyala, browser bakal preload SEMUA font di list ini tiap halaman
 * publik dibuka — mubazir. Tanpa preload, browser cuma fetch file font yang
 * beneran dipakai (lewat className di bawah), pas dibutuhkan buat render. */
/* Tiap next/font/google call HARUS literal (gak lewat spread dari objek
 * bersama) — signature-nya beda2 per font (union weight yg diterima beda2),
 * literal langsung di tempat pemanggilan yg bikin TS bisa infer type yg pas. */
const plusJakartaSansFont = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false, variable: "--font-plus-jakarta-sans" });
const interFont = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false, variable: "--font-inter" });
const poppinsFont = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false, variable: "--font-poppins" });
const robotoFont = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap", preload: false, variable: "--font-roboto" });
const nunitoFont = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false, variable: "--font-nunito" });
const latoFont = Lato({ subsets: ["latin"], weight: ["400", "700"], display: "swap", preload: false, variable: "--font-lato" });
const montserratFont = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false, variable: "--font-montserrat" });
const workSansFont = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false, variable: "--font-work-sans" });
const soraFont = Sora({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false, variable: "--font-sora" });
const manropeFont = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false, variable: "--font-manrope" });
const outfitFont = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false, variable: "--font-outfit" });
const spaceGroteskFont = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false, variable: "--font-space-grotesk" });
const merriweatherFont = Merriweather({ subsets: ["latin"], weight: ["400", "700"], display: "swap", preload: false, variable: "--font-merriweather" });
const playfairDisplayFont = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap", preload: false, variable: "--font-playfair-display" });

const notoSansScFont = Noto_Sans_SC({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false, variable: "--font-noto-sans-sc" });
const notoSerifScFont = Noto_Serif_SC({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false, variable: "--font-noto-serif-sc" });
const zcoolXiaoWeiFont = ZCOOL_XiaoWei({ subsets: ["latin"], weight: ["400"], display: "swap", preload: false, variable: "--font-zcool-xiaowei" });
const zcoolQingKeHuangYouFont = ZCOOL_QingKe_HuangYou({ subsets: ["latin"], weight: ["400"], display: "swap", preload: false, variable: "--font-zcool-qingke-huangyou" });
const maShanZhengFont = Ma_Shan_Zheng({ subsets: ["latin"], weight: ["400"], display: "swap", preload: false, variable: "--font-ma-shan-zheng" });
const zhiMangXingFont = Zhi_Mang_Xing({ subsets: ["latin"], weight: ["400"], display: "swap", preload: false, variable: "--font-zhi-mang-xing" });
const longCangFont = Long_Cang({ subsets: ["latin"], weight: ["400"], display: "swap", preload: false, variable: "--font-long-cang" });
const liuJianMaoCaoFont = Liu_Jian_Mao_Cao({ subsets: ["latin"], weight: ["400"], display: "swap", preload: false, variable: "--font-liu-jian-mao-cao" });

export interface FontOption {
  value: string;
  label: string;
  /** Kategori gaya, ditampilkan sbg badge kecil di dropdown Settings. */
  style: string;
  script: "latin" | "cjk";
  font: { className: string; variable: string };
}

/* Dipakai locale id & en (sama2 Latin script). */
export const LATIN_FONT_OPTIONS: FontOption[] = [
  { value: "plus-jakarta-sans", label: "Plus Jakarta Sans", style: "Modern", script: "latin", font: plusJakartaSansFont },
  { value: "inter", label: "Inter", style: "Netral", script: "latin", font: interFont },
  { value: "poppins", label: "Poppins", style: "Geometris", script: "latin", font: poppinsFont },
  { value: "roboto", label: "Roboto", style: "Klasik", script: "latin", font: robotoFont },
  { value: "nunito", label: "Nunito", style: "Membulat", script: "latin", font: nunitoFont },
  { value: "lato", label: "Lato", style: "Humanis", script: "latin", font: latoFont },
  { value: "montserrat", label: "Montserrat", style: "Elegan", script: "latin", font: montserratFont },
  { value: "work-sans", label: "Work Sans", style: "Netral", script: "latin", font: workSansFont },
  { value: "sora", label: "Sora", style: "Modern/Tech", script: "latin", font: soraFont },
  { value: "manrope", label: "Manrope", style: "Modern", script: "latin", font: manropeFont },
  { value: "outfit", label: "Outfit", style: "Geometris", script: "latin", font: outfitFont },
  { value: "space-grotesk", label: "Space Grotesk", style: "Distinctive", script: "latin", font: spaceGroteskFont },
  { value: "merriweather", label: "Merriweather", style: "Serif Klasik", script: "latin", font: merriweatherFont },
  { value: "playfair-display", label: "Playfair Display", style: "Serif Elegan", script: "latin", font: playfairDisplayFont },
];

/* Dipakai locale zh — campuran sans/serif standar + kaligrafi buat variasi. */
export const CJK_FONT_OPTIONS: FontOption[] = [
  { value: "noto-sans-sc", label: "Noto Sans SC", style: "Sans Netral", script: "cjk", font: notoSansScFont },
  { value: "noto-serif-sc", label: "Noto Serif SC", style: "Serif Klasik", script: "cjk", font: notoSerifScFont },
  { value: "zcool-xiaowei", label: "ZCOOL XiaoWei", style: "Serif Ringan", script: "cjk", font: zcoolXiaoWeiFont },
  { value: "zcool-qingke-huangyou", label: "ZCOOL QingKe HuangYou", style: "Display Tebal", script: "cjk", font: zcoolQingKeHuangYouFont },
  { value: "ma-shan-zheng", label: "Ma Shan Zheng", style: "Kaligrafi", script: "cjk", font: maShanZhengFont },
  { value: "zhi-mang-xing", label: "Zhi Mang Xing", style: "Kaligrafi Kursif", script: "cjk", font: zhiMangXingFont },
  { value: "long-cang", label: "Long Cang", style: "Tulisan Tangan", script: "cjk", font: longCangFont },
  { value: "liu-jian-mao-cao", label: "Liu Jian Mao Cao", style: "Kuas Tradisional", script: "cjk", font: liuJianMaoCaoFont },
];

export const FONT_OPTIONS: FontOption[] = [...LATIN_FONT_OPTIONS, ...CJK_FONT_OPTIONS];

const FONT_OPTION_MAP: Record<string, FontOption> = Object.fromEntries(
  FONT_OPTIONS.map((opt) => [opt.value, opt]),
);

export const DEFAULT_FONT_SLUG: Record<Locale, string> = {
  id: "plus-jakarta-sans",
  en: "inter",
  zh: "noto-sans-sc",
};

/** Field Settings yg nyimpen slug font per locale (fontFamilyId/En/Zh). */
export function fontSettingsKey(locale: Locale): "fontFamilyId" | "fontFamilyEn" | "fontFamilyZh" {
  if (locale === "en") return "fontFamilyEn";
  if (locale === "zh") return "fontFamilyZh";
  return "fontFamilyId";
}

/** Resolve slug (dari DB, bisa aja udah gak valid kalau list di atas
 * berubah) -> FontOption yg valid, fallback ke default per locale. */
export function resolveFontOption(slug: string | null | undefined, locale: Locale): FontOption {
  const found = slug ? FONT_OPTION_MAP[slug] : undefined;
  const expectedScript = locale === "zh" ? "cjk" : "latin";
  if (found && found.script === expectedScript) return found;
  return FONT_OPTION_MAP[DEFAULT_FONT_SLUG[locale]];
}

export function fontOptionsForLocale(locale: Locale): FontOption[] {
  return locale === "zh" ? CJK_FONT_OPTIONS : LATIN_FONT_OPTIONS;
}
