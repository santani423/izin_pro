"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Save, ImagePlus, Trash2, Plus, Pencil, LayoutTemplate, Sparkles, Package,
  Timer, Award, ListOrdered, Headset, Megaphone, Gift,
} from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import type {
  PromoPageContent,
  PromoPackage as PromoPackageModel,
  PromoBanner as PromoBannerModel,
  PromoBannerVariant,
} from "@prisma/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SortableList } from "@/components/admin/SortableList";
import { IconPicker } from "@/components/admin/IconPicker";
import {
  savePromoHeroContentAction,
  savePromoHeroImageAction,
  savePromoHighlightsAction,
  savePromoPackagesHeadingAction,
  createPromoPackageAction,
  updatePromoPackageAction,
  deletePromoPackageAction,
  reorderPromoPackagesAction,
  savePromoCountdownContentAction,
  savePromoWhyContentAction,
  savePromoStepsContentAction,
  savePromoConsultContentAction,
  savePromoConsultImageAction,
  savePromoCtaContentAction,
  createPromoBannerAction,
  updatePromoBannerAction,
  deletePromoBannerAction,
  reorderPromoBannersAction,
  uploadPromoBannerImageAction,
  type PromoHighlightInput,
  type PromoPackageFormData,
  type PromoWhyInput,
  type PromoStepInput,
  type PromoBannerLangData,
  type PromoBannerFormData,
} from "@/lib/actions/promo-page";

/* ─── Lang switcher (ID/EN/中文) — sama pola dgn CtaBannerPageClient.tsx,
 * dipakai buat toggle field mana yg keliatan pas ngedit Banner Promo Beranda. */
