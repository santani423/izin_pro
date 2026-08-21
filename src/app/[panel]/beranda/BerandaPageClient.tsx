"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Save, Sparkles, Zap, ShieldCheck, Users, MousePointerClick, ImagePlus, RefreshCcw, ImageIcon,
  Video, Link2, Upload, ListChecks, Plus, Trash2,
} from "lucide-react";
import type { AboutVideoSource } from "@prisma/client";
import { swalSuccess, swalError } from "@/lib/swal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { saveHeroContentAction, saveHeroImageAction, type HeroContentLangInput } from "@/lib/actions/hero";
import {
  saveAboutHomeContentAction,
  saveAboutHomeVideoAction,
  type AboutHomeLangInput,
} from "@/lib/actions/about-home";

type Highlight = { title: string; subtitle: string };

/* Ikon tiap badge highlight tetap hardcode sesuai urutan — samain sama
 * HeroSection.tsx & HERO_HIGHLIGHTS (landing.ts) biar preview di admin
 * konsisten sama tampilan asli di beranda. */
const HIGHLIGHT_ICONS = [Zap, ShieldCheck, Users];

const LANGS = [
  { key: "id", label: "Bahasa Indonesia" },
  { key: "en", label: "English" },
  { key: "zh", label: "中文" },
] as const;
type Lang = (typeof LANGS)[number]["key"];

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
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
  );
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
    <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5 max-w-2xl">
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

