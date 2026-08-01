"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Save, Globe, Phone, Share2, Eye, Construction, AlertTriangle, ImagePlus, RefreshCcw, MessageCircle } from "lucide-react";
import { swalSuccess, swalError } from "@/lib/swal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMPANY_INFO } from "@/lib/constants";
import {
  saveBrandingSettingsAction, updateMaintenanceModeAction, updateWhacenterSettingsAction,
} from "@/lib/actions/settings";
import { DEFAULT_LOGO_URL, DEFAULT_FAVICON_URL } from "@/lib/branding-constants";

/* ─── Halaman Pengaturan Admin ───
 * readOnly=true utk role ADMIN (bisa lihat semua tab, tapi gak bisa ubah/simpan).
 * Tab Umum/Kontak/Sosmed/SEO masih mock (belum disambung Prisma). Tab
 * Maintenance beneran baca/simpan ke tabel Settings lewat server action. */
export default function SettingsPageClient({
  readOnly = false,
  maintenanceMode: initialMaintenanceMode,
  maintenanceMessage: initialMaintenanceMessage,
  appLogoUrl: initialAppLogoUrl,
  faviconUrl: initialFaviconUrl,
  whacenterDeviceId: initialWhacenterDeviceId,
}: {
  readOnly?: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  appLogoUrl: string | null;
  faviconUrl: string | null;
  whacenterDeviceId: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [maintenanceMode, setMaintenanceMode] = useState(initialMaintenanceMode);
  const [maintenanceMessage, setMaintenanceMessage] = useState(initialMaintenanceMessage);
  const [whacenterDeviceId, setWhacenterDeviceId] = useState(initialWhacenterDeviceId);
  const [appLogoUrl, setAppLogoUrl] = useState(initialAppLogoUrl);
  const [faviconUrl, setFaviconUrl] = useState(initialFaviconUrl);
  const [appLogoFile, setAppLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [resetLogo, setResetLogo] = useState(false);
  const [resetFavicon, setResetFavicon] = useState(false);
  const isBrandingDirty = Boolean(appLogoFile || faviconFile || resetLogo || resetFavicon);

  const logoPreview = useMemo(() => {
    if (appLogoFile) return URL.createObjectURL(appLogoFile);
    if (appLogoUrl && !resetLogo) return appLogoUrl;
    return DEFAULT_LOGO_URL;
  }, [appLogoFile, appLogoUrl, resetLogo]);

  const faviconPreview = useMemo(() => {
    if (faviconFile) return URL.createObjectURL(faviconFile);
    if (faviconUrl && !resetFavicon) return faviconUrl;
    return DEFAULT_FAVICON_URL;
  }, [faviconFile, faviconUrl, resetFavicon]);

  const handleSave = () => {
    setSaved(true);
    swalSuccess("Pengaturan disimpan");
    setTimeout(() => setSaved(false), 2000);
  };

  const saveButton = readOnly ? null : (
    <Button onClick={handleSave} className="gap-2 rounded-xl">
      <Save size={15} />
      {saved ? "✓ Tersimpan!" : "Simpan Perubahan"}
    </Button>
  );

  const saveMaintenance = () => {
    startTransition(async () => {
      try {
        const res = await updateMaintenanceModeAction(maintenanceMode, maintenanceMessage);
        if (res.ok) {
          swalSuccess("Pengaturan maintenance disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        // Request ke server gak sampai selesai (mis. koneksi kepotong) — tanpa
        // catch ini React nelen error-nya diem-diem & user gak liat apa-apa.
        swalError("Gagal menyimpan pengaturan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  const saveWhacenter = () => {
    startTransition(async () => {
      try {
        const res = await updateWhacenterSettingsAction(whacenterDeviceId);
        if (res.ok) {
          swalSuccess("Device ID WhaCenter disimpan");
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan Device ID. Cek koneksi lalu coba lagi.");
      }
    });
  };

  const saveBranding = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        if (appLogoFile) formData.set("appLogo", appLogoFile);
        if (faviconFile) formData.set("favicon", faviconFile);
        if (resetLogo) formData.set("resetLogo", "true");
        if (resetFavicon) formData.set("resetFavicon", "true");

        const res = await saveBrandingSettingsAction(formData);
        if (res.ok) {
          swalSuccess("Logo aplikasi berhasil disimpan");
          setAppLogoUrl(res.appLogoUrl);
          setFaviconUrl(res.faviconUrl);
          setAppLogoFile(null);
          setFaviconFile(null);
          setResetLogo(false);
          setResetFavicon(false);
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        // Sama kayak saveMaintenance: request bisa gagal sebelum server
        // action-nya sempat balikin { ok, message } (mis. koneksi kepotong
        // di tengah upload) — tanpa catch ini, user gak liat feedback apa pun
        // walau file logo/favicon udah kadung ke-upload ke disk.
        swalError("Gagal menyimpan logo/favicon. Cek koneksi lalu coba lagi.");
      }
    });
  };

  return (
    <>
      <div className="p-6 lg:p-8 space-y-6">
        {readOnly && (
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <Eye size={16} className="flex-shrink-0" />
            Anda cuma bisa melihat Pengaturan (view-only). Hanya Super Admin yang bisa mengubahnya.
          </div>
        )}
        <Tabs defaultValue="umum">
          <TabsList className="rounded-xl mb-6 bg-gray-200">
            <TabsTrigger value="umum" className="rounded-lg">Umum</TabsTrigger>
            <TabsTrigger value="kontak" className="rounded-lg">Kontak</TabsTrigger>
            <TabsTrigger value="sosmed" className="rounded-lg">Sosial Media</TabsTrigger>
            <TabsTrigger value="seo" className="rounded-lg">SEO</TabsTrigger>
            <TabsTrigger value="maintenance" className="rounded-lg">Maintenance</TabsTrigger>
            <TabsTrigger value="integrasi" className="rounded-lg">Integrasi</TabsTrigger>
          </TabsList>

          {/* ─── Tab Umum ─── */}
          <TabsContent value="umum">
            <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5 max-w-2xl">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Globe size={16} className="text-primary" />
                Informasi Website
              </h3>
              <div className="space-y-1.5">
                <Label>Logo Aplikasi</Label>
                <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                      <Image src={logoPreview} alt="Preview logo aplikasi" width={64} height={64} unoptimized className="h-full w-full object-contain" />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Unggah logo yang akan dipakai di header, sidebar, login, dan landing page.</p>
                      <p className="text-xs text-gray-400">Format PNG, JPG, JPEG, SVG, WebP. Maksimal 2MB.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <ImagePlus size={15} />
                      Pilih File
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          if (file) {
                            setAppLogoFile(file);
                            setResetLogo(false);
                          }
                        }}
                        disabled={readOnly || isPending}
                      />
                    </label>
                    <Button type="button" variant="outline" className="gap-2 rounded-xl" onClick={() => { setResetLogo(true); setAppLogoFile(null); }} disabled={readOnly || isPending}>
                      <RefreshCcw size={15} />
                      Reset ke default
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Favicon</Label>
                <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <Image src={faviconPreview} alt="Preview favicon" width={48} height={48} unoptimized className="h-full w-full object-contain" />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Ikon browser yang muncul di tab halaman.</p>
                      <p className="text-xs text-gray-400">Format PNG, JPG, JPEG, SVG, WebP. Maksimal 2MB.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <ImagePlus size={15} />
                      Pilih File
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          if (file) {
                            setFaviconFile(file);
                            setResetFavicon(false);
                          }
                        }}
                        disabled={readOnly || isPending}
                      />
                    </label>
                    <Button type="button" variant="outline" className="gap-2 rounded-xl" onClick={() => { setResetFavicon(true); setFaviconFile(null); }} disabled={readOnly || isPending}>
                      <RefreshCcw size={15} />
                      Reset ke default
                    </Button>
                  </div>
                </div>
              </div>
              {!readOnly && (
                <Button
                  type="button"
                  onClick={saveBranding}
                  disabled={isPending || !isBrandingDirty}
                  className="gap-2 rounded-xl"
                >
                  <Save size={15} />
                  {isPending ? "Menyimpan..." : "Simpan Logo & Favicon"}
                </Button>
              )}
              <div className="space-y-1.5">
                <Label>Nama Perusahaan</Label>
                <Input defaultValue={COMPANY_INFO.name} className="rounded-xl" disabled={readOnly} />
              </div>
              <div className="space-y-1.5">
                <Label>Tagline</Label>
                <Input defaultValue={COMPANY_INFO.tagline} className="rounded-xl" disabled={readOnly} />
              </div>
              <div className="space-y-1.5">
                <Label>Deskripsi Singkat</Label>
                <Textarea
                  defaultValue={COMPANY_INFO.description}
                  rows={3}
                  className="rounded-xl resize-none"
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Jam Operasional</Label>
                <Input defaultValue={COMPANY_INFO.hours} className="rounded-xl" disabled={readOnly} />
              </div>
              {saveButton}
            </div>
          </TabsContent>

          {/* ─── Tab Kontak ─── */}
          <TabsContent value="kontak">
            <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5 max-w-2xl">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Phone size={16} className="text-primary" />
                Informasi Kontak
              </h3>
              <div className="space-y-1.5">
                <Label>Nomor WhatsApp</Label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500">+62</span>
                  <Input defaultValue="82280007821" className="rounded-xl flex-1" disabled={readOnly} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Alamat Email</Label>
                <Input type="email" defaultValue={COMPANY_INFO.email} className="rounded-xl" disabled={readOnly} />
              </div>
              <div className="space-y-1.5">
                <Label>Alamat Lengkap</Label>
                <Textarea
                  defaultValue={COMPANY_INFO.address}
                  rows={2}
                  className="rounded-xl resize-none"
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-1.5">
                <Label>URL Google Maps</Label>
                <Input defaultValue={COMPANY_INFO.mapsUrl} className="rounded-xl" disabled={readOnly} />
              </div>
              {saveButton}
            </div>
          </TabsContent>

          {/* ─── Tab Sosmed ─── */}
          <TabsContent value="sosmed">
            <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5 max-w-2xl">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Share2 size={16} className="text-primary" />
                Link Sosial Media
              </h3>
              {[
                { label: "LinkedIn", key: "linkedin" },
                { label: "Facebook", key: "facebook" },
                { label: "Instagram", key: "instagram" },
                { label: "X (Twitter)", key: "twitter" },
                { label: "YouTube", key: "youtube" },
              ].map((s) => (
                <div key={s.key} className="space-y-1.5">
                  <Label>{s.label}</Label>
                  <Input placeholder={`https://www.${s.key}.com/izinpro`} className="rounded-xl" disabled={readOnly} />
                </div>
              ))}
              {saveButton}
            </div>
          </TabsContent>

          {/* ─── Tab SEO ─── */}
          <TabsContent value="seo">
            <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5 max-w-2xl">
              <h3 className="font-bold text-gray-900">SEO Global</h3>
              <div className="space-y-1.5">
                <Label>Meta Title Default</Label>
                <Input
                  defaultValue="IzinPro — Solusi Perizinan Bisnis Terpercaya di Indonesia"
                  className="rounded-xl"
                  disabled={readOnly}
                />
                <p className="text-xs text-gray-400">Maks. 60 karakter</p>
              </div>
              <div className="space-y-1.5">
                <Label>Meta Description Default</Label>
                <Textarea
                  defaultValue={COMPANY_INFO.description}
                  rows={3}
                  className="rounded-xl resize-none"
                  disabled={readOnly}
                />
                <p className="text-xs text-gray-400">Maks. 160 karakter</p>
              </div>
              <div className="space-y-1.5">
                <Label>Keywords</Label>
                <Input
                  defaultValue="perizinan bisnis, pendirian PT, NIB, izin usaha, IzinPro"
                  className="rounded-xl"
                  disabled={readOnly}
                />
              </div>
              {saveButton}
            </div>
          </TabsContent>

          {/* ─── Tab Maintenance ─── */}
          <TabsContent value="maintenance">
            <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5 max-w-2xl">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Construction size={16} className="text-primary" />
                Mode Maintenance
              </h3>
              <p className="text-sm text-gray-500">
                Kalau dinyalakan, pengunjung publik cuma akan melihat halaman
                &quot;Under Maintenance&quot; di semua halaman website. Anda yang login
                sebagai Admin/Super Admin tetap bisa browsing situs seperti biasa.
              </p>

              {maintenanceMode && (
                <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <AlertTriangle size={16} className="flex-shrink-0" />
                  Mode maintenance sedang AKTIF — pengunjung publik gak bisa akses website.
                </div>
              )}

              <div className="flex items-center gap-3">
                <Switch
                  checked={maintenanceMode}
                  disabled={readOnly || isPending}
                  onCheckedChange={setMaintenanceMode}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  {maintenanceMode ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              <div className="space-y-1.5">
                <Label>Pesan Tambahan (opsional)</Label>
                <Textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="Kami sedang melakukan pemeliharaan sistem. Mohon coba lagi beberapa saat lagi."
                  rows={3}
                  className="rounded-xl resize-none"
                  disabled={readOnly || isPending}
                />
                <p className="text-xs text-gray-400">Kosongkan untuk pakai pesan default.</p>
              </div>

              {!readOnly && (
                <Button onClick={saveMaintenance} disabled={isPending} className="gap-2 rounded-xl">
                  <Save size={15} />
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              )}
            </div>
          </TabsContent>

          {/* ─── Tab Integrasi ─── */}
          <TabsContent value="integrasi">
            <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5 max-w-2xl">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle size={16} className="text-primary" />
                Integrasi WhatsApp (WhaCenter)
              </h3>
              <p className="text-sm text-gray-500">
                Device ID akun{" "}
                <a href="https://order.whacenter.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  WhaCenter
                </a>{" "}
                yang sudah terhubung dengan nomor WhatsApp pengirim. Dipakai fitur &quot;Kirim WhatsApp&quot; di halaman
                detail transaksi (modul Transaksi) untuk mengirim invoice, link tracking, dan QR code ke customer.
              </p>
              <div className="space-y-1.5">
                <Label>Device ID</Label>
                <Input
                  value={whacenterDeviceId}
                  onChange={(e) => setWhacenterDeviceId(e.target.value)}
                  placeholder="mis. c9c947a55d92639ba2c475c9806dfbe5"
                  className="rounded-xl font-mono"
                  disabled={readOnly || isPending}
                />
                <p className="text-xs text-gray-400">Kosongkan untuk menonaktifkan fitur kirim WhatsApp otomatis.</p>
              </div>
              {!readOnly && (
                <Button onClick={saveWhacenter} disabled={isPending} className="gap-2 rounded-xl">
                  <Save size={15} />
                  {isPending ? "Menyimpan..." : "Simpan Device ID"}
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