const LANGS = [
  { key: "id", label: "Bahasa Indonesia" },
  { key: "en", label: "English" },
  { key: "zh", label: "中文" },
] as const;
type Lang = (typeof LANGS)[number]["key"];

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex w-fit gap-1 rounded-lg bg-gray-100 p-1">
      {LANGS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
            lang === key ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const VARIANT_LABELS: Record<PromoBannerVariant, string> = {
  DISCOUNT: "Diskon",
  FREE: "Gratis",
  PACKAGE: "Paket Hemat",
};

interface BannerFormState {
  id: string | null;
  lang: Record<Lang, PromoBannerLangData>;
  variant: PromoBannerVariant;
  ctaHref: string;
  isActive: boolean;
  imageMediaId: string | null;
  imageUrl: string | null;
}

const emptyBannerLang = (): PromoBannerLangData => ({ eyebrow: "", title: "", description: "", ctaLabel: "" });

const emptyBannerForm = (): BannerFormState => ({
  id: null,
  lang: { id: emptyBannerLang(), en: emptyBannerLang(), zh: emptyBannerLang() },
  variant: "DISCOUNT",
  ctaHref: "",
  isActive: true,
  imageMediaId: null,
  imageUrl: null,
});

type SerializedPromoBanner = PromoBannerModel & { image: { url: string } | null };

type SerializedPromoPackage = Omit<PromoPackageModel, "price" | "originalPrice"> & {
  price: number;
  originalPrice: number | null;
  service: { id: string; title: string; slug: string } | null;
};

type ServiceOption = { id: string; title: string; slug: string };

const NO_SERVICE = "__none__";

/** Buang field `_key` sintetis (dipakai SortableList sbg id drag) sebelum
 * item balik disimpan ke state/DB — sama pola dgn AboutPageEditor. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function stripKey<T extends { _key: string }>({ _key, ...rest }: T): Omit<T, "_key"> {
  return rest;
}

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
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

interface PackageFormState {
  id: string;
  badge: string;
  title: string;
  price: string;
  originalPrice: string;
  features: string;
  serviceId: string;
  isDark: boolean;
}

const emptyPackageForm = (): PackageFormState => ({
  id: "",
  badge: "",
  title: "",
  price: "",
  originalPrice: "",
  features: "",
  serviceId: NO_SERVICE,
  isDark: false,
});

export default function PromoPageClient({
  content,
  packages,
  services,
  banners,
}: {
  content: PromoPageContent;
  packages: SerializedPromoPackage[];
  services: ServiceOption[];
  banners: SerializedPromoBanner[];
  panel: string;
}) {
  const router = useRouter();

  /* ─── Banner (Hero) ─── */
  const [heroKicker, setHeroKicker] = useState(content.heroKicker ?? "");
  const [heroTitle, setHeroTitle] = useState(content.heroTitle);
  const [heroTitleHighlight, setHeroTitleHighlight] = useState(content.heroTitleHighlight);
  const [heroDescription, setHeroDescription] = useState(content.heroDescription);
  const [heroImageUrl, setHeroImageUrl] = useState(content.heroImageUrl);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [isSavingHero, startSaveHero] = useTransition();

  /* ─── Highlight bar ─── */
  const [highlights, setHighlights] = useState<PromoHighlightInput[]>(
    content.highlights as unknown as PromoHighlightInput[],
  );
  const [isSavingHighlights, startSaveHighlights] = useTransition();
  const highlightsList = useMemo(() => highlights.map((h, i) => ({ ...h, _key: `h-${i}` })), [highlights]);

  /* ─── Judul section Paket Promo ─── */
  const [packagesTitlePrefix, setPackagesTitlePrefix] = useState(content.packagesTitlePrefix);
  const [packagesTitleHighlight, setPackagesTitleHighlight] = useState(content.packagesTitleHighlight);
  const [packagesTitleSuffix, setPackagesTitleSuffix] = useState(content.packagesTitleSuffix);
  const [packagesSubtitle, setPackagesSubtitle] = useState(content.packagesSubtitle);
  const [isSavingPackagesHeading, startSavePackagesHeading] = useTransition();

  /* ─── Paket Promo (CRUD) ─── */
  const [packageForm, setPackageForm] = useState<PackageFormState | null>(null);
  const [isSavingPackage, startSavePackage] = useTransition();
  const [isReordering, startReorder] = useTransition();

  /* ─── Banner Promo Beranda (CRUD) ─── */
  const [bannerForm, setBannerForm] = useState<BannerFormState | null>(null);
  const [bannerFormLang, setBannerFormLang] = useState<Lang>("id");
  const [isSavingBanner, startSaveBanner] = useTransition();
  const [isReorderingBanners, startReorderBanners] = useTransition();
  const [isUploadingBannerImage, setIsUploadingBannerImage] = useState(false);

  /* ─── Countdown ─── */
  const [countdownTitlePrefix, setCountdownTitlePrefix] = useState(content.countdownTitlePrefix);
  const [countdownTitleHighlight, setCountdownTitleHighlight] = useState(content.countdownTitleHighlight);
  const [countdownDescription, setCountdownDescription] = useState(content.countdownDescription);
  const [isSavingCountdown, startSaveCountdown] = useTransition();

  /* ─── Kenapa Pilih Promo ─── */
  const [whyTitlePrefix, setWhyTitlePrefix] = useState(content.whyTitlePrefix);
  const [whyTitleHighlight, setWhyTitleHighlight] = useState(content.whyTitleHighlight);
  const [whyItems, setWhyItems] = useState<PromoWhyInput[]>(content.whyItems as unknown as PromoWhyInput[]);
  const [isSavingWhy, startSaveWhy] = useTransition();
  const whyList = useMemo(() => whyItems.map((w, i) => ({ ...w, _key: `w-${i}` })), [whyItems]);

  /* ─── Cara Mendapatkan Promo ─── */
  const [stepsTitle, setStepsTitle] = useState(content.stepsTitle);
  const [steps, setSteps] = useState<PromoStepInput[]>(content.steps as unknown as PromoStepInput[]);
  const [isSavingSteps, startSaveSteps] = useTransition();
  const stepsListUi = useMemo(() => steps.map((s, i) => ({ ...s, _key: `st-${i}` })), [steps]);

  /* ─── Ajakan Konsultasi ─── */
  const [consultTitlePrefix, setConsultTitlePrefix] = useState(content.consultTitlePrefix);
  const [consultTitleHighlight, setConsultTitleHighlight] = useState(content.consultTitleHighlight);
  const [consultDescription, setConsultDescription] = useState(content.consultDescription);
  const [consultImageUrl, setConsultImageUrl] = useState(content.consultImageUrl);
  const [uploadingConsultImage, setUploadingConsultImage] = useState(false);
  const [isSavingConsult, startSaveConsult] = useTransition();

  /* ─── CTA Banner ─── */
  const [ctaTitle, setCtaTitle] = useState(content.ctaTitle);
  const [ctaSubtitle, setCtaSubtitle] = useState(content.ctaSubtitle);
  const [ctaButtonLabel, setCtaButtonLabel] = useState(content.ctaButtonLabel);
  const [isSavingCta, startSaveCta] = useTransition();

  /* ─── Banner (Hero) handlers ─── */
  const uploadHeroImage = async (file: File) => {
    setUploadingHeroImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await savePromoHeroImageAction(fd);
      if (res.ok) {
        setHeroImageUrl(res.imageUrl);
        swalSuccess("Gambar banner berhasil disimpan");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal mengunggah gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const removeHeroImage = async () => {
    setUploadingHeroImage(true);
    try {
      const fd = new FormData();
      fd.append("reset", "true");
      const res = await savePromoHeroImageAction(fd);
      if (res.ok) {
        setHeroImageUrl(null);
        swalSuccess("Gambar banner dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal menghapus gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const saveHero = () => {
    startSaveHero(async () => {
      try {
        const res = await savePromoHeroContentAction({ heroKicker, heroTitle, heroTitleHighlight, heroDescription });
        if (res.ok) {
          swalSuccess("Banner berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan banner. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── Highlight handlers ─── */
  const saveHighlights = () => {
    startSaveHighlights(async () => {
      try {
        const res = await savePromoHighlightsAction({ highlights });
        if (res.ok) {
          swalSuccess("Highlight berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── Judul section Paket Promo ─── */
  const savePackagesHeading = () => {
    startSavePackagesHeading(async () => {
      try {
        const res = await savePromoPackagesHeadingAction({
          packagesTitlePrefix,
          packagesTitleHighlight,
          packagesTitleSuffix,
          packagesSubtitle,
        });
        if (res.ok) {
          swalSuccess("Judul section berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── Paket Promo (CRUD) ─── */
  const openPackageForm = (pkg: SerializedPromoPackage | null) => {
    setPackageForm(
      pkg
        ? {
            id: pkg.id,
            badge: pkg.badge ?? "",
            title: pkg.title,
            price: String(pkg.price),
            originalPrice: pkg.originalPrice ? String(pkg.originalPrice) : "",
            features: (pkg.features as string[]).join("\n"),
            serviceId: pkg.serviceId ?? NO_SERVICE,
            isDark: pkg.isDark,
          }
        : emptyPackageForm(),
    );
  };

  const savePackage = () => {
    if (!packageForm) return;
    const data: PromoPackageFormData = {
      badge: packageForm.badge,
      title: packageForm.title,
      price: Number(packageForm.price) || 0,
      originalPrice: packageForm.originalPrice ? Number(packageForm.originalPrice) : null,
      features: packageForm.features.split("\n"),
      serviceId: packageForm.serviceId === NO_SERVICE ? null : packageForm.serviceId,
      isDark: packageForm.isDark,
    };
    startSavePackage(async () => {
      try {
        const res = packageForm.id
          ? await updatePromoPackageAction(packageForm.id, data)
          : await createPromoPackageAction(data);
        if (res.ok) {
          swalSuccess(packageForm.id ? "Paket diperbarui" : "Paket ditambahkan");
          setPackageForm(null);
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan paket. Cek koneksi lalu coba lagi.");
      }
    });
  };

  const removePackage = async (pkg: SerializedPromoPackage) => {
    const confirmed = await swalConfirmDelete(`Paket "${pkg.title}"`);
    if (!confirmed) return;
    startSavePackage(async () => {
      const res = await deletePromoPackageAction(pkg.id);
      if (res.ok) {
        swalSuccess("Paket dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const reorderPackages = (next: SerializedPromoPackage[]) => {
    startReorder(async () => {
      const res = await reorderPromoPackagesAction(next.map((p) => p.id));
      if (res.ok) {
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  /* ─── Banner Promo Beranda handlers ─── */
  const openBannerForm = (banner: SerializedPromoBanner | null) => {
    setBannerForm(
      banner
        ? {
            id: banner.id,
            lang: {
              id: {
                eyebrow: banner.eyebrow,
                title: banner.title,
                description: banner.description ?? "",
                ctaLabel: banner.ctaLabel ?? "",
              },
              en: {
                eyebrow: banner.eyebrowEn ?? "",
                title: banner.titleEn ?? "",
                description: banner.descriptionEn ?? "",
                ctaLabel: banner.ctaLabelEn ?? "",
              },
              zh: {
                eyebrow: banner.eyebrowZh ?? "",
                title: banner.titleZh ?? "",
                description: banner.descriptionZh ?? "",
                ctaLabel: banner.ctaLabelZh ?? "",
              },
            },
            variant: banner.variant,
            ctaHref: banner.ctaHref ?? "",
            isActive: banner.isActive,
            imageMediaId: banner.imageMediaId,
            imageUrl: banner.image?.url ?? null,
          }
        : emptyBannerForm(),
    );
    setBannerFormLang("id");
  };

  const uploadBannerImage = async (file: File) => {
    if (!bannerForm) return;
    setIsUploadingBannerImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await uploadPromoBannerImageAction(fd);
      if (res.ok) {
        setBannerForm({ ...bannerForm, imageUrl: res.url, imageMediaId: res.mediaId });
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal mengunggah gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setIsUploadingBannerImage(false);
    }
  };

  const removeBannerImage = () => {
    if (!bannerForm) return;
    setBannerForm({ ...bannerForm, imageUrl: null, imageMediaId: null });
  };

  const saveBanner = () => {
    if (!bannerForm) return;
    const data: PromoBannerFormData = {
      id: bannerForm.lang.id,
      en: bannerForm.lang.en,
      zh: bannerForm.lang.zh,
      variant: bannerForm.variant,
      ctaHref: bannerForm.ctaHref,
      isActive: bannerForm.isActive,
      imageMediaId: bannerForm.imageMediaId,
    };
    startSaveBanner(async () => {
      try {
        const res = bannerForm.id
          ? await updatePromoBannerAction(bannerForm.id, data)
          : await createPromoBannerAction(data);
        if (res.ok) {
          swalSuccess(bannerForm.id ? "Banner diperbarui" : "Banner ditambahkan");
          setBannerForm(null);
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan banner. Cek koneksi lalu coba lagi.");
      }
    });
  };

  const removeBanner = async (banner: SerializedPromoBanner) => {
    const confirmed = await swalConfirmDelete(`Banner "${banner.eyebrow}"`);
    if (!confirmed) return;
    startSaveBanner(async () => {
      const res = await deletePromoBannerAction(banner.id);
      if (res.ok) {
        swalSuccess("Banner dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const reorderBanners = (next: SerializedPromoBanner[]) => {
    startReorderBanners(async () => {
      const res = await reorderPromoBannersAction(next.map((b) => b.id));
      if (res.ok) {
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  /* ─── Countdown handlers ─── */
  const saveCountdown = () => {
    startSaveCountdown(async () => {
      try {
        const res = await savePromoCountdownContentAction({
          countdownTitlePrefix,
          countdownTitleHighlight,
          countdownDescription,
        });
        if (res.ok) {
          swalSuccess("Countdown berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── Kenapa Pilih Promo handlers ─── */
  const saveWhy = () => {
    startSaveWhy(async () => {
      try {
        const res = await savePromoWhyContentAction({ whyTitlePrefix, whyTitleHighlight, whyItems });
        if (res.ok) {
          swalSuccess("Konten berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── Cara Mendapatkan Promo handlers ─── */
  const saveSteps = () => {
    startSaveSteps(async () => {
      try {
        const res = await savePromoStepsContentAction({ stepsTitle, steps });
        if (res.ok) {
          swalSuccess("Konten berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── Ajakan Konsultasi handlers ─── */
  const uploadConsultImage = async (file: File) => {
    setUploadingConsultImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await savePromoConsultImageAction(fd);
      if (res.ok) {
        setConsultImageUrl(res.imageUrl);
        swalSuccess("Foto berhasil disimpan");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal mengunggah gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setUploadingConsultImage(false);
    }
  };

  const removeConsultImage = async () => {
    setUploadingConsultImage(true);
    try {
      const fd = new FormData();
      fd.append("reset", "true");
      const res = await savePromoConsultImageAction(fd);
      if (res.ok) {
        setConsultImageUrl(null);
        swalSuccess("Foto dikembalikan ke bawaan");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal menghapus gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setUploadingConsultImage(false);
    }
  };

  const saveConsult = () => {
    startSaveConsult(async () => {
      try {
        const res = await savePromoConsultContentAction({
          consultTitlePrefix,
          consultTitleHighlight,
          consultDescription,
        });
        if (res.ok) {
          swalSuccess("Konten berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── CTA Banner handlers ─── */
  const saveCta = () => {
    startSaveCta(async () => {
      try {
        const res = await savePromoCtaContentAction({ ctaTitle, ctaSubtitle, ctaButtonLabel });
        if (res.ok) {
          swalSuccess("CTA berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Tabs defaultValue="banner">
        <TabsList className="rounded-xl mb-2 bg-gray-200 flex-wrap h-auto">
          <TabsTrigger value="banner" className="rounded-lg">Banner</TabsTrigger>
          <TabsTrigger value="highlight" className="rounded-lg">Highlight</TabsTrigger>
          <TabsTrigger value="packages" className="rounded-lg">Paket Promo</TabsTrigger>
          <TabsTrigger value="banners" className="rounded-lg">Banner Promo Beranda</TabsTrigger>
          <TabsTrigger value="countdown" className="rounded-lg">Countdown</TabsTrigger>
          <TabsTrigger value="why" className="rounded-lg">Kenapa Promo</TabsTrigger>
          <TabsTrigger value="steps" className="rounded-lg">Cara Klaim</TabsTrigger>
          <TabsTrigger value="consult" className="rounded-lg">Ajakan Konsultasi</TabsTrigger>
          <TabsTrigger value="cta" className="rounded-lg">CTA Banner</TabsTrigger>
        </TabsList>

        {/* ─── Banner ─── */}
        <TabsContent value="banner" className="space-y-5">
          <SectionCard icon={Sparkles} title="Gambar Banner" description="Kosongkan untuk pakai kartu gradient bawaan.">
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
                {uploadingHeroImage ? "Mengunggah..." : "Pilih Gambar"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploadingHeroImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadHeroImage(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {heroImageUrl && (
                <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg text-red-500 hover:bg-red-50" onClick={removeHeroImage} disabled={uploadingHeroImage}>
                  <Trash2 size={13} /> Hapus
                </Button>
              )}
            </div>
          </SectionCard>

          <SectionCard icon={LayoutTemplate} title="Judul & Deskripsi">
            <div className="space-y-1.5">
              <Label>Kicker (label kecil di atas judul, opsional)</Label>
              <Input value={heroKicker} onChange={(e) => setHeroKicker(e.target.value)} className="rounded-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Judul</Label>
                <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="rounded-xl" placeholder="Promosi" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul (bagian hijau)</Label>
                <Input value={heroTitleHighlight} onChange={(e) => setHeroTitleHighlight(e.target.value)} className="rounded-xl" placeholder="Spesial" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi</Label>
              <Textarea value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} rows={3} className="rounded-xl resize-none" />
            </div>
            <Button onClick={saveHero} disabled={isSavingHero} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingHero ? "Menyimpan..." : "Simpan Banner"}
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── Highlight bar ─── */}
        <TabsContent value="highlight" className="space-y-5">
          <SectionCard icon={Sparkles} title="Highlight Bar" description="Baris keunggulan singkat di bawah banner.">
            <SortableList
              id="promo-highlights-list"
              items={highlightsList}
              getId={(h) => h._key}
              onReorder={(next) => setHighlights(next.map(stripKey))}
              renderItem={(h, i) => (
                <div className="grid grid-cols-[9rem_1fr_auto] items-center gap-2 rounded-xl border border-gray-200 p-2.5">
                  <IconPicker
                    value={h.icon}
                    onChange={(icon) => setHighlights((prev) => prev.map((x, idx) => (idx === i ? { ...x, icon } : x)))}
                  />
                  <Input
                    value={h.label}
                    onChange={(e) => setHighlights((prev) => prev.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))}
                    className="rounded-lg"
                    placeholder="Label"
                  />
                  <button
                    type="button"
                    onClick={() => setHighlights((prev) => prev.filter((_, idx) => idx !== i))}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                    aria-label="Hapus highlight"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() => setHighlights((prev) => [...prev, { icon: "star", label: "" }])}
            >
              <Plus size={14} /> Tambah Highlight
            </Button>
            <Button onClick={saveHighlights} disabled={isSavingHighlights} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingHighlights ? "Menyimpan..." : "Simpan Highlight"}
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── Paket Promo ─── */}
        <TabsContent value="packages" className="space-y-5">
          <SectionCard icon={Package} title="Judul Section">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Awalan Judul</Label>
                <Input value={packagesTitlePrefix} onChange={(e) => setPackagesTitlePrefix(e.target.value)} className="rounded-xl" placeholder="Promo" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul (bagian hijau)</Label>
                <Input value={packagesTitleHighlight} onChange={(e) => setPackagesTitleHighlight(e.target.value)} className="rounded-xl" placeholder="Pilihan" />
              </div>
              <div className="space-y-1.5">
                <Label>Akhiran Judul</Label>
                <Input value={packagesTitleSuffix} onChange={(e) => setPackagesTitleSuffix(e.target.value)} className="rounded-xl" placeholder="untuk Anda" />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Tampil sebagai: &quot;{packagesTitlePrefix} <span className="text-primary">{packagesTitleHighlight}</span> {packagesTitleSuffix}&quot;
            </p>
            <div className="space-y-1.5">
              <Label>Subjudul</Label>
              <Textarea value={packagesSubtitle} onChange={(e) => setPackagesSubtitle(e.target.value)} rows={2} className="rounded-xl resize-none" />
            </div>
            <Button onClick={savePackagesHeading} disabled={isSavingPackagesHeading} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingPackagesHeading ? "Menyimpan..." : "Simpan Judul Section"}
            </Button>
          </SectionCard>

          <SectionCard icon={Package} title="Kartu Paket" description="3 kartu paket yang tampil di section ini.">
            <SortableList
              id="promo-packages-list"
              items={packages}
              getId={(p) => p.id}
              onReorder={reorderPackages}
              disabled={isReordering}
              renderItem={(pkg) => (
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {pkg.badge && <Badge variant="secondary" className="text-[10px]">{pkg.badge}</Badge>}
                      <span className="font-semibold text-sm text-gray-900 truncate">{pkg.title}</span>
                      {pkg.isDark && <Badge className="text-[10px]">Kartu Gelap</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatRupiah(pkg.price)}
                      {pkg.originalPrice && (
                        <span className="ml-1.5 text-gray-400 line-through">{formatRupiah(pkg.originalPrice)}</span>
                      )}
                      <span className="mx-1.5 text-gray-300">·</span>
                      {pkg.service ? `Link: ${pkg.service.title}` : "Tanpa link layanan (ke /layanan)"}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openPackageForm(pkg)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                      aria-label="Edit paket"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePackage(pkg)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label="Hapus paket"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            />
            {packages.length === 0 && (
              <p className="text-sm text-gray-400">Belum ada paket promo.</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() => openPackageForm(null)}
            >
              <Plus size={14} /> Tambah Paket
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── Banner Promo Beranda (kartu "Promo Spesial" homepage, bukan banner di atas) ─── */}
        <TabsContent value="banners" className="space-y-5">
          <SectionCard
            icon={Gift}
            title="Banner Promo Beranda"
            description="3 kartu 'Promo Spesial' yang tampil di homepage (PromoSection) — beda dari Banner di tab pertama, yang itu buat halaman /promo."
          >
            <SortableList
              id="promo-banners-list"
              items={banners}
              getId={(b) => b.id}
              onReorder={reorderBanners}
              disabled={isReorderingBanners}
              renderItem={(banner) => (
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="text-[10px]">{VARIANT_LABELS[banner.variant]}</Badge>
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {banner.eyebrow} — {banner.title}
                      </span>
                      {!banner.isActive && <Badge className="text-[10px]" variant="outline">Nonaktif</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 truncate">{banner.description}</p>
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openBannerForm(banner)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                      aria-label="Edit banner"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBanner(banner)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label="Hapus banner"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            />
            {banners.length === 0 && (
              <p className="text-sm text-gray-400">Belum ada banner promo beranda.</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() => openBannerForm(null)}
            >
              <Plus size={14} /> Tambah Banner
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── Countdown ─── */}
        <TabsContent value="countdown" className="space-y-5">
          <SectionCard icon={Timer} title="Countdown Diskon" description="Hitung mundur otomatis ke akhir bulan berjalan — cuma judul & deskripsi yang bisa diedit.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Awalan Judul</Label>
                <Input value={countdownTitlePrefix} onChange={(e) => setCountdownTitlePrefix(e.target.value)} className="rounded-xl" placeholder="Diskon Spesial" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul (bagian hijau)</Label>
                <Input value={countdownTitleHighlight} onChange={(e) => setCountdownTitleHighlight(e.target.value)} className="rounded-xl" placeholder="Konsultasi Gratis" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi</Label>
              <Textarea value={countdownDescription} onChange={(e) => setCountdownDescription(e.target.value)} rows={2} className="rounded-xl resize-none" />
            </div>
            <Button onClick={saveCountdown} disabled={isSavingCountdown} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingCountdown ? "Menyimpan..." : "Simpan Countdown"}
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── Kenapa Pilih Promo ─── */}
        <TabsContent value="why" className="space-y-5">
          <SectionCard icon={Award} title="Kenapa Pilih Promo IzinPro?">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Awalan Judul</Label>
                <Input value={whyTitlePrefix} onChange={(e) => setWhyTitlePrefix(e.target.value)} className="rounded-xl" placeholder="Kenapa Pilih Promo" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul (bagian hijau)</Label>
                <Input value={whyTitleHighlight} onChange={(e) => setWhyTitleHighlight(e.target.value)} className="rounded-xl" placeholder="IzinPro?" />
              </div>
            </div>

            <SortableList
              id="promo-why-list"
              items={whyList}
              getId={(w) => w._key}
              onReorder={(next) => setWhyItems(next.map(stripKey))}
              renderItem={(w, i) => (
                <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-40">
                      <IconPicker
                        value={w.icon}
                        onChange={(icon) => setWhyItems((prev) => prev.map((x, idx) => (idx === i ? { ...x, icon } : x)))}
                      />
                    </div>
                    <Input
                      value={w.title}
                      onChange={(e) => setWhyItems((prev) => prev.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))}
                      className="flex-1 rounded-lg"
                      placeholder="Judul"
                    />
                    <button
                      type="button"
                      onClick={() => setWhyItems((prev) => prev.filter((_, idx) => idx !== i))}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                      aria-label="Hapus item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Textarea
                    value={w.description}
                    onChange={(e) => setWhyItems((prev) => prev.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)))}
                    rows={2}
                    className="rounded-lg resize-none"
                    placeholder="Deskripsi"
                  />
                </div>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() => setWhyItems((prev) => [...prev, { icon: "star", title: "", description: "" }])}
            >
              <Plus size={14} /> Tambah Item
            </Button>

            <Button onClick={saveWhy} disabled={isSavingWhy} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingWhy ? "Menyimpan..." : "Simpan"}
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── Cara Mendapatkan Promo ─── */}
        <TabsContent value="steps" className="space-y-5">
          <SectionCard icon={ListOrdered} title="Cara Mendapatkan Promo">
            <div className="space-y-1.5">
              <Label>Judul Section</Label>
              <Input value={stepsTitle} onChange={(e) => setStepsTitle(e.target.value)} className="rounded-xl" placeholder="Cara Mendapatkan Promo" />
            </div>

            <SortableList
              id="promo-steps-list"
              items={stepsListUi}
              getId={(s) => s._key}
              onReorder={(next) => setSteps(next.map(stripKey))}
              renderItem={(s, i) => (
                <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-40">
                      <IconPicker
                        value={s.icon}
                        onChange={(icon) => setSteps((prev) => prev.map((x, idx) => (idx === i ? { ...x, icon } : x)))}
                      />
                    </div>
                    <Input
                      value={s.title}
                      onChange={(e) => setSteps((prev) => prev.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))}
                      className="flex-1 rounded-lg"
                      placeholder="Judul langkah"
                    />
                    <button
                      type="button"
                      onClick={() => setSteps((prev) => prev.filter((_, idx) => idx !== i))}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                      aria-label="Hapus langkah"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Textarea
                    value={s.description}
                    onChange={(e) => setSteps((prev) => prev.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)))}
                    rows={2}
                    className="rounded-lg resize-none"
                    placeholder="Deskripsi"
                  />
                </div>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() => setSteps((prev) => [...prev, { icon: "clipboard-list", title: "", description: "" }])}
            >
              <Plus size={14} /> Tambah Langkah
            </Button>

            <Button onClick={saveSteps} disabled={isSavingSteps} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingSteps ? "Menyimpan..." : "Simpan"}
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── Ajakan Konsultasi ─── */}
        <TabsContent value="consult" className="space-y-5">
          <SectionCard icon={Headset} title="Foto Banner Ajakan" description="Kosongkan untuk pakai foto bawaan.">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <Image
                  src={consultImageUrl ?? "/images/promo-konsultasi.png"}
                  alt=""
                  width={112}
                  height={80}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <ImagePlus size={15} />
                {uploadingConsultImage ? "Mengunggah..." : "Pilih Gambar"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploadingConsultImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadConsultImage(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {consultImageUrl && (
                <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg text-red-500 hover:bg-red-50" onClick={removeConsultImage} disabled={uploadingConsultImage}>
                  <Trash2 size={13} /> Pakai Bawaan
                </Button>
              )}
            </div>
          </SectionCard>

          <SectionCard icon={Headset} title="Judul & Deskripsi">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Awalan Judul</Label>
                <Input value={consultTitlePrefix} onChange={(e) => setConsultTitlePrefix(e.target.value)} className="rounded-xl" placeholder="Siap Dapatkan" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul (bagian hijau)</Label>
                <Input value={consultTitleHighlight} onChange={(e) => setConsultTitleHighlight(e.target.value)} className="rounded-xl" placeholder="Promo Spesial Ini?" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi</Label>
              <Textarea value={consultDescription} onChange={(e) => setConsultDescription(e.target.value)} rows={2} className="rounded-xl resize-none" />
            </div>
            <Button onClick={saveConsult} disabled={isSavingConsult} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingConsult ? "Menyimpan..." : "Simpan"}
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── CTA Banner ─── */}
        <TabsContent value="cta" className="space-y-5">
          <SectionCard icon={Megaphone} title="CTA Banner Penutup">
            <div className="space-y-1.5">
              <Label>Judul</Label>
              <Input value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Subjudul</Label>
              <Textarea value={ctaSubtitle} onChange={(e) => setCtaSubtitle(e.target.value)} rows={2} className="rounded-xl resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Label Tombol</Label>
              <Input value={ctaButtonLabel} onChange={(e) => setCtaButtonLabel(e.target.value)} className="rounded-xl" />
            </div>
            <Button onClick={saveCta} disabled={isSavingCta} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingCta ? "Menyimpan..." : "Simpan CTA"}
            </Button>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* ─── Dialog tambah/edit paket ─── */}
      <Dialog open={packageForm !== null} onOpenChange={(o) => !o && setPackageForm(null)}>
        <DialogContent className="sm:max-w-md">
          {packageForm && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                {packageForm.id ? "Edit Paket Promo" : "Tambah Paket Promo"}
              </DialogTitle>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="pkg-badge" className="text-sm font-semibold text-gray-700">Badge</Label>
                    <Input
                      id="pkg-badge"
                      className="mt-1.5 rounded-lg"
                      placeholder="mis. Most Popular"
                      value={packageForm.badge}
                      onChange={(e) => setPackageForm({ ...packageForm, badge: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <Switch
                        checked={packageForm.isDark}
                        onCheckedChange={(v) => setPackageForm({ ...packageForm, isDark: v })}
                        className="data-[state=checked]:bg-primary"
                      />
                      Kartu gelap
                    </label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="pkg-title" className="text-sm font-semibold text-gray-700">Judul Paket</Label>
                  <Input
                    id="pkg-title"
                    className="mt-1.5 rounded-lg"
                    placeholder="mis. Paket Pendirian PT Lengkap"
                    value={packageForm.title}
                    onChange={(e) => setPackageForm({ ...packageForm, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="pkg-price" className="text-sm font-semibold text-gray-700">Harga (Rp)</Label>
                    <Input
                      id="pkg-price"
                      type="number"
                      className="mt-1.5 rounded-lg"
                      placeholder="5500000"
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pkg-original-price" className="text-sm font-semibold text-gray-700">Harga Coret (opsional)</Label>
                    <Input
                      id="pkg-original-price"
                      type="number"
                      className="mt-1.5 rounded-lg"
                      placeholder="6500000"
                      value={packageForm.originalPrice}
                      onChange={(e) => setPackageForm({ ...packageForm, originalPrice: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pkg-features" className="text-sm font-semibold text-gray-700">Fitur / Isi Paket (satu per baris)</Label>
                  <Textarea
                    id="pkg-features"
                    rows={5}
                    className="mt-1.5 rounded-lg resize-none"
                    placeholder={"Akta Pendirian\nSK Kemenkumham\nNPWP Badan"}
                    value={packageForm.features}
                    onChange={(e) => setPackageForm({ ...packageForm, features: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Link Tombol &quot;Lihat Detail&quot;</Label>
                  <Select
                    items={{
                      [NO_SERVICE]: "Tanpa link (ke /layanan)",
                      ...Object.fromEntries(services.map((s) => [s.id, s.title])),
                    }}
                    value={packageForm.serviceId}
                    onValueChange={(v) => v && setPackageForm({ ...packageForm, serviceId: v })}
                  >
                    <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} align="start">
                      <SelectItem value={NO_SERVICE}>Tanpa link (ke /layanan)</SelectItem>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setPackageForm(null)}>
                  Batal
                </Button>
                <Button className="flex-1 rounded-lg" onClick={savePackage} disabled={isSavingPackage}>
                  {isSavingPackage ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={bannerForm !== null} onOpenChange={(o) => !o && setBannerForm(null)}>
        <DialogContent className="sm:max-w-md">
          {bannerForm && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                {bannerForm.id ? "Edit Banner Promo" : "Tambah Banner Promo"}
              </DialogTitle>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Gaya Kartu</Label>
                    <Select
                      items={VARIANT_LABELS}
                      value={bannerForm.variant}
                      onValueChange={(v) => v && setBannerForm({ ...bannerForm, variant: v as PromoBannerVariant })}
                    >
                      <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false} align="start">
                        {(Object.keys(VARIANT_LABELS) as PromoBannerVariant[]).map((v) => (
                          <SelectItem key={v} value={v}>{VARIANT_LABELS[v]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <Switch
                        checked={bannerForm.isActive}
                        onCheckedChange={(v) => setBannerForm({ ...bannerForm, isActive: v })}
                        className="data-[state=checked]:bg-primary"
                      />
                      Aktif
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Gambar Banner (opsional)</Label>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="flex h-16 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      {bannerForm.imageUrl ? (
                        <Image src={bannerForm.imageUrl} alt="" width={112} height={64} unoptimized className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlus size={18} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                        <ImagePlus size={14} />
                        {isUploadingBannerImage ? "Mengunggah..." : "Pilih Gambar"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          disabled={isUploadingBannerImage}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadBannerImage(file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      {bannerForm.imageUrl && (
                        <button
                          type="button"
                          onClick={removeBannerImage}
                          disabled={isUploadingBannerImage}
                          className="w-fit text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
                        >
                          Hapus gambar
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    Rekomendasi ukuran 900×600px (rasio 3:2), gambar otomatis di-crop mengisi kartu. Format PNG/JPG/WebP, maks 15MB.
                    Kosongkan untuk pakai kartu warna/gradient bawaan.
                  </p>
                </div>

                <LangSwitcher lang={bannerFormLang} onChange={setBannerFormLang} />

                <div>
                  <Label htmlFor="banner-eyebrow" className="text-sm font-semibold text-gray-700">
                    Eyebrow{bannerFormLang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}
                  </Label>
                  <Input
                    id="banner-eyebrow"
                    className="mt-1.5 rounded-lg"
                    placeholder="mis. DISKON"
                    value={bannerForm.lang[bannerFormLang].eyebrow}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        lang: { ...bannerForm.lang, [bannerFormLang]: { ...bannerForm.lang[bannerFormLang], eyebrow: e.target.value } },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="banner-title" className="text-sm font-semibold text-gray-700">
                    Judul{bannerFormLang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}
                  </Label>
                  <Input
                    id="banner-title"
                    className="mt-1.5 rounded-lg"
                    placeholder="mis. 25%"
                    value={bannerForm.lang[bannerFormLang].title}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        lang: { ...bannerForm.lang, [bannerFormLang]: { ...bannerForm.lang[bannerFormLang], title: e.target.value } },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="banner-description" className="text-sm font-semibold text-gray-700">
                    Deskripsi{bannerFormLang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}
                  </Label>
                  <Textarea
                    id="banner-description"
                    rows={2}
                    className="mt-1.5 rounded-lg resize-none"
                    value={bannerForm.lang[bannerFormLang].description}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        lang: { ...bannerForm.lang, [bannerFormLang]: { ...bannerForm.lang[bannerFormLang], description: e.target.value } },
                      })
                    }
                  />
                </div>
                <div className={cn("grid gap-3", bannerFormLang === "id" ? "grid-cols-2" : "grid-cols-1")}>
                  <div>
                    <Label htmlFor="banner-cta-label" className="text-sm font-semibold text-gray-700">
                      Label Tombol{bannerFormLang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}
                    </Label>
                    <Input
                      id="banner-cta-label"
                      className="mt-1.5 rounded-lg"
                      value={bannerForm.lang[bannerFormLang].ctaLabel}
                      onChange={(e) =>
                        setBannerForm({
                          ...bannerForm,
                          lang: { ...bannerForm.lang, [bannerFormLang]: { ...bannerForm.lang[bannerFormLang], ctaLabel: e.target.value } },
                        })
                      }
                    />
                  </div>
                  {bannerFormLang === "id" && (
                    <div>
                      <Label htmlFor="banner-cta-href" className="text-sm font-semibold text-gray-700">Link Tombol</Label>
                      <Input
                        id="banner-cta-href"
                        className="mt-1.5 rounded-lg"
                        placeholder="/layanan atau https://wa.me/..."
                        value={bannerForm.ctaHref}
                        onChange={(e) => setBannerForm({ ...bannerForm, ctaHref: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setBannerForm(null)}>
                  Batal
                </Button>
                <Button className="flex-1 rounded-lg" onClick={saveBanner} disabled={isSavingBanner}>
                  {isSavingBanner ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
