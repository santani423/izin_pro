"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Save, Plus, Trash2, ExternalLink, ImagePlus, Sparkles, Info,
  Award, Eye, Users, Search,
} from "lucide-react";
import type { AboutPageContent } from "@prisma/client";
import { swalSuccess, swalError } from "@/lib/swal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SortableList } from "@/components/admin/SortableList";
import { IconPicker } from "@/components/admin/IconPicker";
import { cn } from "@/lib/utils";
import {
  saveAboutHeroContentAction,
  saveAboutHeroImageAction,
  saveAboutSectionContentAction,
  saveAboutSectionImageAction,
  saveAboutValuesContentAction,
  saveAboutVisiMisiContentAction,
  saveAboutVisionImageAction,
  saveAboutMissionImageAction,
  saveAboutTeamSettingsAction,
  saveAboutSeoAction,
  type AboutHeroLangInput,
  type AboutSectionLangInput,
  type AboutValuesLangInput,
  type AboutVisiMisiLangInput,
  type AboutTeamLangInput,
  type AboutSeoLangInput,
} from "@/lib/actions/about";

const LANGS = [
  { key: "id", label: "Bahasa Indonesia" },
  { key: "en", label: "English" },
  { key: "zh", label: "中文" },
] as const;
type Lang = (typeof LANGS)[number]["key"];
type ByLang<T> = Record<Lang, T>;

/** Nilai EN/ZH null di DB -> array kosong sepanjang base biar index-nya
 * sinkron sama icon/ID (bukan berarti admin harus isi semua, field yang
 * kosong ("") otomatis fallback ke Bahasa Indonesia pas ditampilkan publik). */
function padStatsLang(raw: unknown, length: number): { value: string; label: string }[] {
  const arr = (raw as { value?: string; label?: string }[] | null) ?? [];
  return Array.from({ length }, (_, i) => ({ value: arr[i]?.value ?? "", label: arr[i]?.label ?? "" }));
}
function padValuesLang(raw: unknown, length: number): { title: string; description: string }[] {
  const arr = (raw as { title?: string; description?: string }[] | null) ?? [];
  return Array.from({ length }, (_, i) => ({ title: arr[i]?.title ?? "", description: arr[i]?.description ?? "" }));
}
function padStringArray(raw: unknown): string[] {
  return (raw as string[] | null) ?? [];
}

