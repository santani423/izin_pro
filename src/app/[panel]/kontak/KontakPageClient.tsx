"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Save, ImagePlus, Trash2, Plus, LayoutTemplate, Info, MessageSquare,
  MapPinned, HelpCircle, ExternalLink,
} from "lucide-react";
import { swalSuccess, swalError } from "@/lib/swal";
import type { KontakPageContent } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SortableList } from "@/components/admin/SortableList";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { resolveDetailIcon } from "@/lib/detail-icons";
import {
  saveKontakHeroContentAction,
  saveKontakHeroImageAction,
  saveKontakInfoCardsAction,
  saveKontakFormSectionAction,
  saveKontakLocationAction,
  saveKontakFaqSectionAction,
  saveKontakHelpCardImageAction,
  type KontakInfoCardInput,
  type KontakChannelInput,
} from "@/lib/actions/kontak-page";

/** Buang field `_key` sintetis (dipakai SortableList sbg id drag) sebelum
 * item balik disimpan ke state/DB — sama pola dgn AboutPageEditor/PromoPageClient. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function stripKey<T extends { _key: string }>({ _key, ...rest }: T): Omit<T, "_key"> {
  return rest;
}

/* Ikon kanal kontak — set kecil khusus (whatsapp cuma ada di sini, brand icon
 * custom bukan dari lucide-react, jadi gak lewat IconPicker/DETAIL_ICONS). */
const CHANNEL_ICON_OPTIONS: Record<string, string> = {
  whatsapp: "WhatsApp",
  mail: "Email",
  "map-pin": "Lokasi",
  clock: "Jam Operasional",
  headset: "Headset",
  "messages-square": "Chat",
  globe: "Website",
  send: "Kirim",
};

function ChannelIconPreview({ icon, size = 14 }: { icon: string; size?: number }) {
  if (icon === "whatsapp") return <WhatsAppIcon width={size} height={size} />;
  const Icon = resolveDetailIcon(icon);
  return <Icon size={size} />;
}

function ChannelIconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-primary">
        <ChannelIconPreview icon={value} />
      </span>
      <Select items={CHANNEL_ICON_OPTIONS} value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger className="h-9 w-full rounded-lg text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align="start">
          {Object.entries(CHANNEL_ICON_OPTIONS).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
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

export default function KontakPageClient({
  content,
  faqCount,
  panel,
}: {
  content: KontakPageContent;
  faqCount: number;
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

  /* ─── Info Bar ─── */
  const [infoCards, setInfoCards] = useState<KontakInfoCardInput[]>(
    content.infoCards as unknown as KontakInfoCardInput[],
  );
  const [isSavingInfoCards, startSaveInfoCards] = useTransition();
  const infoCardsList = useMemo(() => infoCards.map((c, i) => ({ ...c, _key: `ic-${i}` })), [infoCards]);

  /* ─── Form & Sidebar ─── */
  const [formTitle, setFormTitle] = useState(content.formTitle);
  const [formSubtitle, setFormSubtitle] = useState(content.formSubtitle);
  const [sidebarTitle, setSidebarTitle] = useState(content.sidebarTitle);
  const [sidebarSubtitle, setSidebarSubtitle] = useState(content.sidebarSubtitle);
  const [channels, setChannels] = useState<KontakChannelInput[]>(
    (content.channels as unknown as Array<Partial<KontakChannelInput>>).map((c) => ({
      icon: c.icon ?? "globe",
      title: c.title ?? "",
      value: c.value ?? "",
      note: c.note ?? "",
      href: c.href ?? "",
    })),
  );
  const [isSavingForm, startSaveForm] = useTransition();
  const channelsList = useMemo(() => channels.map((c, i) => ({ ...c, _key: `ch-${i}` })), [channels]);

  /* ─── Lokasi ─── */
  const [locationTitle, setLocationTitle] = useState(content.locationTitle);
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState(content.mapsEmbedUrl);
  const [isSavingLocation, startSaveLocation] = useTransition();

  /* ─── FAQ ─── */
  const [faqTitlePrefix, setFaqTitlePrefix] = useState(content.faqTitlePrefix);
  const [faqTitleHighlight, setFaqTitleHighlight] = useState(content.faqTitleHighlight);
  const [helpCardTitle, setHelpCardTitle] = useState(content.helpCardTitle);
  const [helpCardDescription, setHelpCardDescription] = useState(content.helpCardDescription);
  const [helpCardButtonLabel, setHelpCardButtonLabel] = useState(content.helpCardButtonLabel);
  const [helpCardImageUrl, setHelpCardImageUrl] = useState(content.helpCardImageUrl);
  const [uploadingHelpCardImage, setUploadingHelpCardImage] = useState(false);
  const [isSavingFaq, startSaveFaq] = useTransition();

  /* ─── Banner handlers ─── */
  const uploadHeroImage = async (file: File) => {
    setUploadingHeroImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await saveKontakHeroImageAction(fd);
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
      const res = await saveKontakHeroImageAction(fd);
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
        const res = await saveKontakHeroContentAction({ heroKicker, heroTitle, heroTitleHighlight, heroDescription });
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

  /* ─── Info Bar handlers ─── */
  const saveInfoCards = () => {
    startSaveInfoCards(async () => {
      try {
        const res = await saveKontakInfoCardsAction({ infoCards });
        if (res.ok) {
          swalSuccess("Kartu info berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── Form & Sidebar handlers ─── */
  const saveForm = () => {
    startSaveForm(async () => {
      try {
        const res = await saveKontakFormSectionAction({
          formTitle, formSubtitle, sidebarTitle, sidebarSubtitle, channels,
        });
        if (res.ok) {
          swalSuccess("Konten form berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── Lokasi handlers ─── */
  const saveLocation = () => {
    startSaveLocation(async () => {
      try {
        const res = await saveKontakLocationAction({ locationTitle, mapsEmbedUrl });
        if (res.ok) {
          swalSuccess("Lokasi berhasil disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  /* ─── FAQ handlers ─── */
  const uploadHelpCardImage = async (file: File) => {
    setUploadingHelpCardImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await saveKontakHelpCardImageAction(fd);
      if (res.ok) {
        setHelpCardImageUrl(res.imageUrl);
        swalSuccess("Foto berhasil disimpan");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal mengunggah gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setUploadingHelpCardImage(false);
    }
  };

  const removeHelpCardImage = async () => {
    setUploadingHelpCardImage(true);
    try {
      const fd = new FormData();
      fd.append("reset", "true");
      const res = await saveKontakHelpCardImageAction(fd);
      if (res.ok) {
        setHelpCardImageUrl(null);
        swalSuccess("Foto dikembalikan ke bawaan");
        router.refresh();
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal menghapus gambar. Cek koneksi lalu coba lagi.");
    } finally {
      setUploadingHelpCardImage(false);
    }
  };

  const saveFaq = () => {
    startSaveFaq(async () => {
      try {
        const res = await saveKontakFaqSectionAction({
          faqTitlePrefix, faqTitleHighlight, helpCardTitle, helpCardDescription, helpCardButtonLabel,
        });
        if (res.ok) {
          swalSuccess("Konten FAQ berhasil disimpan");
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
          <TabsTrigger value="info" className="rounded-lg">Info Bar</TabsTrigger>
          <TabsTrigger value="form" className="rounded-lg">Form & Sidebar</TabsTrigger>
          <TabsTrigger value="lokasi" className="rounded-lg">Lokasi</TabsTrigger>
          <TabsTrigger value="faq" className="rounded-lg">FAQ</TabsTrigger>
        </TabsList>

        {/* ─── Banner ─── */}
        <TabsContent value="banner" className="space-y-5">
          <SectionCard icon={LayoutTemplate} title="Gambar Banner" description="Kosongkan untuk pakai kartu gradient bawaan.">
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
                <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="rounded-xl" placeholder="Hubungi" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul (bagian hijau)</Label>
                <Input value={heroTitleHighlight} onChange={(e) => setHeroTitleHighlight(e.target.value)} className="rounded-xl" placeholder="IzinPro" />
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

        {/* ─── Info Bar ─── */}
        <TabsContent value="info" className="space-y-5">
          <SectionCard icon={Info} title="Bar Info Kontak" description="4 kartu yang menimpa bagian bawah banner.">
            <SortableList
              id="kontak-info-cards-list"
              items={infoCardsList}
              getId={(c) => c._key}
              onReorder={(next) => setInfoCards(next.map(stripKey))}
              renderItem={(c, i) => (
                <div className="grid grid-cols-[9rem_1fr_1fr_1fr] items-center gap-2 rounded-xl border border-gray-200 p-2.5">
                  <ChannelIconSelect
                    value={c.icon}
                    onChange={(icon) => setInfoCards((prev) => prev.map((x, idx) => (idx === i ? { ...x, icon } : x)))}
                  />
                  <Input
                    value={c.title}
                    onChange={(e) => setInfoCards((prev) => prev.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))}
                    className="rounded-lg"
                    placeholder="Judul"
                  />
                  <Input
                    value={c.value}
                    onChange={(e) => setInfoCards((prev) => prev.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))}
                    className="rounded-lg"
                    placeholder="Nilai"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      value={c.note}
                      onChange={(e) => setInfoCards((prev) => prev.map((x, idx) => (idx === i ? { ...x, note: e.target.value } : x)))}
                      className="rounded-lg"
                      placeholder="Keterangan"
                    />
                    <button
                      type="button"
                      onClick={() => setInfoCards((prev) => prev.filter((_, idx) => idx !== i))}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                      aria-label="Hapus kartu"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() => setInfoCards((prev) => [...prev, { icon: "mail", title: "", value: "", note: "" }])}
            >
              <Plus size={14} /> Tambah Kartu
            </Button>
            <Button onClick={saveInfoCards} disabled={isSavingInfoCards} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingInfoCards ? "Menyimpan..." : "Simpan Info Bar"}
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── Form & Sidebar ─── */}
        <TabsContent value="form" className="space-y-5">
          <SectionCard icon={MessageSquare} title="Judul Form & Sidebar">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Judul Form</Label>
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Subjudul Form</Label>
                <Input value={formSubtitle} onChange={(e) => setFormSubtitle(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul Sidebar</Label>
                <Input value={sidebarTitle} onChange={(e) => setSidebarTitle(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Subjudul Sidebar</Label>
                <Input value={sidebarSubtitle} onChange={(e) => setSidebarSubtitle(e.target.value)} className="rounded-xl" />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={MessageSquare} title="Kanal Kontak (Sidebar)" description="Kartu kanal di sidebar form kontak.">
            <SortableList
              id="kontak-channels-list"
              items={channelsList}
              getId={(c) => c._key}
              onReorder={(next) => setChannels(next.map(stripKey))}
              renderItem={(c, i) => (
                <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                  <div className="grid grid-cols-[9rem_1fr_1fr] items-center gap-2">
                    <ChannelIconSelect
                      value={c.icon}
                      onChange={(icon) => setChannels((prev) => prev.map((x, idx) => (idx === i ? { ...x, icon } : x)))}
                    />
                    <Input
                      value={c.title}
                      onChange={(e) => setChannels((prev) => prev.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))}
                      className="rounded-lg"
                      placeholder="Judul"
                    />
                    <Input
                      value={c.value}
                      onChange={(e) => setChannels((prev) => prev.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))}
                      className="rounded-lg"
                      placeholder="Nilai (opsional)"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={c.note}
                      onChange={(e) => setChannels((prev) => prev.map((x, idx) => (idx === i ? { ...x, note: e.target.value } : x)))}
                      className="flex-1 rounded-lg"
                      placeholder="Keterangan (opsional)"
                    />
                    <Input
                      value={c.href}
                      onChange={(e) => setChannels((prev) => prev.map((x, idx) => (idx === i ? { ...x, href: e.target.value } : x)))}
                      className="flex-1 rounded-lg"
                      placeholder="Link (wa.me/..., mailto:..., https://...)"
                    />
                    <button
                      type="button"
                      onClick={() => setChannels((prev) => prev.filter((_, idx) => idx !== i))}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                      aria-label="Hapus kanal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() => setChannels((prev) => [...prev, { icon: "globe", title: "", value: "", note: "", href: "" }])}
            >
              <Plus size={14} /> Tambah Kanal
            </Button>

            <Button onClick={saveForm} disabled={isSavingForm} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingForm ? "Menyimpan..." : "Simpan Form & Sidebar"}
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── Lokasi ─── */}
        <TabsContent value="lokasi" className="space-y-5">
          <SectionCard
            icon={MapPinned}
            title="Lokasi Kantor"
            description="Alamat & tombol Google Maps ambil dari Pengaturan > Kontak — di sini cuma judul & embed peta."
          >
            <div className="space-y-1.5">
              <Label>Judul</Label>
              <Input value={locationTitle} onChange={(e) => setLocationTitle(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>URL Embed Peta (Google Maps)</Label>
              <Textarea value={mapsEmbedUrl} onChange={(e) => setMapsEmbedUrl(e.target.value)} rows={2} className="rounded-xl resize-none font-mono text-xs" />
              <p className="text-xs text-gray-400">
                Dari Google Maps: Bagikan → Sematkan peta → salin URL di atribut src iframe.
              </p>
            </div>
            <Button onClick={saveLocation} disabled={isSavingLocation} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingLocation ? "Menyimpan..." : "Simpan Lokasi"}
            </Button>
          </SectionCard>
        </TabsContent>

        {/* ─── FAQ ─── */}
        <TabsContent value="faq" className="space-y-5">
          <SectionCard icon={HelpCircle} title="Judul Section FAQ">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Awalan Judul</Label>
                <Input value={faqTitlePrefix} onChange={(e) => setFaqTitlePrefix(e.target.value)} className="rounded-xl" placeholder="Pertanyaan yang" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul (bagian hijau)</Label>
                <Input value={faqTitleHighlight} onChange={(e) => setFaqTitleHighlight(e.target.value)} className="rounded-xl" placeholder="Sering Diajukan" />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={HelpCircle}
            title="Daftar Pertanyaan (FAQ)"
            description={`${faqCount} pertanyaan aktif dengan scope "Kontak". Dikelola di halaman FAQ (dipakai bareng section FAQ lain).`}
          >
            <Link
              href={`/${panel}/faq`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ExternalLink size={14} />
              Kelola FAQ
            </Link>
          </SectionCard>

          <SectionCard icon={HelpCircle} title="Kartu Bantuan" description="Kartu ajakan konsultasi di samping daftar FAQ.">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <Image
                  src={helpCardImageUrl ?? "/images/promo-konsultasi.png"}
                  alt=""
                  width={112}
                  height={80}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <ImagePlus size={15} />
                {uploadingHelpCardImage ? "Mengunggah..." : "Pilih Gambar"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploadingHelpCardImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadHelpCardImage(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {helpCardImageUrl && (
                <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg text-red-500 hover:bg-red-50" onClick={removeHelpCardImage} disabled={uploadingHelpCardImage}>
                  <Trash2 size={13} /> Pakai Bawaan
                </Button>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Judul</Label>
              <Input value={helpCardTitle} onChange={(e) => setHelpCardTitle(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi</Label>
              <Textarea value={helpCardDescription} onChange={(e) => setHelpCardDescription(e.target.value)} rows={2} className="rounded-xl resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Label Tombol</Label>
              <Input value={helpCardButtonLabel} onChange={(e) => setHelpCardButtonLabel(e.target.value)} className="rounded-xl" />
            </div>

            <Button onClick={saveFaq} disabled={isSavingFaq} className="gap-2 rounded-xl">
              <Save size={15} />
              {isSavingFaq ? "Menyimpan..." : "Simpan"}
            </Button>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
