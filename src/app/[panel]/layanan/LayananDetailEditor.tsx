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
import { DETAIL_ICONS, DEFAULT_DETAIL_ICON } from "@/lib/detail-icons";
import type { ServiceDetailContent } from "@/lib/types/service-detail-content";
import {
  updateServiceDetailContentAction,
  updateServiceMetaAction,
  updateServiceFeaturedMediaAction,
  uploadServiceFeaturedImageAction,
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

type ServiceWithRelations = Service & {
  featuredMedia: { id: string; url: string } | null;
  packages: ServicePackage[];
  faqs: Faq[];
};

/** Buang field `_key` sintetis (dipakai SortableList sbg id drag) sebelum
 * item balik disimpan ke state/DB. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function stripKey<T extends { _key: string }>({ _key, ...rest }: T): Omit<T, "_key"> {
  return rest;
}

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

function IconPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const Icon = DETAIL_ICONS[value] ?? DEFAULT_DETAIL_ICON;
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 text-primary">
        <Icon size={16} />
      </span>
      <Select items={Object.fromEntries(Object.keys(DETAIL_ICONS).map((k) => [k, k]))} value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger className="h-9 flex-1 rounded-lg" disabled={disabled}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align="start">
          {Object.keys(DETAIL_ICONS).map((k) => (
            <SelectItem key={k} value={k}>{k}</SelectItem>
          ))}
        </SelectContent>
      </Select>
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

  const initialContent = (service.detailContent as ServiceDetailContent | null) ?? FALLBACK_CONTENT;

  const [content, setContent] = useState<ServiceDetailContent>(initialContent);
  const [useChecklist, setUseChecklist] = useState(Boolean(initialContent.about.checklist));
  const [benefitsEnabled, setBenefitsEnabled] = useState(Boolean(initialContent.benefits));
  const [typesEnabled, setTypesEnabled] = useState(Boolean(initialContent.types));
  const [ctaOverrideEnabled, setCtaOverrideEnabled] = useState(Boolean(initialContent.cta));

  const [imageUrl, setImageUrl] = useState(service.featuredMedia?.url ?? null);

  const [metaTitle, setMetaTitle] = useState(service.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(service.metaDescription ?? "");
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

  const saveContent = () => {
    startSaveContent(async () => {
      try {
        const payload: ServiceDetailContent = {
          ...content,
          about: useChecklist
            ? { ...content.about, checklist: content.about.checklist ?? [] }
            : { ...content.about, checklist: undefined },
          benefits: benefitsEnabled ? content.benefits ?? { title: "", items: [] } : undefined,
          types: typesEnabled ? content.types ?? { title: "", items: [], linkLabel: "Lihat Semua Layanan", linkHref: "/layanan" } : undefined,
          cta: ctaOverrideEnabled ? content.cta ?? { title: "", subtitle: "" } : undefined,
        };
        const res = await updateServiceDetailContentAction(service.id, payload);
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
        const res = await updateServiceMetaAction(service.id, { metaTitle, metaDescription, status });
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
          name: "Paket Baru",
          price: 0,
          originalPrice: null,
          features: [],
          isPopular: false,
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

  const savePackage = (pkg: ServicePackage) => {
    startPackageTransition(async () => {
      try {
        const res = await updateServicePackageAction(pkg.id, {
          name: pkg.name,
          price: Number(pkg.price),
          originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : null,
          features: pkg.features as string[],
          isPopular: pkg.isPopular,
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

  const removePackage = async (pkg: ServicePackage) => {
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

  const reorderPackages = (next: ServicePackage[]) => {
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

  const highlightsList = useMemo(
    () => content.highlights.map((h, i) => ({ ...h, _key: `h-${i}` })),
    [content.highlights],
  );
  const statsList = useMemo(() => content.stats.map((s, i) => ({ ...s, _key: `s-${i}` })), [content.stats]);
  const benefitItems = useMemo(
    () => (content.benefits?.items ?? []).map((b, i) => ({ ...b, _key: `b-${i}` })),
    [content.benefits],
  );
  const typeItems = useMemo(
    () => (content.types?.items ?? []).map((t, i) => ({ ...t, _key: `t-${i}` })),
    [content.types],
  );
  const processSteps = useMemo(
    () => content.process.steps.map((s, i) => ({ ...s, _key: `p-${i}` })),
    [content.process.steps],
  );
  const documentItems = useMemo(
    () => (content.documents?.items ?? []).map((d, i) => ({ text: d, _key: `d-${i}` })),
    [content.documents],
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

      <Tabs defaultValue="hero">
        <TabsList className="rounded-xl mb-2 bg-gray-200 flex-wrap h-auto">
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
                <Label>Kicker (label kecil di atas judul)</Label>
                <Input value={content.kicker} onChange={(e) => setContent({ ...content, kicker: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Tagline (baris hijau di bawah judul)</Label>
                <Input value={content.tagline} onChange={(e) => setContent({ ...content, tagline: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi Hero</Label>
              <Textarea
                value={content.heroDescription}
                onChange={(e) => setContent({ ...content, heroDescription: e.target.value })}
                rows={2}
                className="rounded-xl resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Highlight (badge kecil di Hero)</Label>
              <SortableList
                items={highlightsList}
                getId={(h) => h._key}
                onReorder={(next) => setContent({ ...content, highlights: next.map(stripKey) })}
                renderItem={(h, i) => (
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-2.5">
                    <div className="w-40">
                      <IconPicker
                        value={h.icon}
                        onChange={(icon) =>
                          setContent({
                            ...content,
                            highlights: content.highlights.map((x, idx) => (idx === i ? { ...x, icon } : x)),
                          })
                        }
                      />
                    </div>
                    <Input
                      value={h.label}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          highlights: content.highlights.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)),
                        })
                      }
                      className="flex-1 rounded-lg"
                      placeholder="Label"
                    />
                    <button
                      type="button"
                      onClick={() => setContent({ ...content, highlights: content.highlights.filter((_, idx) => idx !== i) })}
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
                onClick={() => setContent({ ...content, highlights: [...content.highlights, { icon: "zap", label: "" }] })}
              >
                <Plus size={14} /> Tambah Highlight
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Kartu Statistik (melayang di gambar Hero)</Label>
              <SortableList
                items={statsList}
                getId={(s) => s._key}
                onReorder={(next) => setContent({ ...content, stats: next.map(stripKey) })}
                renderItem={(s, i) => (
                  <div className="grid grid-cols-[9rem_5rem_1fr_auto_auto] items-center gap-2 rounded-xl border border-gray-200 p-2.5">
                    <IconPicker
                      value={s.icon}
                      onChange={(icon) => setContent({ ...content, stats: content.stats.map((x, idx) => (idx === i ? { ...x, icon } : x)) })}
                    />
                    <Input
                      value={s.value}
                      onChange={(e) => setContent({ ...content, stats: content.stats.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)) })}
                      className="rounded-lg"
                      placeholder="5.000+"
                    />
                    <Input
                      value={s.label}
                      onChange={(e) => setContent({ ...content, stats: content.stats.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)) })}
                      className="rounded-lg"
                      placeholder="Label"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Switch
                        checked={Boolean(s.withStars)}
                        onCheckedChange={(v) => setContent({ ...content, stats: content.stats.map((x, idx) => (idx === i ? { ...x, withStars: v } : x)) })}
                        className="data-[state=checked]:bg-primary"
                      />
                      Bintang
                    </label>
                    <button
                      type="button"
                      onClick={() => setContent({ ...content, stats: content.stats.filter((_, idx) => idx !== i) })}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                      aria-label="Hapus statistik"
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
                onClick={() => setContent({ ...content, stats: [...content.stats, { icon: "star", value: "", label: "" }] })}
              >
                <Plus size={14} /> Tambah Statistik
              </Button>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ─── Tentang ─── */}
        <TabsContent value="about" className="space-y-5">
          <SectionCard icon={Info} title="Bagian &quot;Apa itu...&quot;">
            <div className="space-y-1.5">
              <Label>Judul</Label>
              <Input value={content.about.title} onChange={(e) => setContent({ ...content, about: { ...content.about, title: e.target.value } })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Paragraf (satu per baris)</Label>
              <Textarea
                value={content.about.paragraphs.join("\n")}
                onChange={(e) => setContent({ ...content, about: { ...content.about, paragraphs: e.target.value.split("\n") } })}
                rows={4}
                className="rounded-xl resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Label Gambar (alt text)</Label>
              <Input value={content.about.imageLabel} onChange={(e) => setContent({ ...content, about: { ...content.about, imageLabel: e.target.value } })} className="rounded-xl" />
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-3">
              <Switch checked={useChecklist} onCheckedChange={setUseChecklist} className="data-[state=checked]:bg-primary" />
              <span className="text-sm text-gray-700">
                Pakai varian checklist (kalau nonaktif, tampil varian gambar penuh + badge)
              </span>
            </div>

            {useChecklist ? (
              <div className="space-y-1.5">
                <Label>Checklist (satu per baris)</Label>
                <Textarea
                  value={(content.about.checklist ?? []).join("\n")}
                  onChange={(e) => setContent({ ...content, about: { ...content.about, checklist: e.target.value.split("\n") } })}
                  rows={4}
                  className="rounded-xl resize-none"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Badge Lingkaran (opsional)</Label>
                <Input
                  value={content.about.badge ?? ""}
                  onChange={(e) => setContent({ ...content, about: { ...content.about, badge: e.target.value || undefined } })}
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
            <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-3">
              <Switch checked={benefitsEnabled} onCheckedChange={setBenefitsEnabled} className="data-[state=checked]:bg-primary" />
              <span className="text-sm text-gray-700">Tampilkan section Manfaat</span>
            </div>
            {benefitsEnabled && (
              <>
                <div className="space-y-1.5">
                  <Label>Judul Section</Label>
                  <Input
                    value={content.benefits?.title ?? ""}
                    onChange={(e) => setContent({ ...content, benefits: { title: e.target.value, items: content.benefits?.items ?? [] } })}
                    className="rounded-xl"
                  />
                </div>
                <SortableList
                  items={benefitItems}
                  getId={(b) => b._key}
                  onReorder={(next) => setContent({ ...content, benefits: { title: content.benefits?.title ?? "", items: next.map(stripKey) } })}
                  renderItem={(b, i) => (
                    <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-40">
                          <IconPicker
                            value={b.icon}
                            onChange={(icon) => {
                              const items = [...(content.benefits?.items ?? [])];
                              items[i] = { ...items[i], icon };
                              setContent({ ...content, benefits: { title: content.benefits?.title ?? "", items } });
                            }}
                          />
                        </div>
                        <Input
                          value={b.title}
                          onChange={(e) => {
                            const items = [...(content.benefits?.items ?? [])];
                            items[i] = { ...items[i], title: e.target.value };
                            setContent({ ...content, benefits: { title: content.benefits?.title ?? "", items } });
                          }}
                          className="flex-1 rounded-lg"
                          placeholder="Judul"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const items = (content.benefits?.items ?? []).filter((_, idx) => idx !== i);
                            setContent({ ...content, benefits: { title: content.benefits?.title ?? "", items } });
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500"
                          aria-label="Hapus manfaat"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <Textarea
                        value={b.description}
                        onChange={(e) => {
                          const items = [...(content.benefits?.items ?? [])];
                          items[i] = { ...items[i], description: e.target.value };
                          setContent({ ...content, benefits: { title: content.benefits?.title ?? "", items } });
                        }}
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
                  onClick={() => setContent({ ...content, benefits: { title: content.benefits?.title ?? "", items: [...(content.benefits?.items ?? []), { icon: "shield-check", title: "", description: "" }] } })}
                >
                  <Plus size={14} /> Tambah Manfaat
                </Button>
              </>
            )}
          </SectionCard>
        </TabsContent>

        {/* ─── Jenis Layanan ─── */}
        <TabsContent value="types" className="space-y-5">
          <SectionCard icon={ListChecks} title="Jenis Layanan yang Ditangani" description="Section opsional (mis. dipakai Izin Usaha). Ikon kartu otomatis, gak bisa dikustom per item.">
            <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-3">
              <Switch checked={typesEnabled} onCheckedChange={setTypesEnabled} className="data-[state=checked]:bg-primary" />
              <span className="text-sm text-gray-700">Tampilkan section Jenis Layanan</span>
            </div>
            {typesEnabled && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Judul Section</Label>
                    <Input
                      value={content.types?.title ?? ""}
                      onChange={(e) => setContent({ ...content, types: { title: e.target.value, items: content.types?.items ?? [], linkLabel: content.types?.linkLabel ?? "Lihat Semua Layanan", linkHref: content.types?.linkHref ?? "/layanan" } })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Label Link</Label>
                    <Input
                      value={content.types?.linkLabel ?? ""}
                      onChange={(e) => setContent({ ...content, types: { title: content.types?.title ?? "", items: content.types?.items ?? [], linkLabel: e.target.value, linkHref: content.types?.linkHref ?? "/layanan" } })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Link Href</Label>
                  <Input
                    value={content.types?.linkHref ?? ""}
                    onChange={(e) => setContent({ ...content, types: { title: content.types?.title ?? "", items: content.types?.items ?? [], linkLabel: content.types?.linkLabel ?? "", linkHref: e.target.value } })}
                    className="rounded-xl"
                  />
                </div>
                <SortableList
                  items={typeItems}
                  getId={(t) => t._key}
                  onReorder={(next) => setContent({ ...content, types: { title: content.types?.title ?? "", items: next.map(stripKey), linkLabel: content.types?.linkLabel ?? "", linkHref: content.types?.linkHref ?? "" } })}
                  renderItem={(t, i) => (
                    <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={t.title}
                          onChange={(e) => {
                            const items = [...(content.types?.items ?? [])];
                            items[i] = { ...items[i], title: e.target.value };
                            setContent({ ...content, types: { title: content.types?.title ?? "", items, linkLabel: content.types?.linkLabel ?? "", linkHref: content.types?.linkHref ?? "" } });
                          }}
                          className="flex-1 rounded-lg"
                          placeholder="Judul"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const items = (content.types?.items ?? []).filter((_, idx) => idx !== i);
                            setContent({ ...content, types: { title: content.types?.title ?? "", items, linkLabel: content.types?.linkLabel ?? "", linkHref: content.types?.linkHref ?? "" } });
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500"
                          aria-label="Hapus jenis"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <Textarea
                        value={t.description}
                        onChange={(e) => {
                          const items = [...(content.types?.items ?? [])];
                          items[i] = { ...items[i], description: e.target.value };
                          setContent({ ...content, types: { title: content.types?.title ?? "", items, linkLabel: content.types?.linkLabel ?? "", linkHref: content.types?.linkHref ?? "" } });
                        }}
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
                  onClick={() => setContent({ ...content, types: { title: content.types?.title ?? "", items: [...(content.types?.items ?? []), { title: "", description: "" }], linkLabel: content.types?.linkLabel ?? "Lihat Semua Layanan", linkHref: content.types?.linkHref ?? "/layanan" } })}
                >
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
              <Label>Judul Section</Label>
              <Input value={content.process.title} onChange={(e) => setContent({ ...content, process: { ...content.process, title: e.target.value } })} className="rounded-xl" />
            </div>
            <SortableList
              items={processSteps}
              getId={(s) => s._key}
              onReorder={(next) => setContent({ ...content, process: { ...content.process, steps: next.map(stripKey) } })}
              renderItem={(s, i) => (
                <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-40">
                      <IconPicker
                        value={s.icon}
                        onChange={(icon) => {
                          const steps = [...content.process.steps];
                          steps[i] = { ...steps[i], icon };
                          setContent({ ...content, process: { ...content.process, steps } });
                        }}
                      />
                    </div>
                    <Input
                      value={s.title}
                      onChange={(e) => {
                        const steps = [...content.process.steps];
                        steps[i] = { ...steps[i], title: e.target.value };
                        setContent({ ...content, process: { ...content.process, steps } });
                      }}
                      className="flex-1 rounded-lg"
                      placeholder="Judul langkah"
                    />
                    <button
                      type="button"
                      onClick={() => setContent({ ...content, process: { ...content.process, steps: content.process.steps.filter((_, idx) => idx !== i) } })}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                      aria-label="Hapus langkah"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Textarea
                    value={s.description}
                    onChange={(e) => {
                      const steps = [...content.process.steps];
                      steps[i] = { ...steps[i], description: e.target.value };
                      setContent({ ...content, process: { ...content.process, steps } });
                    }}
                    rows={2}
                    className="rounded-lg resize-none"
                    placeholder="Deskripsi langkah"
                  />
                </div>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() => setContent({ ...content, process: { ...content.process, steps: [...content.process.steps, { icon: "messages-square", title: "", description: "" }] } })}
            >
              <Plus size={14} /> Tambah Langkah
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── Paket & Dokumen ─── */}
        <TabsContent value="pricing" className="space-y-5">
          <SectionCard icon={Wallet} title="Judul Section Paket">
            <Input
              value={content.packagesTitle ?? ""}
              onChange={(e) => setContent({ ...content, packagesTitle: e.target.value })}
              className="rounded-xl"
              placeholder={`Pilih Paket ${service.title}`}
            />
            <p className="text-xs text-gray-400">Kosongkan untuk pakai judul otomatis.</p>
          </SectionCard>

          <SectionCard icon={Wallet} title="Paket Harga" description="Disimpan langsung per paket (bukan bagian dari tombol Simpan Konten Detail).">
            <SortableList
              items={packages}
              getId={(p) => p.id}
              disabled={isPackageBusy}
              onReorder={reorderPackages}
              renderItem={(pkg) => (
                <div className="space-y-2.5 rounded-xl border border-gray-200 p-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input
                      value={pkg.name}
                      onChange={(e) => setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, name: e.target.value } : p)))}
                      className="rounded-lg"
                      placeholder="Nama paket"
                    />
                    <Input
                      type="number"
                      value={Number(pkg.price)}
                      onChange={(e) => setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, price: e.target.value as unknown as typeof p.price } : p)))}
                      className="rounded-lg"
                      placeholder="Harga (Rp)"
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
                  <Textarea
                    value={(pkg.features as string[]).join("\n")}
                    onChange={(e) => setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, features: e.target.value.split("\n") } : p)))}
                    rows={3}
                    className="rounded-lg resize-none"
                    placeholder="Fitur (satu per baris)"
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
              <Label>Judul</Label>
              <Input
                value={content.documents?.title ?? ""}
                onChange={(e) => setContent({ ...content, documents: { title: e.target.value, items: content.documents?.items ?? [] } })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Daftar Dokumen (satu per baris)</Label>
              <Textarea
                value={documentItems.map((d) => d.text).join("\n")}
                onChange={(e) => setContent({ ...content, documents: { title: content.documents?.title ?? "Dokumen yang Diperlukan", items: e.target.value.split("\n") } })}
                rows={4}
                className="rounded-xl resize-none"
              />
            </div>
          </SectionCard>

          <SectionCard icon={Wallet} title="Estimasi Waktu Pengerjaan">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Durasi</Label>
                <Input
                  value={content.duration?.value ?? ""}
                  onChange={(e) => setContent({ ...content, duration: { value: e.target.value, note: content.duration?.note ?? "" } })}
                  className="rounded-xl"
                  placeholder="3 – 7 Hari Kerja"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Catatan</Label>
                <Input
                  value={content.duration?.note ?? ""}
                  onChange={(e) => setContent({ ...content, duration: { value: content.duration?.value ?? "", note: e.target.value } })}
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
              <Label>Judul</Label>
              <Input
                value={content.testimonialsHelp.title}
                onChange={(e) => setContent({ ...content, testimonialsHelp: { ...content.testimonialsHelp, title: e.target.value } })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi</Label>
              <Textarea
                value={content.testimonialsHelp.description}
                onChange={(e) => setContent({ ...content, testimonialsHelp: { ...content.testimonialsHelp, description: e.target.value } })}
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
            <Input value={content.faqsTitle} onChange={(e) => setContent({ ...content, faqsTitle: e.target.value })} className="rounded-xl" />
          </SectionCard>

          <SectionCard
            icon={HelpCircle}
            title="FAQ Khusus Layanan Ini"
            description="Tampil bareng FAQ Global (dari menu FAQ). Disimpan langsung per item."
          >
            <SortableList
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
            <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 p-3">
              <Switch checked={ctaOverrideEnabled} onCheckedChange={setCtaOverrideEnabled} className="data-[state=checked]:bg-primary" />
              <span className="text-sm text-gray-700">Pakai CTA khusus untuk layanan ini</span>
            </div>
            {ctaOverrideEnabled && (
              <>
                <div className="space-y-1.5">
                  <Label>Judul</Label>
                  <Input
                    value={content.cta?.title ?? ""}
                    onChange={(e) => setContent({ ...content, cta: { title: e.target.value, subtitle: content.cta?.subtitle ?? "" } })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Subjudul</Label>
                  <Input
                    value={content.cta?.subtitle ?? ""}
                    onChange={(e) => setContent({ ...content, cta: { title: content.cta?.title ?? "", subtitle: e.target.value } })}
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
              <Label>Meta Title</Label>
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="rounded-xl" placeholder={service.title} />
            </div>
            <div className="space-y-1.5">
              <Label>Meta Description</Label>
              <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} className="rounded-xl resize-none" placeholder={service.description} />
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
          (Hero/Tentang/Manfaat/Jenis/Proses/Dokumen/Durasi/Testimoni-help/FAQ-judul/CTA) */}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={saveContent} disabled={isSavingContent} className="gap-2 rounded-xl shadow-lg">
          <Save size={15} />
          {isSavingContent ? "Menyimpan..." : "Simpan Konten Detail"}
        </Button>
      </div>
    </div>
  );
}
