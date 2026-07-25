"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Globe, Phone, Share2, Eye, Construction, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMPANY_INFO } from "@/lib/constants";
import { updateMaintenanceModeAction } from "@/lib/actions/settings";

/* ─── Halaman Pengaturan Admin ───
 * readOnly=true utk role ADMIN (bisa lihat semua tab, tapi gak bisa ubah/simpan).
 * Tab Umum/Kontak/Sosmed/SEO masih mock (belum disambung Prisma). Tab
 * Maintenance beneran baca/simpan ke tabel Settings lewat server action. */
export default function SettingsPageClient({
  readOnly = false,
  maintenanceMode: initialMaintenanceMode,
  maintenanceMessage: initialMaintenanceMessage,
}: {
  readOnly?: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [maintenanceMode, setMaintenanceMode] = useState(initialMaintenanceMode);
  const [maintenanceMessage, setMaintenanceMessage] = useState(initialMaintenanceMessage);

  const handleSave = () => {
    setSaved(true);
    toast.success("Pengaturan disimpan");
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
      const res = await updateMaintenanceModeAction(maintenanceMode, maintenanceMessage);
      if (res.ok) {
        toast.success("Pengaturan maintenance disimpan");
        router.refresh();
      } else {
        toast.error(res.message);
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
          </TabsList>

          {/* ─── Tab Umum ─── */}
          <TabsContent value="umum">
            <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5 max-w-2xl">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Globe size={16} className="text-primary" />
                Informasi Website
              </h3>
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
        </Tabs>
      </div>
    </>
  );
}
