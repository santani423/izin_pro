"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Sparkles, Zap, ShieldCheck, Users, MousePointerClick, ImagePlus, RefreshCcw, ImageIcon } from "lucide-react";
import { swalSuccess, swalError } from "@/lib/swal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { saveHeroContentAction, saveHeroImageAction, type HeroContentLangInput } from "@/lib/actions/hero";

type Highlight = { title: string; subtitle: string };

/* Ikon tiap badge highlight tetap hardcode sesuai urutan — samain sama
 * HeroSection.tsx & HERO_HIGHLIGHTS (landing.ts) biar preview di admin
 * konsisten sama tampilan asli di beranda. */
const HIGHLIGHT_ICONS = [Zap, ShieldCheck, Users];

const HERO_LANGS = [
  { key: "id", label: "Bahasa Indonesia" },
  { key: "en", label: "English" },
  { key: "zh", label: "中文" },
] as const;
type HeroLang = (typeof HERO_LANGS)[number]["key"];

export default function BerandaPageClient({
  id: initialId,
  en: initialEn,
  zh: initialZh,
  ctaSecondaryHref: initialCtaSecondaryHref,
  heroImageUrl: initialHeroImageUrl,
}: {
  id: HeroContentLangInput;
  en: HeroContentLangInput;
  zh: HeroContentLangInput;
  ctaSecondaryHref: string;
  heroImageUrl: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isImagePending, startImageTransition] = useTransition();
  const [lang, setLang] = useState<HeroLang>("id");
  const [content, setContent] = useState<Record<HeroLang, HeroContentLangInput>>({
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

  return (
    <div className="p-6 lg:p-8 space-y-6">
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
        <div className="flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
          {HERO_LANGS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setLang(key)}
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
    </div>
  );
}
