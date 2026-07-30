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
  type AboutStatInput,
  type AboutValueInput,
} from "@/lib/actions/about";

/** Buang field `_key` sintetis (dipakai SortableList sbg id drag) sebelum
 * item balik disimpan ke state/DB — sama pola dgn LayananDetailEditor. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function stripKey<T extends { _key: string }>({ _key, ...rest }: T): Omit<T, "_key"> {
  return rest;
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

  /* ─── Hero ─── */
  const [heroKicker, setHeroKicker] = useState(content.heroKicker ?? "");
  const [heroTitle, setHeroTitle] = useState(content.heroTitle);
  const [heroTitleHighlight, setHeroTitleHighlight] = useState(content.heroTitleHighlight);
  const [heroSubtitleBold, setHeroSubtitleBold] = useState(content.heroSubtitleBold);
  const [heroSubtitleBody, setHeroSubtitleBody] = useState(content.heroSubtitleBody);
  const [heroImageUrl, setHeroImageUrl] = useState(content.heroImageUrl);
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);
  const [isSavingHero, startSaveHero] = useTransition();

  /* ─── Tentang Kami + Statistik ─── */
  const [aboutKicker, setAboutKicker] = useState(content.aboutKicker);
  const [aboutTitle, setAboutTitle] = useState(content.aboutTitle);
  const [aboutTitleHighlight, setAboutTitleHighlight] = useState(content.aboutTitleHighlight);
  const [aboutParagraphs, setAboutParagraphs] = useState<string[]>(content.aboutParagraphs as string[]);
  const [stats, setStats] = useState<AboutStatInput[]>(content.stats as unknown as AboutStatInput[]);
  const [aboutImageUrl, setAboutImageUrl] = useState(content.aboutImageUrl);
  const [isUploadingAboutImage, setIsUploadingAboutImage] = useState(false);
  const [isSavingAbout, startSaveAbout] = useTransition();

  /* ─── Nilai-Nilai ─── */
  const [valuesEnabled, setValuesEnabled] = useState(content.valuesEnabled);
  const [valuesTitle, setValuesTitle] = useState(content.valuesTitle);
  const [valuesTitleHighlight, setValuesTitleHighlight] = useState(content.valuesTitleHighlight);
  const [valuesSubtitle, setValuesSubtitle] = useState(content.valuesSubtitle);
  const [values, setValues] = useState<AboutValueInput[]>(content.values as unknown as AboutValueInput[]);
  const [isSavingValues, startSaveValues] = useTransition();

  /* ─── Visi & Misi ─── */
  const [visiMisiEnabled, setVisiMisiEnabled] = useState(content.visiMisiEnabled);
  const [vision, setVision] = useState(content.vision);
  const [mission, setMission] = useState<string[]>(content.mission as string[]);
  const [visionImageUrl, setVisionImageUrl] = useState(content.visionImageUrl);
  const [isUploadingVisionImage, setIsUploadingVisionImage] = useState(false);
  const [missionImageUrl, setMissionImageUrl] = useState(content.missionImageUrl);
  const [isUploadingMissionImage, setIsUploadingMissionImage] = useState(false);
  const [isSavingVisiMisi, startSaveVisiMisi] = useTransition();

  /* ─── Tim (pengaturan saja — anggota dikelola /admin/tim) ─── */
  const [teamEnabled, setTeamEnabled] = useState(content.teamEnabled);
  const [teamTitle, setTeamTitle] = useState(content.teamTitle);
  const [teamTitleHighlight, setTeamTitleHighlight] = useState(content.teamTitleHighlight);
  const [teamSubtitle, setTeamSubtitle] = useState(content.teamSubtitle);
  const [isSavingTeamSettings, startSaveTeamSettings] = useTransition();

  /* ─── SEO ─── */
  const [metaTitle, setMetaTitle] = useState(content.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(content.metaDescription ?? "");
  const [isSavingSeo, startSaveSeo] = useTransition();

  const statsList = useMemo(() => stats.map((s, i) => ({ ...s, _key: `s-${i}` })), [stats]);
  const valuesList = useMemo(() => values.map((v, i) => ({ ...v, _key: `v-${i}` })), [values]);

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
        const res = await saveAboutHeroContentAction({
          heroKicker,
          heroTitle,
          heroTitleHighlight,
          heroSubtitleBold,
          heroSubtitleBody,
        });
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
          aboutKicker,
          aboutTitle,
          aboutTitleHighlight,
          aboutParagraphs,
          stats,
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
          valuesEnabled,
          valuesTitle,
          valuesTitleHighlight,
          valuesSubtitle,
          values,
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
        const res = await saveAboutVisiMisiContentAction({ visiMisiEnabled, vision, mission });
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
        const res = await saveAboutTeamSettingsAction({ teamEnabled, teamTitle, teamTitleHighlight, teamSubtitle });
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
        const res = await saveAboutSeoAction({ metaTitle, metaDescription });
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
              <Input value={heroKicker} onChange={(e) => setHeroKicker(e.target.value)} className="rounded-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Judul</Label>
                <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="rounded-xl" placeholder="Tentang" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul (bagian hijau)</Label>
                <Input value={heroTitleHighlight} onChange={(e) => setHeroTitleHighlight(e.target.value)} className="rounded-xl" placeholder="IzinPro" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Subjudul (baris tebal)</Label>
              <Textarea value={heroSubtitleBold} onChange={(e) => setHeroSubtitleBold(e.target.value)} rows={2} className="rounded-xl resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Subjudul (paragraf)</Label>
              <Textarea value={heroSubtitleBody} onChange={(e) => setHeroSubtitleBody(e.target.value)} rows={3} className="rounded-xl resize-none" />
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
              <Label>Kicker</Label>
              <Input value={aboutKicker} onChange={(e) => setAboutKicker(e.target.value)} className="rounded-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Judul</Label>
                <Input value={aboutTitle} onChange={(e) => setAboutTitle(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul (bagian hijau)</Label>
                <Input value={aboutTitleHighlight} onChange={(e) => setAboutTitleHighlight(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Paragraf (satu per baris)</Label>
              <Textarea
                value={aboutParagraphs.join("\n")}
                onChange={(e) => setAboutParagraphs(e.target.value.split("\n"))}
                rows={4}
                className="rounded-xl resize-none"
              />
            </div>
          </SectionCard>

          <SectionCard icon={Award} title="Kartu Statistik" description="Statistik pertama juga jadi badge di atas foto.">
            <SortableList
              id="about-stats-list"
              items={statsList}
              getId={(s) => s._key}
              onReorder={(next) => setStats(next.map(stripKey))}
              renderItem={(s, i) => (
                <div className="grid grid-cols-[9rem_5rem_1fr_auto] items-center gap-2 rounded-xl border border-gray-200 p-2.5">
                  <IconPicker
                    value={s.icon}
                    onChange={(icon) => setStats((prev) => prev.map((x, idx) => (idx === i ? { ...x, icon } : x)))}
                  />
                  <Input
                    value={s.value}
                    onChange={(e) => setStats((prev) => prev.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))}
                    className="rounded-lg"
                    placeholder="5.000+"
                  />
                  <Input
                    value={s.label}
                    onChange={(e) => setStats((prev) => prev.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))}
                    className="rounded-lg"
                    placeholder="Label"
                  />
                  <button
                    type="button"
                    onClick={() => setStats((prev) => prev.filter((_, idx) => idx !== i))}
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
              onClick={() => setStats((prev) => [...prev, { icon: "star", value: "", label: "" }])}
            >
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
                <Label>Judul (bagian hijau)</Label>
                <Input value={valuesTitleHighlight} onChange={(e) => setValuesTitleHighlight(e.target.value)} className="rounded-xl" placeholder="Nilai-Nilai" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul</Label>
                <Input value={valuesTitle} onChange={(e) => setValuesTitle(e.target.value)} className="rounded-xl" placeholder="yang Kami Junjung" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Subjudul</Label>
              <Textarea value={valuesSubtitle} onChange={(e) => setValuesSubtitle(e.target.value)} rows={2} className="rounded-xl resize-none" />
            </div>

            <SortableList
              id="values-list"
              items={valuesList}
              getId={(v) => v._key}
              onReorder={(next) => setValues(next.map(stripKey))}
              renderItem={(v, i) => (
                <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-40">
                      <IconPicker
                        value={v.icon}
                        onChange={(icon) => setValues((prev) => prev.map((x, idx) => (idx === i ? { ...x, icon } : x)))}
                      />
                    </div>
                    <Input
                      value={v.title}
                      onChange={(e) => setValues((prev) => prev.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))}
                      className="flex-1 rounded-lg"
                      placeholder="Judul"
                    />
                    <button
                      type="button"
                      onClick={() => setValues((prev) => prev.filter((_, idx) => idx !== i))}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                      aria-label="Hapus nilai"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Textarea
                    value={v.description}
                    onChange={(e) => setValues((prev) => prev.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)))}
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
              onClick={() => setValues((prev) => [...prev, { icon: "shield-check", title: "", description: "" }])}
            >
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
              <Label>Visi</Label>
              <Textarea value={vision} onChange={(e) => setVision(e.target.value)} rows={2} className="rounded-xl resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Misi (satu per baris)</Label>
              <Textarea
                value={mission.join("\n")}
                onChange={(e) => setMission(e.target.value.split("\n"))}
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
                <Label>Judul</Label>
                <Input value={teamTitle} onChange={(e) => setTeamTitle(e.target.value)} className="rounded-xl" placeholder="Tim" />
              </div>
              <div className="space-y-1.5">
                <Label>Judul (bagian hijau)</Label>
                <Input value={teamTitleHighlight} onChange={(e) => setTeamTitleHighlight(e.target.value)} className="rounded-xl" placeholder="Profesional" />
              </div>
            </div>
            <p className="text-xs text-gray-400">Tampil sebagai: &quot;{teamTitle} {teamTitleHighlight} Kami&quot;</p>
            <div className="space-y-1.5">
              <Label>Subjudul</Label>
              <Textarea value={teamSubtitle} onChange={(e) => setTeamSubtitle(e.target.value)} rows={2} className="rounded-xl resize-none" />
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
              <Label>Meta Title</Label>
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="rounded-xl" placeholder={`${heroTitle} ${heroTitleHighlight}`} />
            </div>
            <div className="space-y-1.5">
              <Label>Meta Description</Label>
              <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} className="rounded-xl resize-none" placeholder={heroSubtitleBody} />
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
