"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, CornerDownRight, Menu as MenuIcon } from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import type { Menu, MenuItem } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createMenuItemAction,
  deleteMenuItemAction,
  moveMenuItemAction,
  updateMenuItemAction,
} from "@/lib/actions/menu";

type MenuItemWithUsers = MenuItem & {
  createdBy: { name: string } | null;
  updatedBy: { name: string } | null;
};
type MenuWithItems = Menu & { items: (MenuItemWithUsers & { children: MenuItemWithUsers[] })[] };

interface FormState {
  id: string;
  label: string;
  href: string;
  /** Konteks tambah submenu — null berarti edit/tambah item level atas */
  parentId: string | null;
}

/* ─── Halaman Manajemen Menu Navigasi Admin (tersambung Prisma) ─── */
export default function MenuManager({
  header,
  footer,
}: {
  header: MenuWithItems | null;
  footer: MenuWithItems | null;
}) {
  const defaultTab = header ? "header" : "footer";

  return (
    <div className="p-6 lg:p-8">
      <Tabs defaultValue={defaultTab}>
        <TabsList className="rounded-xl mb-6 bg-gray-200">
          <TabsTrigger value="header" className="rounded-lg">Menu Header</TabsTrigger>
          <TabsTrigger value="footer" className="rounded-lg">Menu Footer</TabsTrigger>
        </TabsList>
        <TabsContent value="header">
          {header ? <MenuList menu={header} /> : <EmptyMenu menuKey="header" />}
        </TabsContent>
        <TabsContent value="footer">
          {footer ? <MenuList menu={footer} /> : <EmptyMenu menuKey="footer" />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyMenu({ menuKey }: { menuKey: string }) {
  return (
    <div className="bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
      <MenuIcon className="mx-auto mb-2 text-gray-300" size={28} />
      Menu &quot;{menuKey}&quot; belum ada di database.
    </div>
  );
}

function MenuList({ menu }: { menu: MenuWithItems }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState | null>(null);

  const openAdd = (parentId: string | null) => setForm({ id: "", label: "", href: "", parentId });
  const openEdit = (item: MenuItem) => setForm({ id: item.id, label: item.label, href: item.href, parentId: item.parentId });

  const move = (id: string, direction: "up" | "down") => {
    startTransition(async () => {
      const res = await moveMenuItemAction(id, direction);
      if (res.ok) router.refresh();
      else swalError(res.message);
    });
  };

  const save = () => {
    if (!form) return;
    if (!form.label.trim() || !form.href.trim()) {
      swalError("Label dan URL wajib diisi");
      return;
    }
    startTransition(async () => {
      const res = form.id
        ? await updateMenuItemAction(form.id, { label: form.label, href: form.href })
        : await createMenuItemAction(menu.key as "header" | "footer", {
            label: form.label,
            href: form.href,
            parentId: form.parentId,
          });

      if (res.ok) {
        swalSuccess(form.id ? "Menu diperbarui" : "Menu baru ditambahkan");
        setForm(null);
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const remove = async (item: MenuItem) => {
    const confirmed = await swalConfirmDelete(`Menu "${item.label}"`);
    if (!confirmed) return;
    startTransition(async () => {
      const res = await deleteMenuItemAction(item.id);
      if (res.ok) {
        swalSuccess("Menu dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-admin-line overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-admin-line">
          <div>
            <h2 className="font-bold text-sm text-gray-900">{menu.name}</h2>
            <p className="text-xs text-gray-400">{menu.items.length} menu utama</p>
          </div>
          <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => openAdd(null)}>
            <Plus size={14} />
            Tambah Menu Utama
          </Button>
        </div>

        <ul className="divide-y divide-gray-50">
          {menu.items.map((item, index) => (
            <li key={item.id}>
              <MenuRow
                item={item}
                isPending={isPending}
                canMoveUp={index > 0}
                canMoveDown={index < menu.items.length - 1}
                onMove={(dir) => move(item.id, dir)}
                onEdit={() => openEdit(item)}
                onDelete={() => remove(item)}
                onAddChild={() => openAdd(item.id)}
              />
              {item.children.length > 0 && (
                <ul className="bg-gray-50/40 divide-y divide-gray-100">
                  {item.children.map((child, cIndex) => (
                    <li key={child.id} className="pl-8">
                      <MenuRow
                        item={child}
                        isChild
                        isPending={isPending}
                        canMoveUp={cIndex > 0}
                        canMoveDown={cIndex < item.children.length - 1}
                        onMove={(dir) => move(child.id, dir)}
                        onEdit={() => openEdit(child)}
                        onDelete={() => remove(child)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          {menu.items.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-gray-400">Belum ada menu.</li>
          )}
        </ul>
      </div>

      {/* ─── Dialog tambah/edit menu ─── */}
      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          {form && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                {form.id ? "Edit Menu" : form.parentId ? "Tambah Submenu" : "Tambah Menu Utama"}
              </DialogTitle>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="m-label" className="text-sm font-semibold text-gray-700">Label</Label>
                  <Input
                    id="m-label"
                    className="mt-1.5 rounded-lg"
                    placeholder="mis. Tentang Kami"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="m-href" className="text-sm font-semibold text-gray-700">URL</Label>
                  <Input
                    id="m-href"
                    className="mt-1.5 rounded-lg font-mono text-xs"
                    placeholder="/tentang-kami"
                    value={form.href}
                    onChange={(e) => setForm({ ...form, href: e.target.value })}
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function MenuRow({
  item,
  isChild = false,
  isPending,
  canMoveUp,
  canMoveDown,
  onMove,
  onEdit,
  onDelete,
  onAddChild,
}: {
  item: MenuItemWithUsers;
  isChild?: boolean;
  isPending: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: "up" | "down") => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddChild?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      {isChild && <CornerDownRight size={14} className="text-gray-300 flex-shrink-0" />}
      <div className="flex flex-col flex-shrink-0">
        <button
          disabled={!canMoveUp || isPending}
          onClick={() => onMove("up")}
          className="text-gray-300 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-300 transition-colors"
          aria-label="Pindah ke atas"
        >
          <ChevronUp size={13} />
        </button>
        <button
          disabled={!canMoveDown || isPending}
          onClick={() => onMove("down")}
          className="text-gray-300 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-300 transition-colors"
          aria-label="Pindah ke bawah"
        >
          <ChevronDown size={13} />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
        <p className="text-xs text-gray-400 font-mono truncate">{item.href}</p>
        <p className="text-[11px] text-gray-300 truncate">
          Dibuat: {item.createdBy?.name ?? "—"} · Diubah: {item.updatedBy?.name ?? "—"}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {onAddChild && (
          <button
            onClick={onAddChild}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label="Tambah submenu"
            title="Tambah submenu"
          >
            <Plus size={14} />
          </button>
        )}
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
          aria-label="Edit menu"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Hapus menu"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