/** Buang field `_key` sintetis (dipakai SortableList sbg id drag) sebelum
 * item balik disimpan ke state/DB — sama pola dgn LayananDetailEditor. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function stripKey<T extends { _key: string }>({ _key, ...rest }: T): Omit<T, "_key"> {
  return rest;
}

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-3">
      <Label>Bahasa Konten</Label>
      <p className="text-xs text-gray-400">
        Field teks di semua tab bawah ini tampil ke publik sesuai bahasa yang dipilih pengunjung.
        English/中文 boleh dikosongkan — otomatis fallback ke Bahasa Indonesia per-field.
      </p>
      <div className="flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
        {LANGS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              lang === key ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function OptionalHint({ lang }: { lang: Lang }) {
  if (lang === "id") return null;
  return <span className="font-normal text-gray-400"> — opsional</span>;
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5">
      <div>
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Icon size={16} className="text-primary" />
          {title}
        </h3>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AboutPageEditor({
  content,
  teamCount,
  panel,
}: {
  content: AboutPageContent;
  teamCount: number;
  panel: string;
}) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("id");

  /* ─── Hero ─── */
  const [hero, setHero] = useState<ByLang<AboutHeroLangInput>>({
    id: {
      heroKicker: content.heroKicker ?? "",
      heroTitle: content.heroTitle,
      heroTitleHighlight: content.heroTitleHighlight,
      heroSubtitleBold: content.heroSubtitleBold,
      heroSubtitleBody: content.heroSubtitleBody,
    },
    en: {
      heroKicker: content.heroKickerEn ?? "",
      heroTitle: content.heroTitleEn ?? "",
      heroTitleHighlight: content.heroTitleHighlightEn ?? "",
      heroSubtitleBold: content.heroSubtitleBoldEn ?? "",
      heroSubtitleBody: content.heroSubtitleBodyEn ?? "",
    },
    zh: {
      heroKicker: content.heroKickerZh ?? "",
      heroTitle: content.heroTitleZh ?? "",
      heroTitleHighlight: content.heroTitleHighlightZh ?? "",
      heroSubtitleBold: content.heroSubtitleBoldZh ?? "",
      heroSubtitleBody: content.heroSubtitleBodyZh ?? "",
    },
  });
  const [heroImageUrl, setHeroImageUrl] = useState(content.heroImageUrl);
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);
  const [isSavingHero, startSaveHero] = useTransition();
  const setHeroField = (l: Lang, patch: Partial<AboutHeroLangInput>) =>
    setHero((prev) => ({ ...prev, [l]: { ...prev[l], ...patch } }));

  /* ─── Tentang Kami + Statistik ─── */
  const initialStatsIcons = (content.stats as unknown as { icon: string }[]).map((s) => s.icon);
  const [statsIcons, setStatsIcons] = useState<string[]>(initialStatsIcons);
  const [about, setAbout] = useState<ByLang<AboutSectionLangInput>>({
    id: {
      aboutKicker: content.aboutKicker,
      aboutTitle: content.aboutTitle,
      aboutTitleHighlight: content.aboutTitleHighlight,
      aboutParagraphs: content.aboutParagraphs as string[],
      stats: (content.stats as unknown as { value: string; label: string }[]).map((s) => ({ value: s.value, label: s.label })),
    },
    en: {
      aboutKicker: content.aboutKickerEn ?? "",
      aboutTitle: content.aboutTitleEn ?? "",
      aboutTitleHighlight: content.aboutTitleHighlightEn ?? "",
      aboutParagraphs: padStringArray(content.aboutParagraphsEn),
      stats: padStatsLang(content.statsEn, initialStatsIcons.length),
    },
    zh: {
      aboutKicker: content.aboutKickerZh ?? "",
      aboutTitle: content.aboutTitleZh ?? "",
      aboutTitleHighlight: content.aboutTitleHighlightZh ?? "",
      aboutParagraphs: padStringArray(content.aboutParagraphsZh),
      stats: padStatsLang(content.statsZh, initialStatsIcons.length),
    },
  });
  const [aboutImageUrl, setAboutImageUrl] = useState(content.aboutImageUrl);
  const [isUploadingAboutImage, setIsUploadingAboutImage] = useState(false);
  const [isSavingAbout, startSaveAbout] = useTransition();
  const setAboutField = (l: Lang, patch: Partial<AboutSectionLangInput>) =>
    setAbout((prev) => ({ ...prev, [l]: { ...prev[l], ...patch } }));

  const addStat = () => {
    setStatsIcons((prev) => [...prev, "star"]);
    setAbout((prev) => ({
      id: { ...prev.id, stats: [...prev.id.stats, { value: "", label: "" }] },
      en: { ...prev.en, stats: [...prev.en.stats, { value: "", label: "" }] },
      zh: { ...prev.zh, stats: [...prev.zh.stats, { value: "", label: "" }] },
    }));
  };
  const removeStat = (index: number) => {
    setStatsIcons((prev) => prev.filter((_, i) => i !== index));
    setAbout((prev) => ({
      id: { ...prev.id, stats: prev.id.stats.filter((_, i) => i !== index) },
      en: { ...prev.en, stats: prev.en.stats.filter((_, i) => i !== index) },
      zh: { ...prev.zh, stats: prev.zh.stats.filter((_, i) => i !== index) },
    }));
  };
  const updateStatField = (index: number, field: "value" | "label", value: string) => {
    setAbout((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], stats: prev[lang].stats.map((s, i) => (i === index ? { ...s, [field]: value } : s)) },
    }));
  };
  const reorderStats = (nextIcons: { icon: string; index: number; _key: string }[]) => {
    const order = nextIcons.map((item) => item.index);
    setStatsIcons(order.map((i) => statsIcons[i]));
    setAbout((prev) => ({
      id: { ...prev.id, stats: order.map((i) => prev.id.stats[i]) },
      en: { ...prev.en, stats: order.map((i) => prev.en.stats[i]) },
      zh: { ...prev.zh, stats: order.map((i) => prev.zh.stats[i]) },
    }));
  };

  /* ─── Nilai-Nilai ─── */
  const [valuesEnabled, setValuesEnabled] = useState(content.valuesEnabled);
  const initialValuesIcons = (content.values as unknown as { icon: string }[]).map((v) => v.icon);
  const [valuesIcons, setValuesIcons] = useState<string[]>(initialValuesIcons);
  const [values, setValues] = useState<ByLang<AboutValuesLangInput>>({
    id: {
      valuesTitle: content.valuesTitle,
      valuesTitleHighlight: content.valuesTitleHighlight,
      valuesSubtitle: content.valuesSubtitle,
      values: (content.values as unknown as { title: string; description: string }[]).map((v) => ({ title: v.title, description: v.description })),
    },
    en: {
      valuesTitle: content.valuesTitleEn ?? "",
      valuesTitleHighlight: content.valuesTitleHighlightEn ?? "",
      valuesSubtitle: content.valuesSubtitleEn ?? "",
      values: padValuesLang(content.valuesEn, initialValuesIcons.length),
    },
    zh: {
      valuesTitle: content.valuesTitleZh ?? "",
      valuesTitleHighlight: content.valuesTitleHighlightZh ?? "",
      valuesSubtitle: content.valuesSubtitleZh ?? "",
      values: padValuesLang(content.valuesZh, initialValuesIcons.length),
    },
  });
  const [isSavingValues, startSaveValues] = useTransition();
  const setValuesField = (l: Lang, patch: Partial<AboutValuesLangInput>) =>
    setValues((prev) => ({ ...prev, [l]: { ...prev[l], ...patch } }));

  const addValue = () => {
    setValuesIcons((prev) => [...prev, "shield-check"]);
    setValues((prev) => ({
      id: { ...prev.id, values: [...prev.id.values, { title: "", description: "" }] },
      en: { ...prev.en, values: [...prev.en.values, { title: "", description: "" }] },
      zh: { ...prev.zh, values: [...prev.zh.values, { title: "", description: "" }] },
    }));
  };
  const removeValue = (index: number) => {
    setValuesIcons((prev) => prev.filter((_, i) => i !== index));
    setValues((prev) => ({
      id: { ...prev.id, values: prev.id.values.filter((_, i) => i !== index) },
      en: { ...prev.en, values: prev.en.values.filter((_, i) => i !== index) },
      zh: { ...prev.zh, values: prev.zh.values.filter((_, i) => i !== index) },
    }));
  };
  const updateValueField = (index: number, field: "title" | "description", value: string) => {
    setValues((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], values: prev[lang].values.map((v, i) => (i === index ? { ...v, [field]: value } : v)) },
    }));
  };
  const reorderValues = (nextIcons: { icon: string; index: number; _key: string }[]) => {
    const order = nextIcons.map((item) => item.index);
    setValuesIcons(order.map((i) => valuesIcons[i]));
    setValues((prev) => ({
      id: { ...prev.id, values: order.map((i) => prev.id.values[i]) },
      en: { ...prev.en, values: order.map((i) => prev.en.values[i]) },
      zh: { ...prev.zh, values: order.map((i) => prev.zh.values[i]) },
    }));
  };

  /* ─── Visi & Misi ─── */
  const [visiMisiEnabled, setVisiMisiEnabled] = useState(content.visiMisiEnabled);
  const [visiMisi, setVisiMisi] = useState<ByLang<AboutVisiMisiLangInput>>({
    id: { vision: content.vision, mission: content.mission as string[] },
    en: { vision: content.visionEn ?? "", mission: padStringArray(content.missionEn) },
    zh: { vision: content.visionZh ?? "", mission: padStringArray(content.missionZh) },
  });
  const [visionImageUrl, setVisionImageUrl] = useState(content.visionImageUrl);
  const [isUploadingVisionImage, setIsUploadingVisionImage] = useState(false);
  const [missionImageUrl, setMissionImageUrl] = useState(content.missionImageUrl);
  const [isUploadingMissionImage, setIsUploadingMissionImage] = useState(false);
  const [isSavingVisiMisi, startSaveVisiMisi] = useTransition();
  const setVisiMisiField = (l: Lang, patch: Partial<AboutVisiMisiLangInput>) =>
    setVisiMisi((prev) => ({ ...prev, [l]: { ...prev[l], ...patch } }));

  /* ─── Tim (pengaturan saja — anggota dikelola /admin/tim) ─── */
  const [teamEnabled, setTeamEnabled] = useState(content.teamEnabled);
  const [team, setTeam] = useState<ByLang<AboutTeamLangInput>>({
    id: { teamTitle: content.teamTitle, teamTitleHighlight: content.teamTitleHighlight, teamSubtitle: content.teamSubtitle },
    en: {
      teamTitle: content.teamTitleEn ?? "",
      teamTitleHighlight: content.teamTitleHighlightEn ?? "",
      teamSubtitle: content.teamSubtitleEn ?? "",
    },
    zh: {
      teamTitle: content.teamTitleZh ?? "",
      teamTitleHighlight: content.teamTitleHighlightZh ?? "",
      teamSubtitle: content.teamSubtitleZh ?? "",
    },
  });
  const [isSavingTeamSettings, startSaveTeamSettings] = useTransition();
  const setTeamField = (l: Lang, patch: Partial<AboutTeamLangInput>) =>
    setTeam((prev) => ({ ...prev, [l]: { ...prev[l], ...patch } }));

  /* ─── SEO ─── */
  const [seo, setSeo] = useState<ByLang<AboutSeoLangInput>>({
    id: { metaTitle: content.metaTitle ?? "", metaDescription: content.metaDescription ?? "" },
    en: { metaTitle: content.metaTitleEn ?? "", metaDescription: content.metaDescriptionEn ?? "" },
    zh: { metaTitle: content.metaTitleZh ?? "", metaDescription: content.metaDescriptionZh ?? "" },
  });
  const [isSavingSeo, startSaveSeo] = useTransition();
  const setSeoField = (l: Lang, patch: Partial<AboutSeoLangInput>) =>
    setSeo((prev) => ({ ...prev, [l]: { ...prev[l], ...patch } }));

  const statsList = useMemo(
    () => statsIcons.map((icon, i) => ({ icon, index: i, _key: `s-${i}` })),
    [statsIcons],
  );
  const valuesList = useMemo(
    () => valuesIcons.map((icon, i) => ({ icon, index: i, _key: `v-${i}` })),
    [valuesIcons],
  );

  const previewHref = `/tentang-kami`;

  /* ─── Hero ─── */
  const uploadHeroImage = async (file: File) => {
    setIsUploadingHeroImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await saveAboutHeroImageAction(fd);
      if (res.ok) {
        setHeroImageUrl(res.imageUrl);
        swalSuccess("Gambar Hero berhasil disimpan");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal mengunggah gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setIsUploadingHeroImage(false);
    }
  };

  const removeHeroImage = async () => {
    setIsUploadingHeroImage(true);
    try {
      const fd = new FormData();
      fd.append("reset", "true");
      const res = await saveAboutHeroImageAction(fd);
      if (res.ok) {
        setHeroImageUrl(null);
        swalSuccess("Gambar Hero dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal menghapus gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setIsUploadingHeroImage(false);
    }
  };

  const saveHero = () => {
    startSaveHero(async () => {
      try {
        const res = await saveAboutHeroContentAction({ id: hero.id, en: hero.en, zh: hero.zh });
        if (res.ok) {
          swalSuccess("Konten Hero berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan konten Hero. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── Tentang Kami ─── */
  const uploadAboutImage = async (file: File) => {
    setIsUploadingAboutImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await saveAboutSectionImageAction(fd);
      if (res.ok) {
        setAboutImageUrl(res.imageUrl);
        swalSuccess("Gambar Tentang Kami berhasil disimpan");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal mengunggah gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setIsUploadingAboutImage(false);
    }
  };

  const removeAboutImage = async () => {
    setIsUploadingAboutImage(true);
    try {
      const fd = new FormData();
      fd.append("reset", "true");
      const res = await saveAboutSectionImageAction(fd);
      if (res.ok) {
        setAboutImageUrl(null);
        swalSuccess("Gambar Tentang Kami dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal menghapus gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setIsUploadingAboutImage(false);
    }
  };

  const saveAbout = () => {
    startSaveAbout(async () => {
      try {
        const res = await saveAboutSectionContentAction({
          id: { ...about.id, stats: about.id.stats.map((s, i) => ({ ...s, icon: statsIcons[i] })) },
          en: about.en,
          zh: about.zh,
        });
        if (res.ok) {
          swalSuccess("Konten Tentang Kami berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan konten. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── Nilai-Nilai ─── */
  const saveValues = () => {
    startSaveValues(async () => {
      try {
        const res = await saveAboutValuesContentAction({
          id: {
            valuesEnabled,
            ...values.id,
            values: values.id.values.map((v, i) => ({ ...v, icon: valuesIcons[i] })),
          },
          en: values.en,
          zh: values.zh,
        });
        if (res.ok) {
          swalSuccess("Konten Nilai-Nilai berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan konten. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── Visi & Misi ─── */
  const uploadVisionImage = async (file: File) => {
    setIsUploadingVisionImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await saveAboutVisionImageAction(fd);
      if (res.ok) {
        setVisionImageUrl(res.imageUrl);
        swalSuccess("Ilustrasi Visi berhasil disimpan");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal mengunggah gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setIsUploadingVisionImage(false);
    }
  };

  const removeVisionImage = async () => {
    setIsUploadingVisionImage(true);
    try {
      const fd = new FormData();
      fd.append("reset", "true");
      const res = await saveAboutVisionImageAction(fd);
      if (res.ok) {
        setVisionImageUrl(null);
        swalSuccess("Ilustrasi Visi dikembalikan ke bawaan");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal menghapus gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setIsUploadingVisionImage(false);
    }
  };

  const uploadMissionImage = async (file: File) => {
    setIsUploadingMissionImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await saveAboutMissionImageAction(fd);
      if (res.ok) {
        setMissionImageUrl(res.imageUrl);
        swalSuccess("Ilustrasi Misi berhasil disimpan");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal mengunggah gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setIsUploadingMissionImage(false);
    }
  };

  const removeMissionImage = async () => {
    setIsUploadingMissionImage(true);
    try {
      const fd = new FormData();
      fd.append("reset", "true");
      const res = await saveAboutMissionImageAction(fd);
      if (res.ok) {
        setMissionImageUrl(null);
        swalSuccess("Ilustrasi Misi dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal menghapus gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setIsUploadingMissionImage(false);
    }
  };

  const saveVisiMisi = () => {
    startSaveVisiMisi(async () => {
      try {
        const res = await saveAboutVisiMisiContentAction({ visiMisiEnabled, id: visiMisi.id, en: visiMisi.en, zh: visiMisi.zh });
        if (res.ok) {
          swalSuccess("Konten Visi & Misi berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan konten. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── Tim ─── */
  const saveTeamSettings = () => {
    startSaveTeamSettings(async () => {
      try {
        const res = await saveAboutTeamSettingsAction({ teamEnabled, id: team.id, en: team.en, zh: team.zh });
        if (res.ok) {
          swalSuccess("Pengaturan section Tim berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── SEO ─── */
  const saveSeo = () => {
    startSaveSeo(async () => {
      try {
        const res = await saveAboutSeoAction({ id: seo.id, en: seo.en, zh: seo.zh });
        if (res.ok) {
          swalSuccess("SEO berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  const h = hero[lang];
  const a = about[lang];
  const v = values[lang];
  const vm = visiMisi[lang];
  const t = team[lang];
  const s = seo[lang];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/${panel}/dashboard`)}
            className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label="Kembali ke dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="font-bold text-gray-900">Kelola Konten Tentang Kami</h2>
            <p className="text-xs text-gray-400">/tentang-kami</p>
          </div>
        </div>
        <Link
          href={previewHref}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ExternalLink size={14} />
          Preview Halaman
        </Link>
      </div>

      <LangSwitcher lang={lang} onChange={setLang} />

      <Tabs defaultValue="hero">
        <TabsList className="rounded-xl mb-2 bg-gray-200 flex-wrap h-auto">
          <TabsTrigger value="hero" className="rounded-lg">Hero</TabsTrigger>
          <TabsTrigger value="about" className="rounded-lg">Tentang</TabsTrigger>
          <TabsTrigger value="values" className="rounded-lg">Nilai-Nilai</TabsTrigger>
          <TabsTrigger value="visimisi" className="rounded-lg">Visi & Misi</TabsTrigger>
          <TabsTrigger value="team" className="rounded-lg">Tim</TabsTrigger>
          <TabsTrigger value="seo" className="rounded-lg">SEO</TabsTrigger>
        </TabsList>

        {/* ─── Hero ─── */}
        <TabsContent value="hero" className="space-y-5">
          <SectionCard icon={Sparkles} title="Gambar Hero" description="Kosongkan untuk pakai kartu gradient bawaan.">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {heroImageUrl ? (
                  <Image src={heroImageUrl} alt="" width={112} height={80} unoptimized className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus size={20} className="text-gray-300" />
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <ImagePlus size={15} />
                {isUploadingHeroImage ? "Mengunggah..." : "Pilih Gambar"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={isUploadingHeroImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadHeroImage(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {heroImageUrl && (
                <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg text-red-500 hover:bg-red-50" onClick={removeHeroImage} disabled={isUploadingHeroImage}>
                  <Trash2 size={13} /> Hapus
                </Button>
              )}
            </div>
          </SectionCard>

          <SectionCard icon={Sparkles} title="Judul & Subjudul">
            <div className="space-y-1.5">
              <Label>Kicker (label kecil di atas judul, opsional)</Label>
              <Input value={h.heroKicker} onChange={(e) => setHeroField(lang, { heroKicker: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Judul<OptionalHint lang={lang} /></Label>
                <Input value={h.heroTitle} onChange={(e) => setHeroField(lang, { heroTitle: e.target.value })} className="rounded-xl" placeholder="Tentang" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul (bagian hijau)<OptionalHint lang={lang} /></Label>
                <Input value={h.heroTitleHighlight} onChange={(e) => setHeroField(lang, { heroTitleHighlight: e.target.value })} className="rounded-xl" placeholder="IzinPro" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Subjudul (baris tebal)<OptionalHint lang={lang} /></Label>
              <Textarea value={h.heroSubtitleBold} onChange={(e) => setHeroField(lang, { heroSubtitleBold: e.target.value })} rows={2} className="rounded-xl resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Subjudul (paragraf)<OptionalHint lang={lang} /></Label>
              <Textarea value={h.heroSubtitleBody} onChange={(e) => setHeroField(lang, { heroSubtitleBody: e.target.value })} rows={3} className="rounded-xl resize-none" />
            </div>
            <Button onClick={saveHero} disabled={isSavingHero} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingHero ? "Menyimpan..." : "Simpan Hero"}
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── Tentang Kami ─── */}
        <TabsContent value="about" className="space-y-5">
          <SectionCard icon={Info} title="Gambar Tentang Kami" description="Kosongkan untuk pakai kartu gradient bawaan.">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {aboutImageUrl ? (
                  <Image src={aboutImageUrl} alt="" width={112} height={80} unoptimized className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus size={20} className="text-gray-300" />
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <ImagePlus size={15} />
                {isUploadingAboutImage ? "Mengunggah..." : "Pilih Gambar"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={isUploadingAboutImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadAboutImage(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {aboutImageUrl && (
                <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg text-red-500 hover:bg-red-50" onClick={removeAboutImage} disabled={isUploadingAboutImage}>
                  <Trash2 size={13} /> Hapus
                </Button>
              )}
            </div>
          </SectionCard>

          <SectionCard icon={Info} title="Judul & Deskripsi">
            <div className="space-y-1.5">
              <Label>Kicker<OptionalHint lang={lang} /></Label>
              <Input value={a.aboutKicker} onChange={(e) => setAboutField(lang, { aboutKicker: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Judul<OptionalHint lang={lang} /></Label>
                <Input value={a.aboutTitle} onChange={(e) => setAboutField(lang, { aboutTitle: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul (bagian hijau)<OptionalHint lang={lang} /></Label>
                <Input value={a.aboutTitleHighlight} onChange={(e) => setAboutField(lang, { aboutTitleHighlight: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Paragraf (satu per baris)<OptionalHint lang={lang} /></Label>
              <Textarea
                value={a.aboutParagraphs.join("\n")}
                onChange={(e) => setAboutField(lang, { aboutParagraphs: e.target.value.split("\n") })}
                rows={4}
                className="rounded-xl resize-none"
              />
            </div>
          </SectionCard>

          <SectionCard icon={Award} title="Kartu Statistik" description="Statistik pertama juga jadi badge di atas foto. Ikon sama di semua bahasa — cuma nilai & label yang diterjemahkan.">
            <SortableList
              id="about-stats-list"
              items={statsList}
              getId={(x) => x._key}
              onReorder={reorderStats}
              renderItem={(item, i) => {
                const stat = a.stats[i] ?? { value: "", label: "" };
                return (
                  <div className="grid grid-cols-[9rem_5rem_1fr_auto] items-center gap-2 rounded-xl border border-gray-200 p-2.5">
                    <IconPicker
                      value={item.icon}
                      onChange={(icon) => setStatsIcons((prev) => prev.map((x, idx) => (idx === i ? icon : x)))}
                    />
                    <Input
                      value={stat.value}
                      onChange={(e) => updateStatField(i, "value", e.target.value)}
                      className="rounded-lg"
                      placeholder="5.000+"
                    />
                    <Input
                      value={stat.label}
                      onChange={(e) => updateStatField(i, "label", e.target.value)}
                      className="rounded-lg"
                      placeholder="Label"
                    />
                    <button
                      type="button"
                      onClick={() => removeStat(i)}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                      aria-label="Hapus statistik"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              }}
            />
            <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={addStat}>
              <Plus size={14} /> Tambah Statistik
            </Button>
          </SectionCard>

          <Button onClick={saveAbout} disabled={isSavingAbout} className="gap-2 rounded-xl">
            <Save size={15} />
            {isSavingAbout ? "Menyimpan..." : "Simpan Tentang Kami"}
          </Button>
        </TabsContent>

        {/* ─── Nilai-Nilai ─── */}
        <TabsContent value="values" className="space-y-5">
          <SectionCard icon={Award} title="Nilai-Nilai" description="Section opsional — nonaktifkan kalau gak mau tampil.">
            <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-3">
              <Switch checked={valuesEnabled} onCheckedChange={setValuesEnabled} className="data-[state=checked]:bg-primary" />
              <span className="text-sm text-gray-700">Tampilkan section Nilai-Nilai</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Judul (bagian hijau)<OptionalHint lang={lang} /></Label>
                <Input value={v.valuesTitleHighlight} onChange={(e) => setValuesField(lang, { valuesTitleHighlight: e.target.value })} className="rounded-xl" placeholder="Nilai-Nilai" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul<OptionalHint lang={lang} /></Label>
                <Input value={v.valuesTitle} onChange={(e) => setValuesField(lang, { valuesTitle: e.target.value })} className="rounded-xl" placeholder="yang Kami Junjung" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Subjudul<OptionalHint lang={lang} /></Label>
              <Textarea value={v.valuesSubtitle} onChange={(e) => setValuesField(lang, { valuesSubtitle: e.target.value })} rows={2} className="rounded-xl resize-none" />
            </div>

            <SortableList
              id="values-list"
              items={valuesList}
              getId={(x) => x._key}
              onReorder={reorderValues}
              renderItem={(item, i) => {
                const val = v.values[i] ?? { title: "", description: "" };
                return (
                  <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-40">
                        <IconPicker
                          value={item.icon}
                          onChange={(icon) => setValuesIcons((prev) => prev.map((x, idx) => (idx === i ? icon : x)))}
                        />
                      </div>
                      <Input
                        value={val.title}
                        onChange={(e) => updateValueField(i, "title", e.target.value)}
                        className="flex-1 rounded-lg"
                        placeholder="Judul"
                      />
                      <button
                        type="button"
                        onClick={() => removeValue(i)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                        aria-label="Hapus nilai"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <Textarea
                      value={val.description}
                      onChange={(e) => updateValueField(i, "description", e.target.value)}
                      rows={2}
                      className="rounded-lg resize-none"
                      placeholder="Deskripsi"
                    />
                  </div>
                );
              }}
            />
            <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={addValue}>
              <Plus size={14} /> Tambah Nilai
            </Button>

            <Button onClick={saveValues} disabled={isSavingValues} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingValues ? "Menyimpan..." : "Simpan Nilai-Nilai"}
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── Visi & Misi ─── */}
        <TabsContent value="visimisi" className="space-y-5">
          <SectionCard icon={Eye} title="Visi & Misi" description="Section opsional — nonaktifkan kalau gak mau tampil.">
            <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-3">
              <Switch checked={visiMisiEnabled} onCheckedChange={setVisiMisiEnabled} className="data-[state=checked]:bg-primary" />
              <span className="text-sm text-gray-700">Tampilkan section Visi & Misi</span>
            </div>

            <div className="space-y-1.5">
              <Label>Ilustrasi Skyline (kartu Visi)</Label>
              <div className="flex items-center gap-3">
                <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  <Image src={visionImageUrl ?? "/images/tentang-skyline-v3.png"} alt="" width={112} height={80} unoptimized className="h-full w-full object-contain" />
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <ImagePlus size={15} />
                  {isUploadingVisionImage ? "Mengunggah..." : "Pilih Gambar"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={isUploadingVisionImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadVisionImage(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {visionImageUrl && (
                  <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg text-red-500 hover:bg-red-50" onClick={removeVisionImage} disabled={isUploadingVisionImage}>
                    <Trash2 size={13} /> Pakai Bawaan
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Visi<OptionalHint lang={lang} /></Label>
              <Textarea value={vm.vision} onChange={(e) => setVisiMisiField(lang, { vision: e.target.value })} rows={2} className="rounded-xl resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Misi (satu per baris)<OptionalHint lang={lang} /></Label>
              <Textarea
                value={vm.mission.join("\n")}
                onChange={(e) => setVisiMisiField(lang, { mission: e.target.value.split("\n") })}
                rows={4}
                className="rounded-xl resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Ilustrasi Misi</Label>
              <p className="text-xs text-gray-400">Kosongkan untuk pakai kartu gradient bawaan.</p>
              <div className="flex items-center gap-3">
                <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  {missionImageUrl ? (
                    <Image src={missionImageUrl} alt="" width={112} height={80} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus size={20} className="text-gray-300" />
                  )}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <ImagePlus size={15} />
                  {isUploadingMissionImage ? "Mengunggah..." : "Pilih Gambar"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={isUploadingMissionImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadMissionImage(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {missionImageUrl && (
                  <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg text-red-500 hover:bg-red-50" onClick={removeMissionImage} disabled={isUploadingMissionImage}>
                    <Trash2 size={13} /> Hapus
                  </Button>
                )}
              </div>
            </div>

            <Button onClick={saveVisiMisi} disabled={isSavingVisiMisi} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingVisiMisi ? "Menyimpan..." : "Simpan Visi & Misi"}
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── Tim ─── */}
        <TabsContent value="team" className="space-y-5">
          <SectionCard icon={Users} title="Section Tim" description="Section opsional — nonaktifkan kalau gak mau tampil.">
            <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-3">
              <Switch checked={teamEnabled} onCheckedChange={setTeamEnabled} className="data-[state=checked]:bg-primary" />
              <span className="text-sm text-gray-700">Tampilkan section Tim</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Judul<OptionalHint lang={lang} /></Label>
                <Input value={t.teamTitle} onChange={(e) => setTeamField(lang, { teamTitle: e.target.value })} className="rounded-xl" placeholder="Tim" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul (bagian hijau)<OptionalHint lang={lang} /></Label>
                <Input value={t.teamTitleHighlight} onChange={(e) => setTeamField(lang, { teamTitleHighlight: e.target.value })} className="rounded-xl" placeholder="Profesional" />
              </div>
            </div>
            <p className="text-xs text-gray-400">Tampil sebagai: &quot;{t.teamTitle} {t.teamTitleHighlight} Kami&quot;</p>
            <div className="space-y-1.5">
              <Label>Subjudul<OptionalHint lang={lang} /></Label>
              <Textarea value={t.teamSubtitle} onChange={(e) => setTeamField(lang, { teamSubtitle: e.target.value })} rows={2} className="rounded-xl resize-none" />
            </div>

            <Button onClick={saveTeamSettings} disabled={isSavingTeamSettings} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingTeamSettings ? "Menyimpan..." : "Simpan Pengaturan Tim"}
            </Button>
          </SectionCard>

          <SectionCard icon={Users} title="Anggota Tim" description={`${teamCount} anggota terdaftar. Kelola nama, jabatan, foto & LinkedIn di halaman Tim.`}>
            <Link
              href={`/${panel}/tim`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ExternalLink size={14} />
              Kelola Anggota Tim
            </Link>
          </SectionCard>
        </TabsContent>

        {/* ─── SEO ─── */}
        <TabsContent value="seo" className="space-y-5">
          <SectionCard icon={Search} title="SEO">
            <div className="space-y-1.5">
              <Label>Meta Title<OptionalHint lang={lang} /></Label>
              <Input value={s.metaTitle} onChange={(e) => setSeoField(lang, { metaTitle: e.target.value })} className="rounded-xl" placeholder={`${h.heroTitle} ${h.heroTitleHighlight}`} />
            </div>
            <div className="space-y-1.5">
              <Label>Meta Description<OptionalHint lang={lang} /></Label>
              <Textarea value={s.metaDescription} onChange={(e) => setSeoField(lang, { metaDescription: e.target.value })} rows={3} className="rounded-xl resize-none" placeholder={h.heroSubtitleBody} />
            </div>
            <Button onClick={saveSeo} disabled={isSavingSeo} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingSeo ? "Menyimpan..." : "Simpan SEO"}
            </Button>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