export default function BerandaPageClient({
  id: initialId,
  en: initialEn,
  zh: initialZh,
  ctaSecondaryHref: initialCtaSecondaryHref,
  heroImageUrl: initialHeroImageUrl,
  aboutId: initialAboutId,
  aboutEn: initialAboutEn,
  aboutZh: initialAboutZh,
  aboutButtonHref: initialAboutButtonHref,
  aboutVideoSource: initialAboutVideoSource,
  aboutVideoYoutubeUrl: initialAboutVideoYoutubeUrl,
  aboutVideoUploadUrl: initialAboutVideoUploadUrl,
}: {
  id: HeroContentLangInput;
  en: HeroContentLangInput;
  zh: HeroContentLangInput;
  ctaSecondaryHref: string;
  heroImageUrl: string | null;
  aboutId: AboutHomeLangInput;
  aboutEn: AboutHomeLangInput;
  aboutZh: AboutHomeLangInput;
  aboutButtonHref: string;
  aboutVideoSource: AboutVideoSource;
  aboutVideoYoutubeUrl: string | null;
  aboutVideoUploadUrl: string | null;
}) {
  const router = useRouter();

  /* ─── Hero ─── */
  const [isPending, startTransition] = useTransition();
  const [isImagePending, startImageTransition] = useTransition();
  const [lang, setLang] = useState<Lang>("id");
  const [content, setContent] = useState<Record<Lang, HeroContentLangInput>>({
    id: initialId,
    en: initialEn,
    zh: initialZh,
  });
  const [ctaSecondaryHref, setCtaSecondaryHref] = useState(initialCtaSecondaryHref);
  const [heroImageUrl, setHeroImageUrl] = useState(initialHeroImageUrl);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [resetHeroImage, setResetHeroImage] = useState(false);

  const current = content[lang];
  const setCurrent = (patch: Partial<HeroContentLangInput>) =>
    setContent((prev) => ({ ...prev, [lang]: { ...prev[lang], ...patch } }));

  const updateHighlight = (index: number, field: keyof Highlight, value: string) => {
    setCurrent({
      highlights: current.highlights.map((h, i) => (i === index ? { ...h, [field]: value } : h)),
    });
  };

  const heroImagePreview = useMemo(() => {
    if (heroImageFile) return URL.createObjectURL(heroImageFile);
    if (heroImageUrl && !resetHeroImage) return heroImageUrl;
    return null;
  }, [heroImageFile, heroImageUrl, resetHeroImage]);

  const saveImage = () => {
    startImageTransition(async () => {
      try {
        const formData = new FormData();
        if (heroImageFile) formData.set("image", heroImageFile);
        if (resetHeroImage) formData.set("reset", "true");

        const res = await saveHeroImageAction(formData);
        if (res.ok) {
          swalSuccess("Gambar Hero berhasil disimpan");
          setHeroImageUrl(res.imageUrl);
          setHeroImageFile(null);
          setResetHeroImage(false);
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan gambar Hero. Cek koneksi lalu coba lagi.");
      }
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await saveHeroContentAction({
          id: content.id,
          en: content.en,
          zh: content.zh,
          ctaSecondaryHref,
        });
        if (res.ok) {
          swalSuccess("Konten Hero berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        // Tanpa catch ini, kalau request gagal sebelum server action sempat
        // balikin { ok, message } (mis. koneksi kepotong), user gak liat
        // feedback apa pun — persis kejadian yg pernah kealamin di halaman
        // Pengaturan (upload logo/favicon), lihat catatan di settings action.
        swalError("Gagal menyimpan konten Hero. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── Tentang IzinPro ─── */
  const [aboutLang, setAboutLang] = useState<Lang>("id");
  const [aboutContent, setAboutContent] = useState<Record<Lang, AboutHomeLangInput>>({
    id: initialAboutId,
    en: initialAboutEn,
    zh: initialAboutZh,
  });
  const [aboutButtonHref, setAboutButtonHref] = useState(initialAboutButtonHref);
  const [isAboutPending, startAboutTransition] = useTransition();

  const aboutCurrent = aboutContent[aboutLang];
  const setAboutCurrent = (patch: Partial<AboutHomeLangInput>) =>
    setAboutContent((prev) => ({ ...prev, [aboutLang]: { ...prev[aboutLang], ...patch } }));

  const updatePoint = (index: number, value: string) => {
    setAboutContent((prev) => ({
      ...prev,
      [aboutLang]: { ...prev[aboutLang], points: prev[aboutLang].points.map((p, i) => (i === index ? value : p)) },
    }));
  };
  const addPoint = () => {
    setAboutContent((prev) => ({
      id: { ...prev.id, points: [...prev.id.points, ""] },
      en: { ...prev.en, points: [...prev.en.points, ""] },
      zh: { ...prev.zh, points: [...prev.zh.points, ""] },
    }));
  };
  const removePoint = (index: number) => {
    setAboutContent((prev) => ({
      id: { ...prev.id, points: prev.id.points.filter((_, i) => i !== index) },
      en: { ...prev.en, points: prev.en.points.filter((_, i) => i !== index) },
      zh: { ...prev.zh, points: prev.zh.points.filter((_, i) => i !== index) },
    }));
  };

  const handleSaveAbout = () => {
    startAboutTransition(async () => {
      try {
        const res = await saveAboutHomeContentAction({
          id: aboutContent.id,
          en: aboutContent.en,
          zh: aboutContent.zh,
          buttonHref: aboutButtonHref,
        });
        if (res.ok) {
          swalSuccess("Konten Tentang IzinPro berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan konten Tentang IzinPro. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── Tentang IzinPro — Video (YouTube atau upload file) ─── */
  const [videoSourceTab, setVideoSourceTab] = useState<AboutVideoSource>(initialAboutVideoSource);
  const [youtubeUrl, setYoutubeUrl] = useState(initialAboutVideoYoutubeUrl ?? "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [currentUploadUrl, setCurrentUploadUrl] = useState(initialAboutVideoUploadUrl);
  const [isVideoPending, startVideoTransition] = useTransition();

  const videoUploadPreview = useMemo(() => {
    if (videoFile) return URL.createObjectURL(videoFile);
    return currentUploadUrl;
  }, [videoFile, currentUploadUrl]);

  const canSaveVideo =
    videoSourceTab === "YOUTUBE" ? youtubeUrl.trim().length > 0 : videoFile !== null;

  const saveVideo = () => {
    startVideoTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("source", videoSourceTab);
        if (videoSourceTab === "YOUTUBE") {
          formData.set("youtubeUrl", youtubeUrl);
        } else if (videoFile) {
          formData.set("video", videoFile);
        }

        const res = await saveAboutHomeVideoAction(formData);
        if (res.ok) {
          swalSuccess("Video berhasil disimpan");
          setVideoFile(null);
          setCurrentUploadUrl(res.videoUploadUrl);
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan video. Cek koneksi lalu coba lagi.");
      }
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <Tabs defaultValue="hero">
        <TabsList className="rounded-xl mb-6 bg-gray-200 flex-wrap h-auto">
          <TabsTrigger value="hero" className="rounded-lg">Hero</TabsTrigger>
          <TabsTrigger value="about" className="rounded-lg">Tentang IzinPro</TabsTrigger>
        </TabsList>

        {/* ═══ Tab: Hero ═══ */}
        <TabsContent value="hero" className="space-y-6">
          <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5 max-w-2xl">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon size={16} className="text-primary" />
              Gambar Kolom Kanan
            </h3>
            <p className="text-sm text-gray-500">
              Ganti kartu gradient hijau di sisi kanan Hero dengan gambar/foto asli. Kosongkan (reset)
              untuk balik ke kartu gradient bawaan. Kartu statistik (5.000+, 99%) otomatis disembunyikan
              selama gambar custom aktif, karena posisinya gak selalu pas di atas foto sembarang.
            </p>
            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {heroImagePreview ? (
                    <Image src={heroImagePreview} alt="Preview gambar Hero" width={112} height={80} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    <span className="rounded-lg bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark px-2 py-1 text-[10px] font-semibold text-white">
                      Gradient bawaan
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Rasio disarankan 4:3 (mis. 1200×900px).</p>
                  <p className="text-xs text-gray-400">Format PNG, JPG, atau WebP. Maksimal 15MB.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <ImagePlus size={15} />
                  Pilih File
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      if (file) {
                        setHeroImageFile(file);
                        setResetHeroImage(false);
                      }
                    }}
                    disabled={isImagePending}
                  />
                </label>
                <Button type="button" variant="outline" className="gap-2 rounded-xl" onClick={() => { setResetHeroImage(true); setHeroImageFile(null); }} disabled={isImagePending}>
                  <RefreshCcw size={15} />
                  Reset ke gradient bawaan
                </Button>
                <Button
                  type="button"
                  onClick={saveImage}
                  disabled={isImagePending || (!heroImageFile && !resetHeroImage)}
                  className="gap-2 rounded-xl"
                >
                  <Save size={15} />
                  {isImagePending ? "Menyimpan..." : "Simpan Gambar"}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-3 max-w-2xl">
            <Label>Bahasa Konten</Label>
            <p className="text-xs text-gray-400">
              Judul, Subjudul, Badge, dan Label tombol di bawah tampil ke publik sesuai bahasa yang dipilih
              pengunjung. English/中文 boleh dikosongkan — otomatis fallback ke Bahasa Indonesia.
            </p>
            <LangSwitcher lang={lang} onChange={setLang} />
          </div>

          <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5 max-w-2xl">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              Judul & Subjudul
            </h3>
            <p className="text-sm text-gray-500">
              Bagian paling atas beranda. Baris ke-2 judul (highlight) tampil dengan warna primary.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Judul — baris 1{lang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}</Label>
                <Input value={current.titleLine1} onChange={(e) => setCurrent({ titleLine1: e.target.value })} className="rounded-xl" disabled={isPending} />
              </div>
              <div className="space-y-1.5">
                <Label>Judul — baris 2 (highlight warna){lang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}</Label>
                <Input value={current.titleHighlight} onChange={(e) => setCurrent({ titleHighlight: e.target.value })} className="rounded-xl" disabled={isPending} />
              </div>
              <div className="space-y-1.5">
                <Label>Judul — baris 3{lang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}</Label>
                <Input value={current.titleLine3} onChange={(e) => setCurrent({ titleLine3: e.target.value })} className="rounded-xl" disabled={isPending} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Subjudul{lang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}</Label>
              <Textarea
                value={current.subtitle}
                onChange={(e) => setCurrent({ subtitle: e.target.value })}
                rows={2}
                className="rounded-xl resize-none"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5 max-w-2xl">
            <h3 className="font-bold text-gray-900">Badge Highlight (3 kartu kecil)</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {current.highlights.map((h, i) => {
                const Icon = HIGHLIGHT_ICONS[i];
                return (
                  <div key={i} className="space-y-2.5 rounded-xl border border-gray-200 p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                      {Icon && <Icon size={14} className="text-primary" />}
                      Badge {i + 1}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Judul</Label>
                      <Input
                        value={h.title}
                        onChange={(e) => updateHighlight(i, "title", e.target.value)}
                        className="rounded-lg"
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Subjudul</Label>
                      <Input
                        value={h.subtitle}
                        onChange={(e) => updateHighlight(i, "subtitle", e.target.value)}
                        className="rounded-lg"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5 max-w-2xl">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MousePointerClick size={16} className="text-primary" />
              Tombol CTA
            </h3>
            <div className="space-y-1.5">
              <Label>Label tombol utama (WhatsApp){lang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}</Label>
              <Input value={current.ctaPrimaryLabel} onChange={(e) => setCurrent({ ctaPrimaryLabel: e.target.value })} className="rounded-xl" disabled={isPending} />
              <p className="text-xs text-gray-400">Link tombol ini tetap ikut nomor WhatsApp di Pengaturan, cuma labelnya yang diatur di sini.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Label tombol kedua{lang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}</Label>
                <Input value={current.ctaSecondaryLabel} onChange={(e) => setCurrent({ ctaSecondaryLabel: e.target.value })} className="rounded-xl" disabled={isPending} />
              </div>
              <div className="space-y-1.5">
                <Label>Link tombol kedua</Label>
                <Input value={ctaSecondaryHref} onChange={(e) => setCtaSecondaryHref(e.target.value)} className="rounded-xl" disabled={isPending} />
                <p className="text-xs text-gray-400">Link internal — sama di semua bahasa, gak perlu diterjemahkan.</p>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isPending} className="gap-2 rounded-xl">
            <Save size={15} />
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </TabsContent>

        {/* ═══ Tab: Tentang IzinPro ═══ */}
        <TabsContent value="about" className="space-y-6">
          <SectionCard
            icon={Video}
            title="Video Kolom Kanan"
            description="Video profil yang tampil di sisi kanan section Tentang IzinPro (beranda). Pilih YouTube (tempel link apa saja) atau unggah file video sendiri."
          >
            <div className="flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setVideoSourceTab("YOUTUBE")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  videoSourceTab === "YOUTUBE" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700",
                )}
              >
                <Link2 size={14} /> YouTube
              </button>
              <button
                type="button"
                onClick={() => setVideoSourceTab("UPLOAD")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  videoSourceTab === "UPLOAD" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700",
                )}
              >
                <Upload size={14} /> Upload File
              </button>
            </div>

            {videoSourceTab === "YOUTUBE" ? (
              <div className="space-y-1.5">
                <Label>Link video YouTube</Label>
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=xxxxxxxxxxx"
                  className="rounded-xl"
                  disabled={isVideoPending}
                />
                <p className="text-xs text-gray-400">
                  Tempel link video YouTube apa saja (watch, youtu.be, shorts) — otomatis dikonversi ke player saat ditampilkan.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
                {videoUploadPreview && (
                  <video src={videoUploadPreview} controls className="w-full max-w-sm rounded-xl bg-black" />
                )}
                <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Upload size={15} />
                  Pilih File Video
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/ogg"
                    className="hidden"
                    onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                    disabled={isVideoPending}
                  />
                </label>
                <p className="text-xs text-gray-400">Format MP4, WebM, MOV, atau OGG. Maksimal 100MB.</p>
                {videoFile && <p className="text-xs text-gray-600">File dipilih: {videoFile.name}</p>}
              </div>
            )}

            <Button type="button" onClick={saveVideo} disabled={isVideoPending || !canSaveVideo} className="w-fit gap-2 rounded-xl">
              <Save size={15} />
              {isVideoPending ? "Menyimpan..." : "Simpan Video"}
            </Button>
          </SectionCard>

          <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-3 max-w-2xl">
            <Label>Bahasa Konten</Label>
            <p className="text-xs text-gray-400">
              Judul, Deskripsi, Poin, dan Label tombol di bawah tampil ke publik sesuai bahasa yang dipilih
              pengunjung. English/中文 boleh dikosongkan — otomatis fallback ke Bahasa Indonesia.
            </p>
            <LangSwitcher lang={aboutLang} onChange={setAboutLang} />
          </div>

          <SectionCard icon={Sparkles} title="Judul & Deskripsi">
            <div className="space-y-1.5">
              <Label>Judul{aboutLang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}</Label>
              <Input value={aboutCurrent.heading} onChange={(e) => setAboutCurrent({ heading: e.target.value })} className="rounded-xl" disabled={isAboutPending} />
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi{aboutLang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}</Label>
              <Textarea
                value={aboutCurrent.description}
                onChange={(e) => setAboutCurrent({ description: e.target.value })}
                rows={3}
                className="rounded-xl resize-none"
                disabled={isAboutPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Judul video (aksesibilitas){aboutLang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}</Label>
              <Input value={aboutCurrent.videoTitle} onChange={(e) => setAboutCurrent({ videoTitle: e.target.value })} className="rounded-xl" disabled={isAboutPending} />
              <p className="text-xs text-gray-400">Dipakai screen reader & judul pop-up pemutar video — bukan teks yang tampil di layar.</p>
            </div>
          </SectionCard>

          <SectionCard icon={ListChecks} title="Poin Checklist" description="Daftar keunggulan singkat di bawah deskripsi.">
            <div className="space-y-2.5">
              {aboutCurrent.points.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={p}
                    onChange={(e) => updatePoint(i, e.target.value)}
                    className="rounded-xl"
                    disabled={isAboutPending}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-xl"
                    onClick={() => removePoint(i)}
                    disabled={isAboutPending || aboutCurrent.points.length <= 1}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" className="w-fit gap-2 rounded-xl" onClick={addPoint} disabled={isAboutPending}>
              <Plus size={14} />
              Tambah Poin
            </Button>
          </SectionCard>

          <SectionCard icon={MousePointerClick} title="Tombol CTA">
            <div className="space-y-1.5">
              <Label>Label tombol{aboutLang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}</Label>
              <Input value={aboutCurrent.buttonLabel} onChange={(e) => setAboutCurrent({ buttonLabel: e.target.value })} className="rounded-xl" disabled={isAboutPending} />
            </div>
            <div className="space-y-1.5">
              <Label>Link tombol</Label>
              <Input value={aboutButtonHref} onChange={(e) => setAboutButtonHref(e.target.value)} className="rounded-xl" disabled={isAboutPending} />
              <p className="text-xs text-gray-400">Link internal (mis. /tentang-kami) — sama di semua bahasa, gak perlu diterjemahkan.</p>
            </div>
          </SectionCard>

          <Button onClick={handleSaveAbout} disabled={isAboutPending} className="gap-2 rounded-xl">
            <Save size={15} />
            {isAboutPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
