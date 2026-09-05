"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Save, Plus, Trash2, ExternalLink, ImagePlus, Sparkles, Info,
  Award, ListChecks, Workflow, Wallet, MessagesSquare, HelpCircle, MousePointerClick, Search,
} from "lucide-react";
import type { Service, ServicePackage, Faq, ContentStatus } from "@prisma/client";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableList } from "@/components/admin/SortableList";
import { IconPicker } from "@/components/admin/IconPicker";
import { cn } from "@/lib/utils";
import type { ServiceDetailContent } from "@/lib/types/service-detail-content";
import type { ServiceDetailContentLang } from "@/lib/service-detail-locale";
import {
  updateServiceDetailContentAction,
  updateServiceMetaAction,
  updateServiceFeaturedMediaAction,
  uploadServiceFeaturedImageAction,
  updateServiceAboutMediaAction,
  uploadServiceAboutImageAction,
} from "@/lib/actions/services";
import {
  createServicePackageAction,
  updateServicePackageAction,
  deleteServicePackageAction,
  reorderServicePackagesAction,
} from "@/lib/actions/service-packages";
import {
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
  reorderFaqAction,
} from "@/lib/actions/faq";

/** ServicePackage dengan price/originalPrice udah dikonversi ke number di
 * server (lihat [id]/edit/page.tsx) — Decimal Prisma gak bisa lolos batas
 * Server -> Client Component. */
type SerializedPackage = Omit<ServicePackage, "price" | "originalPrice"> & {
  price: number;
  originalPrice: number | null;
};

type ServiceWithRelations = Omit<Service, "basePrice"> & {
  basePrice: number | null;
  featuredMedia: { id: string; url: string } | null;
  aboutMedia: { id: string; url: string } | null;
  packages: SerializedPackage[];
  faqs: Faq[];
};

const LANGS = [
  { key: "id", label: "Bahasa Indonesia" },
  { key: "en", label: "English" },
  { key: "zh", label: "中文" },
] as const;
type Lang = (typeof LANGS)[number]["key"];

const FALLBACK_CONTENT: ServiceDetailContent = {
  kicker: "Layanan",
  tagline: "",
  heroDescription: "",
  highlights: [],
  stats: [],
  about: { title: "", paragraphs: [], imageLabel: "" },
  process: { title: "", steps: [] },
  testimonialsHelp: { title: "Butuh Bantuan?", description: "" },
  faqsTitle: "Pertanyaan yang Sering Diajukan",
};

/** Bangun state edit EN/ZH — bentuknya SAMA (ServiceDetailContent) kayak
 * base biar semua binding JSX di bawah bisa dipakai bareng utk ketiga
 * bahasa tanpa tipe terpisah; ikon & panjang array selalu ngikut base
 * (di-mirror), teks kosong ("") berarti "belum diterjemahkan" -> fallback
 * ke Bahasa Indonesia lewat pickServiceDetailContent() pas ditampilkan
 * publik. Dipanggil sekali aja pas mount (baca dari kolom
 * detailContentEn/Zh yang deep-partial). */
function initLangEditContent(base: ServiceDetailContent, variant: ServiceDetailContentLang | null | undefined): ServiceDetailContent {
  return {
    kicker: variant?.kicker ?? "",
    tagline: variant?.tagline ?? "",
    heroDescription: variant?.heroDescription ?? "",
    highlights: base.highlights.map((h, i) => ({ icon: h.icon, label: variant?.highlights?.[i]?.label ?? "" })),
    stats: base.stats.map((s, i) => ({
      icon: s.icon,
      value: variant?.stats?.[i]?.value ?? "",
      label: variant?.stats?.[i]?.label ?? "",
      withStars: s.withStars,
    })),
    about: {
      title: variant?.about?.title ?? "",
      paragraphs: base.about.paragraphs.map((_, i) => variant?.about?.paragraphs?.[i] ?? ""),
      checklist: base.about.checklist ? base.about.checklist.map((_, i) => variant?.about?.checklist?.[i] ?? "") : undefined,
      imageLabel: variant?.about?.imageLabel ?? "",
      badge: variant?.about?.badge ?? "",
    },
    benefits: base.benefits
      ? {
          title: variant?.benefits?.title ?? "",
          items: base.benefits.items.map((b, i) => ({
            icon: b.icon,
            title: variant?.benefits?.items?.[i]?.title ?? "",
            description: variant?.benefits?.items?.[i]?.description ?? "",
          })),
        }
      : undefined,
    types: base.types
      ? {
          title: variant?.types?.title ?? "",
          items: base.types.items.map((_, i) => ({
            title: variant?.types?.items?.[i]?.title ?? "",
            description: variant?.types?.items?.[i]?.description ?? "",
          })),
          linkLabel: variant?.types?.linkLabel ?? "",
          linkHref: base.types.linkHref,
        }
      : undefined,
    process: {
      title: variant?.process?.title ?? "",
      steps: base.process.steps.map((s, i) => ({
        icon: s.icon,
        title: variant?.process?.steps?.[i]?.title ?? "",
        description: variant?.process?.steps?.[i]?.description ?? "",
      })),
    },
    packagesTitle: variant?.packagesTitle ?? "",
    documents: base.documents
      ? { title: variant?.documents?.title ?? "", items: base.documents.items.map((_, i) => variant?.documents?.items?.[i] ?? "") }
      : undefined,
    duration: base.duration ? { value: variant?.duration?.value ?? "", note: variant?.duration?.note ?? "" } : undefined,
    testimonialsHelp: {
      title: variant?.testimonialsHelp?.title ?? "",
      description: variant?.testimonialsHelp?.description ?? "",
    },
    faqsTitle: variant?.faqsTitle ?? "",
    cta: base.cta ? { title: variant?.cta?.title ?? "", subtitle: variant?.cta?.subtitle ?? "" } : undefined,
  };
}

