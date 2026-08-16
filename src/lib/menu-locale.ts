import type { Locale } from "@/i18n/config";
import { pickLocalizedText } from "@/lib/locale-field";

interface MenuItemLike {
  label: string;
  labelEn: string | null;
  labelZh: string | null;
}

/** Timpa `label` tiap node (+ satu level `children`) dengan varian sesuai
 * locale aktif — dipakai Navbar (header) & Footer (footer) supaya menu dari
 * admin ikut tampil EN/ZH tanpa Navbar/Footer sendiri perlu tahu soal locale. */
export function localizeMenuTree<T extends MenuItemLike & { children?: MenuItemLike[] }>(
  items: T[],
  locale: Locale,
): T[] {
  return items.map((item) => ({
    ...item,
    label: pickLocalizedText(item.label, item.labelEn, item.labelZh, locale),
    children: item.children?.map((child) => ({
      ...child,
      label: pickLocalizedText(child.label, child.labelEn, child.labelZh, locale),
    })),
  }));
}
