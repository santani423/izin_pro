"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import type { ServiceCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { IconPicker } from "@/components/admin/IconPicker";
import { DEFAULT_DETAIL_ICON_KEY, DETAIL_ICONS, DEFAULT_DETAIL_ICON } from "@/lib/detail-icons";
import { cn } from "@/lib/utils";
import {
  createServiceCategoryAction,
  updateServiceCategoryAction,
  deleteServiceCategoryAction,
  toggleServiceCategoryActiveAction,
  type ServiceCategoryLangData,
} from "@/lib/actions/service-categories";

const LANGS = [
  { key: "id", label: "ID" },
  { key: "en", label: "EN" },
  { key: "zh", label: "中文" },
] as const;
type Lang = (typeof LANGS)[number]["key"];

interface FormState {
  dbId: string;
  icon: string;
  lang: Record<Lang, ServiceCategoryLangData>;
}

const emptyLang = (): ServiceCategoryLangData => ({ name: "", description: "" });
const emptyForm = (): FormState => ({
  dbId: "",
  icon: DEFAULT_DETAIL_ICON_KEY,
  lang: { id: emptyLang(), en: emptyLang(), zh: emptyLang() },
});

/* ─── Dialog kelola kategori layanan — dibuka dari tombol "Kelola Kategori"
 * di LayananManager. List + form 1 dialog (toggle internal), sama gaya
 * dgn dialog tambah/edit Layanan di LayananManager.tsx. ─── */
export default function CategoryManager({
  open,
  onOpenChange,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ServiceCategory[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState | null>(null);
  const [lang, setLang] = useState<Lang>("id");

  const openForm = (cat: ServiceCategory | null) => {
    setLang("id");
    setForm(
      cat
        ? {
            dbId: cat.id,
            icon: cat.icon ?? DEFAULT_DETAIL_ICON_KEY,
            lang: {
              id: { name: cat.name, description: cat.description ?? "" },
              en: { name: cat.nameEn ?? "", description: cat.descriptionEn ?? "" },
              zh: { name: cat.nameZh ?? "", description: cat.descriptionZh ?? "" },
            },
          }
        : emptyForm(),
    );
  };

  const save = () => {
    if (!form) return;
    if (!form.lang.id.name.trim()) {
      swalError("Nama kategori (Bahasa Indonesia) wajib diisi");
      return;
    }
    const payload = {
      icon: form.icon || null,
      id: { name: form.lang.id.name, description: form.lang.id.description?.trim() || null },
      en: { name: form.lang.en.name, description: form.lang.en.description?.trim() || null },
      zh: { name: form.lang.zh.name, description: form.lang.zh.description?.trim() || null },
    };
    startTransition(async () => {
      const res = form.dbId
        ? await updateServiceCategoryAction(form.dbId, payload)
        : await createServiceCategoryAction(payload);
      if (res.ok) {
        swalSuccess(form.dbId ? "Kategori diperbarui" : "Kategori baru ditambahkan");
        setForm(null);
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const toggleActive = (cat: ServiceCategory) => {
    startTransition(async () => {
      const res = await toggleServiceCategoryActiveAction(cat.id, !cat.isActive);
      if (res.ok) router.refresh();
      else swalError(res.message);
    });
  };

  const remove = async (cat: ServiceCategory) => {
    const confirmed = await swalConfirmDelete(`Kategori "${cat.name}"`);
    if (!confirmed) return;
    startTransition(async () => {
      const res = await deleteServiceCategoryAction(cat.id);
      if (res.ok) {
        swalSuccess("Kategori dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setForm(null);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        {form ? (
          <>
            <DialogTitle className="text-base font-bold text-gray-900">
              {form.dbId ? "Edit Kategori" : "Tambah Kategori"}
            </DialogTitle>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Ikon</Label>
                <div className="mt-1.5">
                  <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
                </div>
              </div>

              <div className="flex w-fit gap-1 rounded-lg bg-gray-100 p-1">
                {LANGS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setLang(key)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                      lang === key ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div>
                <Label htmlFor="cat-name" className="text-sm font-semibold text-gray-700">
                  Nama Kategori{lang !== "id" && <span className="font-normal text-gray-400"> — opsional</span>}
                </Label>
                <Input
                  id="cat-name"
                  className="mt-1.5 rounded-lg"
                  placeholder="mis. Perizinan Usaha"
                  value={form.lang[lang].name}
                  onChange={(e) => setForm({ ...form, lang: { ...form.lang, [lang]: { ...form.lang[lang], name: e.target.value } } })}
                />
              </div>
              <div>
                <Label htmlFor="cat-desc" className="text-sm font-semibold text-gray-700">
                  Deskripsi <span className="font-normal text-gray-400">(opsional)</span>
                </Label>
                <Textarea
                  id="cat-desc"
                  rows={2}
                  className="mt-1.5 rounded-lg resize-none"
                  value={form.lang[lang].description ?? ""}
                  onChange={(e) => setForm({ ...form, lang: { ...form.lang, [lang]: { ...form.lang[lang], description: e.target.value } } })}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setForm(null)}>
                Batal
              </Button>
              <Button className="flex-1 rounded-lg" onClick={save} disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-bold text-gray-900">Kelola Kategori</DialogTitle>
              <Button size="sm" className="gap-1.5 rounded-lg" onClick={() => openForm(null)}>
                <Plus size={14} /> Tambah
              </Button>
            </div>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {categories.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">Belum ada kategori.</p>
              )}
              {categories.map((cat) => {
                const Icon = (cat.icon ? DETAIL_ICONS[cat.icon] : undefined) ?? DEFAULT_DETAIL_ICON;
                return (
                  <div
                    key={cat.id}
                    className={`flex items-center gap-3 rounded-xl border border-admin-line p-3 ${cat.isActive ? "" : "opacity-60"}`}
                  >
                    <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{cat.name}</p>
                      {cat.description && <p className="truncate text-xs text-gray-400">{cat.description}</p>}
                    </div>
                    <Switch
                      checked={cat.isActive}
                      disabled={isPending}
                      onCheckedChange={() => toggleActive(cat)}
                      className="data-[state=checked]:bg-primary"
                    />
                    <button
                      onClick={() => openForm(cat)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-primary/5 hover:text-primary"
                      aria-label="Edit kategori"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => remove(cat)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label="Hapus kategori"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