function pkgName(pkg: SerializedPackage, lang: Lang): string {
  if (lang === "id") return pkg.name;
  return (lang === "en" ? pkg.nameEn : pkg.nameZh) ?? "";
}
function pkgFeaturesText(pkg: SerializedPackage, lang: Lang): string {
  const raw = lang === "id" ? pkg.features : lang === "en" ? pkg.featuresEn : pkg.featuresZh;
  return ((raw as string[] | null) ?? []).join("\n");
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

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-admin-line p-4">
      <p className="text-xs text-gray-400 mb-2">
        Semua tab di bawah (Hero s/d SEO) tampil sesuai bahasa yang dipilih di sini. English/中文 boleh
        dikosongkan per-field — otomatis fallback ke Bahasa Indonesia di halaman publik.
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

export default function LayananDetailEditor({
  service,
  panel,
}: {
  service: ServiceWithRelations;
  panel: string;
}) {
  const router = useRouter();
  const [isSavingContent, startSaveContent] = useTransition();
  const [isSavingMeta, startSaveMeta] = useTransition();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingAboutImage, setIsUploadingAboutImage] = useState(false);
  const [lang, setLang] = useState<Lang>("id");

  const initialContentId = (service.detailContent as ServiceDetailContent | null) ?? FALLBACK_CONTENT;
  const [content, setContent] = useState<Record<Lang, ServiceDetailContent>>({
    id: initialContentId,
    en: initLangEditContent(initialContentId, service.detailContentEn as ServiceDetailContentLang | null),
    zh: initLangEditContent(initialContentId, service.detailContentZh as ServiceDetailContentLang | null),
  });
  const current = content[lang];
  const setCurrent = (patch: Partial<ServiceDetailContent>) =>
    setContent((prev) => ({ ...prev, [lang]: { ...prev[lang], ...patch } }));

  const [useChecklist, setUseChecklist] = useState(Boolean(initialContentId.about.checklist));
  const [benefitsEnabled, setBenefitsEnabled] = useState(Boolean(initialContentId.benefits));
  const [typesEnabled, setTypesEnabled] = useState(Boolean(initialContentId.types));
  const [ctaOverrideEnabled, setCtaOverrideEnabled] = useState(Boolean(initialContentId.cta));

  const [imageUrl, setImageUrl] = useState(service.featuredMedia?.url ?? null);
  const [aboutImageUrl, setAboutImageUrl] = useState(service.aboutMedia?.url ?? null);

  const [seo, setSeo] = useState<Record<Lang, { metaTitle: string; metaDescription: string }>>({
    id: { metaTitle: service.metaTitle ?? "", metaDescription: service.metaDescription ?? "" },
    en: { metaTitle: service.metaTitleEn ?? "", metaDescription: service.metaDescriptionEn ?? "" },
    zh: { metaTitle: service.metaTitleZh ?? "", metaDescription: service.metaDescriptionZh ?? "" },
  });
  const [status, setStatus] = useState<ContentStatus>(service.status);

  const [packages, setPackages] = useState(service.packages);
  const [faqs, setFaqs] = useState(service.faqs);
  const [isPackageBusy, startPackageTransition] = useTransition();
  const [isFaqBusy, startFaqTransition] = useTransition();

  const previewHref = `/layanan/${service.slug}`;

  /* Upload lalu langsung tautkan ke Service.featuredMediaId (bukan disimpan
   * belakangan) — matching pola auto-save gambar di Hero Beranda/Branding,
   * biar gak ada state "gambar keupload tapi belum ke-link" yg gampang
   * kelupaan. */
  const uploadImage = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const uploadRes = await uploadServiceFeaturedImageAction(fd);
      if (!uploadRes.ok) {
        swalError(uploadRes.message);
        return;
      }
      const linkRes = await updateServiceFeaturedMediaAction(service.id, uploadRes.mediaId);
      if (linkRes.ok) {
        setImageUrl(uploadRes.url);
        swalSuccess("Gambar titel berhasil disimpan");
        router.refresh();
      } else {
        swalError(linkRes.message);
      }
    } catch {
      swalError("Gagal mengunggah gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = async () => {
    setIsUploadingImage(true);
    try {
      const res = await updateServiceFeaturedMediaAction(service.id, null);
      if (res.ok) {
        setImageUrl(null);
        swalSuccess("Gambar titel dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal menghapus gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  /* Gambar khusus section Tentang — independen dari gambar Hero di atas.
   * Kalau gak diisi, section Tentang otomatis pakai gambar Hero (lihat
   * hydrateLayananDetail di src/lib/hydrate-layanan-detail.ts). */
  const uploadAboutImage = async (file: File) => {
    setIsUploadingAboutImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const uploadRes = await uploadServiceAboutImageAction(fd);
      if (!uploadRes.ok) {
        swalError(uploadRes.message);
        return;
      }
      const linkRes = await updateServiceAboutMediaAction(service.id, uploadRes.mediaId);
      if (linkRes.ok) {
        setAboutImageUrl(uploadRes.url);
        swalSuccess("Gambar Tentang berhasil disimpan");
        router.refresh();
      } else {
        swalError(linkRes.message);
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
      const res = await updateServiceAboutMediaAction(service.id, null);
      if (res.ok) {
        setAboutImageUrl(null);
        swalSuccess("Gambar Tentang dihapus, kembali memakai gambar Hero");
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

  const saveContent = () => {
    startSaveContent(async () => {
      try {
        const buildLang = (c: ServiceDetailContent, isBase: boolean): ServiceDetailContent => ({
          ...c,
          about: useChecklist
            ? { ...c.about, checklist: c.about.checklist ?? [] }
            : { ...c.about, checklist: undefined, badge: isBase ? c.about.badge || undefined : c.about.badge },
          benefits: benefitsEnabled ? c.benefits ?? { title: "", items: [] } : undefined,
          types: typesEnabled
            ? c.types ?? { title: "", items: [], linkLabel: "Lihat Semua Layanan", linkHref: "/layanan" }
            : undefined,
          cta: ctaOverrideEnabled ? c.cta ?? { title: "", subtitle: "" } : undefined,
        });
        const res = await updateServiceDetailContentAction(service.id, {
          id: buildLang(content.id, true),
          en: buildLang(content.en, false),
          zh: buildLang(content.zh, false),
        });
        if (res.ok) {
          swalSuccess("Konten detail layanan berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan konten. Cek koneksi lalu coba lagi.");
      }
    });
  };

  const saveMeta = () => {
    startSaveMeta(async () => {
      try {
        const res = await updateServiceMetaAction(service.id, { status, id: seo.id, en: seo.en, zh: seo.zh });
        if (res.ok) {
          swalSuccess("SEO & status layanan berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  // ─── Paket harga (relasional — simpan langsung per aksi) ───
  const addPackage = () => {
    startPackageTransition(async () => {
      try {
        const res = await createServicePackageAction(service.id, {
          price: 0,
          originalPrice: null,
          isPopular: false,
          estimatedDurationLabel: null,
          isActive: true,
          id: { name: "Paket Baru", features: [] },
          en: { name: "", features: [] },
          zh: { name: "", features: [] },
        });
        if (res.ok) {
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menambahkan paket.");
      }
    });
  };

  const savePackage = (pkg: SerializedPackage) => {
    startPackageTransition(async () => {
      try {
        const res = await updateServicePackageAction(pkg.id, {
          price: Number(pkg.price),
          originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : null,
          isPopular: pkg.isPopular,
          estimatedDurationLabel: pkg.estimatedDurationLabel,
          isActive: pkg.isActive,
          id: { name: pkg.name, features: pkg.features as string[] },
          en: { name: pkg.nameEn ?? "", features: (pkg.featuresEn as string[] | null) ?? [] },
          zh: { name: pkg.nameZh ?? "", features: (pkg.featuresZh as string[] | null) ?? [] },
        });
        if (res.ok) {
          swalSuccess("Paket disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan paket.");
      }
    });
  };

  const removePackage = async (pkg: SerializedPackage) => {
    const confirmed = await swalConfirmDelete(`Paket "${pkg.name}"`);
    if (!confirmed) return;
    startPackageTransition(async () => {
      try {
        const res = await deleteServicePackageAction(pkg.id);
        if (res.ok) {
          setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
          swalSuccess("Paket dihapus");
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menghapus paket.");
      }
    });
  };

  const reorderPackages = (next: SerializedPackage[]) => {
    setPackages(next);
    startPackageTransition(async () => {
      try {
        const res = await reorderServicePackagesAction(service.id, next.map((p) => p.id));
        if (!res.ok) {
          swalError(res.message);
          setPackages(service.packages);
        }
      } catch {
        swalError("Gagal mengubah urutan paket.");
        setPackages(service.packages);
      }
    });
  };

  // ─── FAQ khusus layanan ini (relasional) ───
  const addFaq = () => {
    startFaqTransition(async () => {
      try {
        const res = await createFaqAction({
          question: "Pertanyaan baru",
          answer: "Jawaban...",
          scope: "SERVICE",
          serviceId: service.id,
        });
        if (res.ok) {
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menambahkan FAQ.");
      }
    });
  };

  const saveFaq = (faq: Faq) => {
    startFaqTransition(async () => {
      try {
        const res = await updateFaqAction(faq.id, {
          question: faq.question,
          answer: faq.answer,
          scope: "SERVICE",
          serviceId: service.id,
        });
        if (res.ok) {
          swalSuccess("FAQ disimpan");
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan FAQ.");
      }
    });
  };

  const removeFaq = async (faq: Faq) => {
    const confirmed = await swalConfirmDelete("FAQ ini");
    if (!confirmed) return;
    startFaqTransition(async () => {
      try {
        const res = await deleteFaqAction(faq.id);
        if (res.ok) {
          setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
          swalSuccess("FAQ dihapus");
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menghapus FAQ.");
      }
    });
  };

  const reorderFaqs = (next: Faq[]) => {
    setFaqs(next);
    startFaqTransition(async () => {
      try {
        const res = await reorderFaqAction(next.map((f) => f.id));
        if (!res.ok) {
          swalError(res.message);
          setFaqs(service.faqs);
        }
      } catch {
        swalError("Gagal mengubah urutan FAQ.");
        setFaqs(service.faqs);
      }
    });
  };

  // ─── Helper array-lang-synced: highlights/stats/benefits/types/process
  // ikon & panjang array ikut ketiga bahasa (add/remove/reorder/ganti ikon
  // sinkron ke id+en+zh sekaligus); teks (label/title/description) cuma
  // nulis ke bahasa yang lagi aktif. ───
  const addHighlight = () => {
    setContent((prev) => ({
      id: { ...prev.id, highlights: [...prev.id.highlights, { icon: "zap", label: "" }] },
      en: { ...prev.en, highlights: [...prev.en.highlights, { icon: "zap", label: "" }] },
      zh: { ...prev.zh, highlights: [...prev.zh.highlights, { icon: "zap", label: "" }] },
    }));
  };
  const removeHighlight = (index: number) => {
    setContent((prev) => ({
      id: { ...prev.id, highlights: prev.id.highlights.filter((_, i) => i !== index) },
      en: { ...prev.en, highlights: prev.en.highlights.filter((_, i) => i !== index) },
      zh: { ...prev.zh, highlights: prev.zh.highlights.filter((_, i) => i !== index) },
    }));
  };
  const setHighlightIcon = (index: number, icon: string) => {
    setContent((prev) => ({
      id: { ...prev.id, highlights: prev.id.highlights.map((h, i) => (i === index ? { ...h, icon } : h)) },
      en: { ...prev.en, highlights: prev.en.highlights.map((h, i) => (i === index ? { ...h, icon } : h)) },
      zh: { ...prev.zh, highlights: prev.zh.highlights.map((h, i) => (i === index ? { ...h, icon } : h)) },
    }));
  };
  const setHighlightLabel = (index: number, label: string) =>
    setCurrent({ highlights: current.highlights.map((h, i) => (i === index ? { ...h, label } : h)) });
  const reorderHighlights = (nextIds: { icon: string; index: number; _key: string }[]) => {
    const order = nextIds.map((x) => x.index);
    setContent((prev) => ({
      id: { ...prev.id, highlights: order.map((i) => prev.id.highlights[i]) },
      en: { ...prev.en, highlights: order.map((i) => prev.en.highlights[i]) },
      zh: { ...prev.zh, highlights: order.map((i) => prev.zh.highlights[i]) },
    }));
  };

  const addStat = () => {
    setContent((prev) => ({
      id: { ...prev.id, stats: [...prev.id.stats, { icon: "star", value: "", label: "" }] },
      en: { ...prev.en, stats: [...prev.en.stats, { icon: "star", value: "", label: "" }] },
      zh: { ...prev.zh, stats: [...prev.zh.stats, { icon: "star", value: "", label: "" }] },
    }));
  };
  const removeStat = (index: number) => {
    setContent((prev) => ({
      id: { ...prev.id, stats: prev.id.stats.filter((_, i) => i !== index) },
      en: { ...prev.en, stats: prev.en.stats.filter((_, i) => i !== index) },
      zh: { ...prev.zh, stats: prev.zh.stats.filter((_, i) => i !== index) },
    }));
  };
  const setStatIcon = (index: number, icon: string) => {
    setContent((prev) => ({
      id: { ...prev.id, stats: prev.id.stats.map((s, i) => (i === index ? { ...s, icon } : s)) },
      en: { ...prev.en, stats: prev.en.stats.map((s, i) => (i === index ? { ...s, icon } : s)) },
      zh: { ...prev.zh, stats: prev.zh.stats.map((s, i) => (i === index ? { ...s, icon } : s)) },
    }));
  };
  const setStatWithStars = (index: number, withStars: boolean) => {
    setContent((prev) => ({
      id: { ...prev.id, stats: prev.id.stats.map((s, i) => (i === index ? { ...s, withStars } : s)) },
      en: { ...prev.en, stats: prev.en.stats.map((s, i) => (i === index ? { ...s, withStars } : s)) },
      zh: { ...prev.zh, stats: prev.zh.stats.map((s, i) => (i === index ? { ...s, withStars } : s)) },
    }));
  };
  const setStatField = (index: number, field: "value" | "label", value: string) =>
    setCurrent({ stats: current.stats.map((s, i) => (i === index ? { ...s, [field]: value } : s)) });
  const reorderStats = (nextIds: { icon: string; index: number; _key: string }[]) => {
    const order = nextIds.map((x) => x.index);
    setContent((prev) => ({
      id: { ...prev.id, stats: order.map((i) => prev.id.stats[i]) },
      en: { ...prev.en, stats: order.map((i) => prev.en.stats[i]) },
      zh: { ...prev.zh, stats: order.map((i) => prev.zh.stats[i]) },
    }));
  };

  const addBenefit = () => {
    setContent((prev) => ({
      id: { ...prev.id, benefits: { title: prev.id.benefits?.title ?? "", items: [...(prev.id.benefits?.items ?? []), { icon: "shield-check", title: "", description: "" }] } },
      en: { ...prev.en, benefits: { title: prev.en.benefits?.title ?? "", items: [...(prev.en.benefits?.items ?? []), { icon: "shield-check", title: "", description: "" }] } },
      zh: { ...prev.zh, benefits: { title: prev.zh.benefits?.title ?? "", items: [...(prev.zh.benefits?.items ?? []), { icon: "shield-check", title: "", description: "" }] } },
    }));
  };
  const removeBenefit = (index: number) => {
    setContent((prev) => ({
      id: { ...prev.id, benefits: { title: prev.id.benefits?.title ?? "", items: (prev.id.benefits?.items ?? []).filter((_, i) => i !== index) } },
      en: { ...prev.en, benefits: { title: prev.en.benefits?.title ?? "", items: (prev.en.benefits?.items ?? []).filter((_, i) => i !== index) } },
      zh: { ...prev.zh, benefits: { title: prev.zh.benefits?.title ?? "", items: (prev.zh.benefits?.items ?? []).filter((_, i) => i !== index) } },
    }));
  };
  const setBenefitIcon = (index: number, icon: string) => {
    setContent((prev) => ({
      id: { ...prev.id, benefits: { title: prev.id.benefits?.title ?? "", items: (prev.id.benefits?.items ?? []).map((b, i) => (i === index ? { ...b, icon } : b)) } },
      en: { ...prev.en, benefits: { title: prev.en.benefits?.title ?? "", items: (prev.en.benefits?.items ?? []).map((b, i) => (i === index ? { ...b, icon } : b)) } },
      zh: { ...prev.zh, benefits: { title: prev.zh.benefits?.title ?? "", items: (prev.zh.benefits?.items ?? []).map((b, i) => (i === index ? { ...b, icon } : b)) } },
    }));
  };
  const setBenefitTitle = (title: string) => setCurrent({ benefits: { title, items: current.benefits?.items ?? [] } });
  const setBenefitField = (index: number, field: "title" | "description", value: string) =>
    setCurrent({
      benefits: { title: current.benefits?.title ?? "", items: (current.benefits?.items ?? []).map((b, i) => (i === index ? { ...b, [field]: value } : b)) },
    });
  const reorderBenefits = (nextIds: { icon: string; index: number; _key: string }[]) => {
    const order = nextIds.map((x) => x.index);
    setContent((prev) => ({
      id: { ...prev.id, benefits: { title: prev.id.benefits?.title ?? "", items: order.map((i) => prev.id.benefits!.items[i]) } },
      en: { ...prev.en, benefits: { title: prev.en.benefits?.title ?? "", items: order.map((i) => prev.en.benefits!.items[i]) } },
      zh: { ...prev.zh, benefits: { title: prev.zh.benefits?.title ?? "", items: order.map((i) => prev.zh.benefits!.items[i]) } },
    }));
  };

  const addType = () => {
    setContent((prev) => ({
      id: { ...prev.id, types: { title: prev.id.types?.title ?? "", items: [...(prev.id.types?.items ?? []), { title: "", description: "" }], linkLabel: prev.id.types?.linkLabel ?? "Lihat Semua Layanan", linkHref: prev.id.types?.linkHref ?? "/layanan" } },
      en: { ...prev.en, types: { title: prev.en.types?.title ?? "", items: [...(prev.en.types?.items ?? []), { title: "", description: "" }], linkLabel: prev.en.types?.linkLabel ?? "", linkHref: prev.en.types?.linkHref ?? "" } },
      zh: { ...prev.zh, types: { title: prev.zh.types?.title ?? "", items: [...(prev.zh.types?.items ?? []), { title: "", description: "" }], linkLabel: prev.zh.types?.linkLabel ?? "", linkHref: prev.zh.types?.linkHref ?? "" } },
    }));
  };
  const removeType = (index: number) => {
    setContent((prev) => ({
      id: { ...prev.id, types: { ...prev.id.types!, items: prev.id.types!.items.filter((_, i) => i !== index) } },
      en: { ...prev.en, types: { ...prev.en.types!, items: prev.en.types!.items.filter((_, i) => i !== index) } },
      zh: { ...prev.zh, types: { ...prev.zh.types!, items: prev.zh.types!.items.filter((_, i) => i !== index) } },
    }));
  };
  const setTypeField = (index: number, field: "title" | "description", value: string) =>
    setCurrent({ types: { ...current.types!, items: current.types!.items.map((t, i) => (i === index ? { ...t, [field]: value } : t)) } });
  const reorderTypes = (nextIds: { index: number; _key: string }[]) => {
    const order = nextIds.map((x) => x.index);
    setContent((prev) => ({
      id: { ...prev.id, types: { ...prev.id.types!, items: order.map((i) => prev.id.types!.items[i]) } },
      en: { ...prev.en, types: { ...prev.en.types!, items: order.map((i) => prev.en.types!.items[i]) } },
      zh: { ...prev.zh, types: { ...prev.zh.types!, items: order.map((i) => prev.zh.types!.items[i]) } },
    }));
  };

  const addProcessStep = () => {
    setContent((prev) => ({
      id: { ...prev.id, process: { ...prev.id.process, steps: [...prev.id.process.steps, { icon: "messages-square", title: "", description: "" }] } },
      en: { ...prev.en, process: { ...prev.en.process, steps: [...prev.en.process.steps, { icon: "messages-square", title: "", description: "" }] } },
      zh: { ...prev.zh, process: { ...prev.zh.process, steps: [...prev.zh.process.steps, { icon: "messages-square", title: "", description: "" }] } },
    }));
  };
  const removeProcessStep = (index: number) => {
    setContent((prev) => ({
      id: { ...prev.id, process: { ...prev.id.process, steps: prev.id.process.steps.filter((_, i) => i !== index) } },
      en: { ...prev.en, process: { ...prev.en.process, steps: prev.en.process.steps.filter((_, i) => i !== index) } },
      zh: { ...prev.zh, process: { ...prev.zh.process, steps: prev.zh.process.steps.filter((_, i) => i !== index) } },
    }));
  };
  const setProcessStepIcon = (index: number, icon: string) => {
    setContent((prev) => ({
      id: { ...prev.id, process: { ...prev.id.process, steps: prev.id.process.steps.map((s, i) => (i === index ? { ...s, icon } : s)) } },
      en: { ...prev.en, process: { ...prev.en.process, steps: prev.en.process.steps.map((s, i) => (i === index ? { ...s, icon } : s)) } },
      zh: { ...prev.zh, process: { ...prev.zh.process, steps: prev.zh.process.steps.map((s, i) => (i === index ? { ...s, icon } : s)) } },
    }));
  };
  const setProcessStepField = (index: number, field: "title" | "description", value: string) =>
    setCurrent({ process: { ...current.process, steps: current.process.steps.map((s, i) => (i === index ? { ...s, [field]: value } : s)) } });
  const reorderProcessSteps = (nextIds: { icon: string; index: number; _key: string }[]) => {
    const order = nextIds.map((x) => x.index);
    setContent((prev) => ({
      id: { ...prev.id, process: { ...prev.id.process, steps: order.map((i) => prev.id.process.steps[i]) } },
      en: { ...prev.en, process: { ...prev.en.process, steps: order.map((i) => prev.en.process.steps[i]) } },
      zh: { ...prev.zh, process: { ...prev.zh.process, steps: order.map((i) => prev.zh.process.steps[i]) } },
    }));
  };

  const highlightsList = useMemo(
    () => content.id.highlights.map((h, i) => ({ icon: h.icon, index: i, _key: `h-${i}` })),
    [content.id.highlights],
  );
  const statsList = useMemo(
    () => content.id.stats.map((s, i) => ({ icon: s.icon, index: i, _key: `s-${i}` })),
    [content.id.stats],
  );
  const benefitItems = useMemo(
    () => (content.id.benefits?.items ?? []).map((b, i) => ({ icon: b.icon, index: i, _key: `b-${i}` })),
    [content.id.benefits],
  );
  const typeItems = useMemo(
    () => (content.id.types?.items ?? []).map((_, i) => ({ index: i, _key: `t-${i}` })),
    [content.id.types],
  );
  const processSteps = useMemo(
    () => content.id.process.steps.map((s, i) => ({ icon: s.icon, index: i, _key: `p-${i}` })),
    [content.id.process.steps],
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/${panel}/layanan`)}
            className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label="Kembali ke daftar layanan"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="font-bold text-gray-900">Kelola Konten Detail — {service.title}</h2>
            <p className="text-xs text-gray-400">/layanan/{service.slug}</p>
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
        <TabsList className="rounded-xl mb-2 bg-gray-200">
          <TabsTrigger value="hero" className="rounded-lg">Hero</TabsTrigger>
          <TabsTrigger value="about" className="rounded-lg">Tentang</TabsTrigger>
          <TabsTrigger value="benefits" className="rounded-lg">Manfaat</TabsTrigger>
          <TabsTrigger value="types" className="rounded-lg">Jenis</TabsTrigger>
          <TabsTrigger value="process" className="rounded-lg">Proses</TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-lg">Paket & Dokumen</TabsTrigger>
          <TabsTrigger value="testimonials" className="rounded-lg">Testimoni</TabsTrigger>
          <TabsTrigger value="faq" className="rounded-lg">FAQ</TabsTrigger>
          <TabsTrigger value="cta" className="rounded-lg">CTA</TabsTrigger>
          <TabsTrigger value="seo" className="rounded-lg">SEO & Status</TabsTrigger>
        </TabsList>

        {/* ─── Hero ─── */}
        <TabsContent value="hero" className="space-y-5">
          <SectionCard icon={Sparkles} title="Gambar Hero" description="Tampil di Hero & bagian Tentang. Kosongkan untuk pakai kartu gradient bawaan.">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {imageUrl ? (
                  <Image src={imageUrl} alt="" width={112} height={80} unoptimized className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus size={20} className="text-gray-300" />
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <ImagePlus size={15} />
                {isUploadingImage ? "Mengunggah..." : "Pilih Gambar"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={isUploadingImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {imageUrl && (
                <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg text-red-500 hover:bg-red-50" onClick={removeImage} disabled={isUploadingImage}>
                  <Trash2 size={13} /> Hapus
                </Button>
              )}
            </div>
          </SectionCard>

          <SectionCard icon={Sparkles} title="Judul & Highlight">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Kicker (label kecil di atas judul)<OptionalHint lang={lang} /></Label>
                <Input value={current.kicker} onChange={(e) => setCurrent({ kicker: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Tagline (baris hijau di bawah judul)<OptionalHint lang={lang} /></Label>
                <Input value={current.tagline} onChange={(e) => setCurrent({ tagline: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi Hero<OptionalHint lang={lang} /></Label>
              <Textarea
                value={current.heroDescription}
                onChange={(e) => setCurrent({ heroDescription: e.target.value })}
                rows={2}
                className="rounded-xl resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Highlight (badge kecil di Hero)</Label>
              <SortableList
                id="highlights-list"
                items={highlightsList}
                getId={(h) => h._key}
                onReorder={reorderHighlights}
                renderItem={(h, i) => (
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 p-2.5">
                    <div className="w-16 flex-shrink-0 sm:w-40">
                      <IconPicker value={h.icon} onChange={(icon) => setHighlightIcon(i, icon)} />
                    </div>
                    <Input
                      value={current.highlights[i]?.label ?? ""}
                      onChange={(e) => setHighlightLabel(i, e.target.value)}
                      className="min-w-[140px] flex-1 rounded-lg"
                      placeholder="Label"
                    />
                    <button type="button" onClick={() => removeHighlight(i)} className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500" aria-label="Hapus highlight">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              />
              <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={addHighlight}>
                <Plus size={14} /> Tambah Highlight
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Kartu Statistik (melayang di gambar Hero)</Label>
              <SortableList
                id="stats-list"
                items={statsList}
                getId={(s) => s._key}
                onReorder={reorderStats}
                renderItem={(s, i) => (
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 p-2.5">
                    <div className="w-24 flex-shrink-0 sm:w-36">
                      <IconPicker value={s.icon} onChange={(icon) => setStatIcon(i, icon)} />
                    </div>
                    <Input
                      value={current.stats[i]?.value ?? ""}
                      onChange={(e) => setStatField(i, "value", e.target.value)}
                      className="w-20 flex-shrink-0 rounded-lg"
                      placeholder="5.000+"
                    />
                    <Input
                      value={current.stats[i]?.label ?? ""}
                      onChange={(e) => setStatField(i, "label", e.target.value)}
                      className="min-w-[110px] flex-1 rounded-lg"
                      placeholder="Label"
                    />
                    <label className="flex flex-shrink-0 items-center gap-1.5 text-xs text-gray-500">
                      <Switch
                        checked={Boolean(content.id.stats[i]?.withStars)}
                        onCheckedChange={(v) => setStatWithStars(i, v)}
                        className="data-[state=checked]:bg-primary"
                      />
                      Bintang
                    </label>
                    <button type="button" onClick={() => removeStat(i)} className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500" aria-label="Hapus statistik">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              />
              <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={addStat}>
                <Plus size={14} /> Tambah Statistik
              </Button>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ─── Tentang ─── */}
        <TabsContent value="about" className="space-y-5">
          <SectionCard icon={Info} title="Gambar Tentang" description="Khusus section ini, independen dari Gambar Hero. Kosongkan untuk otomatis memakai Gambar Hero.">
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

          <SectionCard icon={Info} title="Bagian &quot;Apa itu...&quot;">
            <div className="space-y-1.5">
              <Label>Judul<OptionalHint lang={lang} /></Label>
              <Input value={current.about.title} onChange={(e) => setCurrent({ about: { ...current.about, title: e.target.value } })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Paragraf (satu per baris)<OptionalHint lang={lang} /></Label>
              <Textarea
                value={current.about.paragraphs.join("\n")}
                onChange={(e) => setCurrent({ about: { ...current.about, paragraphs: e.target.value.split("\n") } })}
                rows={4}
                className="rounded-xl resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Label Gambar (alt text)<OptionalHint lang={lang} /></Label>
              <Input value={current.about.imageLabel} onChange={(e) => setCurrent({ about: { ...current.about, imageLabel: e.target.value } })} className="rounded-xl" />
            </div>

            {lang === "id" && (
              <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-3">
                <Switch checked={useChecklist} onCheckedChange={setUseChecklist} className="data-[state=checked]:bg-primary" />
                <span className="text-sm text-gray-700">
                  Pakai varian checklist (kalau nonaktif, tampil varian gambar penuh + badge)
                </span>
              </div>
            )}

            {useChecklist ? (
              <div className="space-y-1.5">
                <Label>Checklist (satu per baris)<OptionalHint lang={lang} /></Label>
                <Textarea
                  value={(current.about.checklist ?? []).join("\n")}
                  onChange={(e) => setCurrent({ about: { ...current.about, checklist: e.target.value.split("\n") } })}
                  rows={4}
                  className="rounded-xl resize-none"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Badge Lingkaran (opsional)</Label>
                <Input
                  value={current.about.badge ?? ""}
                  onChange={(e) => setCurrent({ about: { ...current.about, badge: e.target.value } })}
                  className="rounded-xl"
                  placeholder="mis. Legal & Terpercaya"
                />
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* ─── Manfaat ─── */}
        <TabsContent value="benefits" className="space-y-5">
          <SectionCard icon={Award} title="Keuntungan / Manfaat" description="Section opsional — nonaktifkan kalau layanan ini gak butuh grid manfaat.">
            {lang === "id" && (
              <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-3">
                <Switch checked={benefitsEnabled} onCheckedChange={setBenefitsEnabled} className="data-[state=checked]:bg-primary" />
                <span className="text-sm text-gray-700">Tampilkan section Manfaat</span>
              </div>
            )}
            {benefitsEnabled && (
              <>
                <div className="space-y-1.5">
                  <Label>Judul Section<OptionalHint lang={lang} /></Label>
                  <Input value={current.benefits?.title ?? ""} onChange={(e) => setBenefitTitle(e.target.value)} className="rounded-xl" />
                </div>
                <SortableList
                  id="benefits-list"
                  items={benefitItems}
                  getId={(b) => b._key}
                  onReorder={reorderBenefits}
                  renderItem={(b, i) => (
                    <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 flex-shrink-0 sm:w-40">
                          <IconPicker value={b.icon} onChange={(icon) => setBenefitIcon(i, icon)} />
                        </div>
                        <Input
                          value={current.benefits?.items?.[i]?.title ?? ""}
                          onChange={(e) => setBenefitField(i, "title", e.target.value)}
                          className="flex-1 rounded-lg"
                          placeholder="Judul"
                        />
                        <button type="button" onClick={() => removeBenefit(i)} className="p-1.5 text-gray-400 hover:text-red-500" aria-label="Hapus manfaat">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <Textarea
                        value={current.benefits?.items?.[i]?.description ?? ""}
                        onChange={(e) => setBenefitField(i, "description", e.target.value)}
                        rows={2}
                        className="rounded-lg resize-none"
                        placeholder="Deskripsi"
                      />
                    </div>
                  )}
                />
                <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={addBenefit}>
                  <Plus size={14} /> Tambah Manfaat
                </Button>
              </>
            )}
          </SectionCard>
        </TabsContent>

        {/* ─── Jenis Layanan ─── */}
        <TabsContent value="types" className="space-y-5">
          <SectionCard icon={ListChecks} title="Jenis Layanan yang Ditangani" description="Section opsional (mis. dipakai Izin Usaha). Ikon kartu otomatis, gak bisa dikustom per item.">
            {lang === "id" && (
              <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-3">
                <Switch checked={typesEnabled} onCheckedChange={setTypesEnabled} className="data-[state=checked]:bg-primary" />
                <span className="text-sm text-gray-700">Tampilkan section Jenis Layanan</span>
              </div>
            )}
            {typesEnabled && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Judul Section<OptionalHint lang={lang} /></Label>
                    <Input
                      value={current.types?.title ?? ""}
                      onChange={(e) =>
                        setCurrent({
                          types: {
                            title: e.target.value,
                            items: current.types?.items ?? [],
                            linkLabel: current.types?.linkLabel ?? "",
                            linkHref: current.types?.linkHref ?? "",
                          },
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Label Link<OptionalHint lang={lang} /></Label>
                    <Input
                      value={current.types?.linkLabel ?? ""}
                      onChange={(e) =>
                        setCurrent({
                          types: {
                            title: current.types?.title ?? "",
                            items: current.types?.items ?? [],
                            linkLabel: e.target.value,
                            linkHref: current.types?.linkHref ?? "",
                          },
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                </div>
                {lang === "id" && (
                  <div className="space-y-1.5">
                    <Label>Link Href</Label>
                    <Input
                      value={current.types?.linkHref ?? ""}
                      onChange={(e) =>
                        setCurrent({
                          types: {
                            title: current.types?.title ?? "",
                            items: current.types?.items ?? [],
                            linkLabel: current.types?.linkLabel ?? "",
                            linkHref: e.target.value,
                          },
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                )}
                <SortableList
                  id="types-list"
                  items={typeItems}
                  getId={(t) => t._key}
                  onReorder={reorderTypes}
                  renderItem={(t, i) => (
                    <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={current.types?.items?.[i]?.title ?? ""}
                          onChange={(e) => setTypeField(i, "title", e.target.value)}
                          className="flex-1 rounded-lg"
                          placeholder="Judul"
                        />
                        <button type="button" onClick={() => removeType(i)} className="p-1.5 text-gray-400 hover:text-red-500" aria-label="Hapus jenis">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <Textarea
                        value={current.types?.items?.[i]?.description ?? ""}
                        onChange={(e) => setTypeField(i, "description", e.target.value)}
                        rows={2}
                        className="rounded-lg resize-none"
                        placeholder="Deskripsi"
                      />
                    </div>
                  )}
                />
                <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={addType}>
                  <Plus size={14} /> Tambah Jenis
                </Button>
              </>
            )}
          </SectionCard>
        </TabsContent>

        {/* ─── Proses ─── */}
        <TabsContent value="process" className="space-y-5">
          <SectionCard icon={Workflow} title="Alur Proses">
            <div className="space-y-1.5">
              <Label>Judul Section<OptionalHint lang={lang} /></Label>
              <Input value={current.process.title} onChange={(e) => setCurrent({ process: { ...current.process, title: e.target.value } })} className="rounded-xl" />
            </div>
            <SortableList
              id="process-steps-list"
              items={processSteps}
              getId={(s) => s._key}
              onReorder={reorderProcessSteps}
              renderItem={(s, i) => (
                <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 flex-shrink-0 sm:w-40">
                      <IconPicker value={s.icon} onChange={(icon) => setProcessStepIcon(i, icon)} />
                    </div>
                    <Input
                      value={current.process.steps[i]?.title ?? ""}
                      onChange={(e) => setProcessStepField(i, "title", e.target.value)}
                      className="flex-1 rounded-lg"
                      placeholder="Judul langkah"
                    />
                    <button type="button" onClick={() => removeProcessStep(i)} className="p-1.5 text-gray-400 hover:text-red-500" aria-label="Hapus langkah">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Textarea
                    value={current.process.steps[i]?.description ?? ""}
                    onChange={(e) => setProcessStepField(i, "description", e.target.value)}
                    rows={2}
                    className="rounded-lg resize-none"
                    placeholder="Deskripsi langkah"
                  />
                </div>
              )}
            />
            <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={addProcessStep}>
              <Plus size={14} /> Tambah Langkah
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── Paket & Dokumen ─── */}
        <TabsContent value="pricing" className="space-y-5">
          <SectionCard icon={Wallet} title="Judul Section Paket">
            <Input
              value={current.packagesTitle ?? ""}
              onChange={(e) => setCurrent({ packagesTitle: e.target.value })}
              className="rounded-xl"
              placeholder={`Pilih Paket ${service.title}`}
            />
            <p className="text-xs text-gray-400">Kosongkan untuk pakai judul otomatis.</p>
          </SectionCard>

          <SectionCard icon={Wallet} title="Paket Harga" description="Disimpan langsung per paket (bukan bagian dari tombol Simpan Konten Detail). Harga & pengaturan lain sama di semua bahasa — cuma nama & fitur yang diterjemahkan.">
            <SortableList
              id="packages-list"
              items={packages}
              getId={(p) => p.id}
              disabled={isPackageBusy}
              onReorder={reorderPackages}
              renderItem={(pkg) => (
                <div className="space-y-2.5 rounded-xl border border-gray-200 p-3">
                  <div className="grid gap-2 sm:grid-cols-4">
                    <Input
                      value={pkgName(pkg, lang)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPackages((prev) => prev.map((p) => {
                          if (p.id !== pkg.id) return p;
                          if (lang === "id") return { ...p, name: value };
                          if (lang === "en") return { ...p, nameEn: value };
                          return { ...p, nameZh: value };
                        }));
                      }}
                      className="rounded-lg"
                      placeholder={lang === "id" ? "Nama paket" : "Nama paket (opsional)"}
                    />
                    <Input
                      type="number"
                      value={Number(pkg.price)}
                      onChange={(e) => setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, price: e.target.value as unknown as typeof p.price } : p)))}
                      className="rounded-lg"
                      placeholder="Harga (Rp)"
                    />
                    <Input
                      type="number"
                      value={pkg.originalPrice ?? ""}
                      onChange={(e) => setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, originalPrice: e.target.value === "" ? null : (e.target.value as unknown as typeof p.originalPrice) } : p)))}
                      className="rounded-lg"
                      placeholder="Harga coret (opsional)"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Switch
                        checked={pkg.isPopular}
                        onCheckedChange={(v) => setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, isPopular: v } : p)))}
                        className="data-[state=checked]:bg-primary"
                      />
                      Paling Populer
                    </label>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-4">
                    <Input
                      value={pkg.estimatedDurationLabel ?? ""}
                      onChange={(e) => setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, estimatedDurationLabel: e.target.value || null } : p)))}
                      className="rounded-lg sm:col-span-3"
                      placeholder="Estimasi durasi (mis. 5-7 hari kerja) — dipakai modul Transaksi"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Switch
                        checked={pkg.isActive}
                        onCheckedChange={(v) => setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, isActive: v } : p)))}
                        className="data-[state=checked]:bg-primary"
                      />
                      Aktif
                    </label>
                  </div>
                  <Textarea
                    value={pkgFeaturesText(pkg, lang)}
                    onChange={(e) => {
                      const arr = e.target.value.split("\n");
                      setPackages((prev) => prev.map((p) => {
                        if (p.id !== pkg.id) return p;
                        if (lang === "id") return { ...p, features: arr };
                        if (lang === "en") return { ...p, featuresEn: arr };
                        return { ...p, featuresZh: arr };
                      }));
                    }}
                    rows={3}
                    className="rounded-lg resize-none"
                    placeholder={lang === "id" ? "Fitur (satu per baris)" : "Fitur (satu per baris, opsional)"}
                  />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" className="gap-1.5 rounded-lg" onClick={() => savePackage(pkg)} disabled={isPackageBusy}>
                      <Save size={13} /> Simpan
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="gap-1.5 rounded-lg text-red-500 hover:bg-red-50" onClick={() => removePackage(pkg)} disabled={isPackageBusy}>
                      <Trash2 size={13} /> Hapus
                    </Button>
                  </div>
                </div>
              )}
            />
            <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={addPackage} disabled={isPackageBusy}>
              <Plus size={14} /> Tambah Paket
            </Button>
          </SectionCard>

          <SectionCard icon={ListChecks} title="Dokumen yang Diperlukan">
            <div className="space-y-1.5">
              <Label>Judul<OptionalHint lang={lang} /></Label>
              <Input
                value={current.documents?.title ?? ""}
                onChange={(e) => setCurrent({ documents: { title: e.target.value, items: current.documents?.items ?? [] } })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Daftar Dokumen (satu per baris)<OptionalHint lang={lang} /></Label>
              <Textarea
                value={(current.documents?.items ?? []).join("\n")}
                onChange={(e) => setCurrent({ documents: { title: current.documents?.title ?? "Dokumen yang Diperlukan", items: e.target.value.split("\n") } })}
                rows={4}
                className="rounded-xl resize-none"
              />
            </div>
          </SectionCard>

          <SectionCard icon={Wallet} title="Estimasi Waktu Pengerjaan">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Durasi<OptionalHint lang={lang} /></Label>
                <Input
                  value={current.duration?.value ?? ""}
                  onChange={(e) => setCurrent({ duration: { value: e.target.value, note: current.duration?.note ?? "" } })}
                  className="rounded-xl"
                  placeholder="3 – 7 Hari Kerja"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Catatan<OptionalHint lang={lang} /></Label>
                <Input
                  value={current.duration?.note ?? ""}
                  onChange={(e) => setCurrent({ duration: { value: current.duration?.value ?? "", note: e.target.value } })}
                  className="rounded-xl"
                  placeholder="(tergantung kelengkapan data)"
                />
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ─── Testimoni ─── */}
        <TabsContent value="testimonials" className="space-y-5">
          <SectionCard
            icon={MessagesSquare}
            title="Kartu &quot;Butuh Bantuan?&quot;"
            description="Daftar testimoni sendiri diambil otomatis dari Testimoni (kategori layanan ini) — kelola di menu Testimoni."
          >
            <div className="space-y-1.5">
              <Label>Judul<OptionalHint lang={lang} /></Label>
              <Input
                value={current.testimonialsHelp.title}
                onChange={(e) => setCurrent({ testimonialsHelp: { ...current.testimonialsHelp, title: e.target.value } })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi<OptionalHint lang={lang} /></Label>
              <Textarea
                value={current.testimonialsHelp.description}
                onChange={(e) => setCurrent({ testimonialsHelp: { ...current.testimonialsHelp, description: e.target.value } })}
                rows={2}
                className="rounded-xl resize-none"
              />
            </div>
            <Link href={`/${panel}/testimoni`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              <ExternalLink size={14} /> Kelola Testimoni
            </Link>
          </SectionCard>
        </TabsContent>

        {/* ─── FAQ ─── */}
        <TabsContent value="faq" className="space-y-5">
          <SectionCard icon={HelpCircle} title="Judul Section FAQ">
            <Input value={current.faqsTitle} onChange={(e) => setCurrent({ faqsTitle: e.target.value })} className="rounded-xl" />
          </SectionCard>

          <SectionCard
            icon={HelpCircle}
            title="FAQ Khusus Layanan Ini"
            description="Tampil bareng FAQ Global (dari menu FAQ). Disimpan langsung per item — belum ada versi EN/ZH di FAQ (di luar scope saat ini)."
          >
            <SortableList
              id="service-faqs-list"
              items={faqs}
              getId={(f) => f.id}
              disabled={isFaqBusy}
              onReorder={reorderFaqs}
              renderItem={(faq) => (
                <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                  <Input
                    value={faq.question}
                    onChange={(e) => setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, question: e.target.value } : f)))}
                    className="rounded-lg font-medium"
                    placeholder="Pertanyaan"
                  />
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, answer: e.target.value } : f)))}
                    rows={2}
                    className="rounded-lg resize-none"
                    placeholder="Jawaban"
                  />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" className="gap-1.5 rounded-lg" onClick={() => saveFaq(faq)} disabled={isFaqBusy}>
                      <Save size={13} /> Simpan
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="gap-1.5 rounded-lg text-red-500 hover:bg-red-50" onClick={() => removeFaq(faq)} disabled={isFaqBusy}>
                      <Trash2 size={13} /> Hapus
                    </Button>
                  </div>
                </div>
              )}
            />
            <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={addFaq} disabled={isFaqBusy}>
              <Plus size={14} /> Tambah FAQ
            </Button>
            <Link href={`/${panel}/faq`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              <ExternalLink size={14} /> Kelola FAQ Global
            </Link>
          </SectionCard>
        </TabsContent>

        {/* ─── CTA ─── */}
        <TabsContent value="cta" className="space-y-5">
          <SectionCard
            icon={MousePointerClick}
            title="CTA Banner (override)"
            description="Kalau nonaktif, CTA banner default (menu CTA Banner → Detail Layanan) yang tampil."
          >
            {lang === "id" && (
              <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-3">
                <Switch checked={ctaOverrideEnabled} onCheckedChange={setCtaOverrideEnabled} className="data-[state=checked]:bg-primary" />
                <span className="text-sm text-gray-700">Pakai CTA khusus untuk layanan ini</span>
              </div>
            )}
            {ctaOverrideEnabled && (
              <>
                <div className="space-y-1.5">
                  <Label>Judul<OptionalHint lang={lang} /></Label>
                  <Input
                    value={current.cta?.title ?? ""}
                    onChange={(e) => setCurrent({ cta: { title: e.target.value, subtitle: current.cta?.subtitle ?? "" } })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Subjudul<OptionalHint lang={lang} /></Label>
                  <Input
                    value={current.cta?.subtitle ?? ""}
                    onChange={(e) => setCurrent({ cta: { title: current.cta?.title ?? "", subtitle: e.target.value } })}
                    className="rounded-xl"
                  />
                </div>
              </>
            )}
            <Link href={`/${panel}/cta-banner`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              <ExternalLink size={14} /> Kelola CTA Banner Default
            </Link>
          </SectionCard>
        </TabsContent>

        {/* ─── SEO & Status ─── */}
        <TabsContent value="seo" className="space-y-5">
          <SectionCard icon={Search} title="SEO">
            <div className="space-y-1.5">
              <Label>Meta Title<OptionalHint lang={lang} /></Label>
              <Input
                value={seo[lang].metaTitle}
                onChange={(e) => setSeo((prev) => ({ ...prev, [lang]: { ...prev[lang], metaTitle: e.target.value } }))}
                className="rounded-xl"
                placeholder={lang === "id" ? service.title : service.title}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Meta Description<OptionalHint lang={lang} /></Label>
              <Textarea
                value={seo[lang].metaDescription}
                onChange={(e) => setSeo((prev) => ({ ...prev, [lang]: { ...prev[lang], metaDescription: e.target.value } }))}
                rows={3}
                className="rounded-xl resize-none"
                placeholder={service.description}
              />
            </div>
          </SectionCard>

          <SectionCard icon={Info} title="Status Publikasi">
            <div className="space-y-1.5 max-w-xs">
              <Label>Status</Label>
              <Select items={{ PUBLISHED: "Published", DRAFT: "Draft" }} value={status} onValueChange={(v) => v && setStatus(v as ContentStatus)}>
                <SelectTrigger className="h-10 w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start">
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                Draft cuma bisa dilihat lewat Preview (login sbg admin) — pengunjung publik dapat 404.
              </p>
            </div>
          </SectionCard>

          <Button onClick={saveMeta} disabled={isSavingMeta} className="gap-2 rounded-xl">
            <Save size={15} />
            {isSavingMeta ? "Menyimpan..." : "Simpan SEO & Status"}
          </Button>
        </TabsContent>
      </Tabs>

      {/* Tombol simpan konten detail — berlaku utk semua tab konten JSON
          (Hero/Tentang/Manfaat/Jenis/Proses/Dokumen/Durasi/Testimoni-help/FAQ-judul/CTA),
          ketiga bahasa sekaligus dalam satu klik. */}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={saveContent} disabled={isSavingContent} className="gap-2 rounded-xl shadow-lg">
          <Save size={15} />
          {isSavingContent ? "Menyimpan..." : "Simpan Konten Detail"}
        </Button>
      </div>
    </div>
  );
}
