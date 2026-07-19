"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import type { Role, User } from "@prisma/client";
import { canManageUser, visibleUserRoles } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { cn } from "@/lib/utils";
import {
  createUserAction,
  deleteUserAction,
  toggleUserActiveAction,
  updateUserAction,
} from "@/lib/actions/users";

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
  AUTHOR: "Author",
};

const ROLE_STYLE: Record<Role, { badge: string; avatar: string }> = {
  SUPER_ADMIN: { badge: "bg-violet-50 text-violet-600", avatar: "bg-violet-100 text-violet-600" },
  ADMIN: { badge: "bg-primary/10 text-primary", avatar: "bg-primary/10 text-primary" },
  EDITOR: { badge: "bg-sky-50 text-sky-600", avatar: "bg-sky-100 text-sky-600" },
  AUTHOR: { badge: "bg-gray-100 text-gray-600", avatar: "bg-gray-100 text-gray-600" },
};

const ROLE_DESC: Record<Role, string> = {
  SUPER_ADMIN: "Akses penuh ke semua menu, termasuk Pengaturan & Pengguna",
  ADMIN: "Akses semua menu, tapi Pengaturan hanya bisa dilihat (view-only)",
  EDITOR: "Akses semua menu kecuali Pengaturan & Pengguna",
  AUTHOR: "Hanya bisa tulis & publish artikel miliknya sendiri, tidak bisa edit milik orang lain",
};

const initialsOf = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

const formatDate = (d: Date) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

interface FormState {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean;
  password: string;
}

const emptyForm = (): FormState => ({
  id: "",
  name: "",
  email: "",
  phone: "",
  role: "EDITOR",
  isActive: true,
  password: "",
});

type UserWithAudit = User & {
  createdBy: { name: string } | null;
  updatedBy: { name: string } | null;
};

/* ─── Halaman Manajemen Pengguna & Role Admin (tersambung Prisma/Better Auth) ─── */
export default function UsersManager({
  initialUsers,
  currentUserId,
  currentUserRole,
}: {
  initialUsers: UserWithAudit[];
  currentUserId: string;
  currentUserRole: Role;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Role | "Semua">("Semua");
  const [form, setForm] = useState<FormState | null>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [showPass, setShowPass] = useState(false);

  /* Cuma Super Admin yg boleh kelola akun Admin/Editor/Author (Super Admin
   * lain gak pernah kelihatan di list ini) — samain dgn guard di
   * src/lib/actions/users.ts */
  const canManage = (u: User) => canManageUser(currentUserRole, u.role);
  const selectableRoles = visibleUserRoles(currentUserRole);

  const filtered = initialUsers.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone ?? "").includes(q);
    const matchFilter = filter === "Semua" || u.role === filter;
    return matchSearch && matchFilter;
  });

  const openEdit = (u: User) => {
    setForm({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? "",
      role: u.role,
      isActive: u.isActive,
      password: "",
    });
  };

  const toggleActive = (u: User) => {
    startTransition(async () => {
      const res = await toggleUserActiveAction(u.id, !u.isActive);
      if (res.ok) {
        toast.success("Status pengguna diperbarui");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const save = () => {
    if (!form) return;
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Nama dan email wajib diisi");
      return;
    }
    if (!form.id && form.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    startTransition(async () => {
      const res = form.id
        ? await updateUserAction(form.id, {
            name: form.name,
            email: form.email,
            phone: form.phone,
            role: form.role,
            isActive: form.isActive,
          })
        : await createUserAction({
            name: form.name,
            email: form.email,
            phone: form.phone,
            role: form.role,
            isActive: form.isActive,
            password: form.password,
          });

      if (res.ok) {
        toast.success(form.id ? "Pengguna diperbarui" : "Pengguna baru ditambahkan");
        setForm(null);
        setShowPass(false);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const remove = () => {
    if (!toDelete) return;
    startTransition(async () => {
      const res = await deleteUserAction(toDelete.id);
      if (res.ok) {
        toast.success("Pengguna dihapus");
        router.refresh();
      } else {
        toast.error(res.message);
      }
      setToDelete(null);
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ─── Toolbar: cari + filter role ─── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari nama atau email..."
              className="pl-9 rounded-xl h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-gray-200 rounded-xl w-fit overflow-x-auto">
            {(["Semua", ...selectableRoles] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  filter === r ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700",
                )}
              >
                {r === "Semua" ? r : ROLE_LABEL[r]}
              </button>
            ))}
          </div>
        </div>
        <Button size="sm" className="gap-1.5 rounded-xl flex-shrink-0" onClick={() => setForm(emptyForm())}>
          <Plus size={14} />
          Tambah Pengguna
        </Button>
      </div>

      {/* ─── Tabel Pengguna ─── */}
      <div className="bg-white rounded-2xl border border-admin-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-line bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengguna</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">No. HP</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Dibuat</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} className={cn("hover:bg-gray-50/50 transition-colors", !u.isActive && "opacity-60")}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold flex-shrink-0", ROLE_STYLE[u.role].avatar)}>
                        {initialsOf(u.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {u.name}
                          {u.id === currentUserId && <span className="ml-1.5 text-xs text-gray-400">(Anda)</span>}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge className={cn("text-[11px] px-2.5 py-0.5 font-medium border-0", ROLE_STYLE[u.role].badge)}>
                      {ROLE_LABEL[u.role]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-center text-gray-500 whitespace-nowrap">{u.phone ?? "-"}</td>
                  <td className="px-5 py-3.5 text-gray-500 hidden lg:table-cell whitespace-nowrap">
                    <div>{formatDate(u.createdAt)}</div>
                    <div className="text-[11px] text-gray-400">
                      oleh {u.createdBy?.name ?? "—"}
                      {u.updatedBy && u.updatedBy.name !== u.createdBy?.name && (
                        <> · diubah {u.updatedBy.name}</>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={u.isActive}
                        disabled={isPending || u.id === currentUserId || !canManage(u)}
                        onCheckedChange={() => toggleActive(u)}
                        className="data-[state=checked]:bg-primary"
                      />
                      <span className="text-xs font-medium text-gray-600 w-14 whitespace-nowrap">{u.isActive ? "Aktif" : "Nonaktif"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end">
                      {canManage(u) ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors outline-none"
                            aria-label="Menu pengguna"
                          >
                            <MoreHorizontal size={16} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl">
                            <DropdownMenuItem className="text-sm cursor-pointer gap-2" onClick={() => openEdit(u)}>
                              <Pencil size={13} className="text-gray-400" />
                              Edit
                            </DropdownMenuItem>
                            {u.id !== currentUserId && (
                              <DropdownMenuItem
                                className="text-sm text-red-500 cursor-pointer gap-2 focus:text-red-500 focus:bg-red-50"
                                onClick={() => setToDelete(u)}
                              >
                                <Trash2 size={13} />
                                Hapus
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span
                          className="p-1.5 text-gray-300"
                          title="Anda tidak punya izin mengelola akun ini"
                        >
                          <Lock size={14} />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                    Tidak ada pengguna yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-admin-line">
          <p className="text-xs text-gray-400">
            Menampilkan {filtered.length} dari {initialUsers.length} pengguna
          </p>
        </div>
      </div>

      {/* ─── Dialog tambah/edit pengguna ─── */}
      <Dialog
        open={form !== null}
        onOpenChange={(o) => {
          if (!o) {
            setForm(null);
            setShowPass(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          {form && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                {form.id ? "Edit Pengguna" : "Tambah Pengguna"}
              </DialogTitle>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="u-name" className="text-sm font-semibold text-gray-700">Nama Lengkap</Label>
                  <Input
                    id="u-name"
                    className="mt-1.5 rounded-lg"
                    placeholder="Nama lengkap"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="u-email" className="text-sm font-semibold text-gray-700">Email</Label>
                    <Input
                      id="u-email"
                      type="email"
                      className="mt-1.5 rounded-lg"
                      placeholder="nama@izinpro.co.id"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="u-phone" className="text-sm font-semibold text-gray-700">No. HP</Label>
                    <Input
                      id="u-phone"
                      type="tel"
                      className="mt-1.5 rounded-lg"
                      placeholder="0812-xxxx-xxxx"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Role</Label>
                  <Select
                    items={Object.fromEntries(selectableRoles.map((r) => [r, ROLE_LABEL[r]]))}
                    value={form.role}
                    onValueChange={(v) => v && setForm({ ...form, role: v as Role })}
                  >
                    <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} align="start">
                      {selectableRoles.map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1.5 text-xs text-gray-400">{ROLE_DESC[form.role]}</p>
                </div>

                {/* Password sementara — cuma saat tambah pengguna baru (bukan self-register) */}
                {!form.id && (
                  <div>
                    <Label htmlFor="u-password" className="text-sm font-semibold text-gray-700">Password Sementara</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="u-password"
                        type={showPass ? "text" : "password"}
                        className="rounded-lg pr-10"
                        placeholder="Minimal 6 karakter"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400">Pengguna akan diminta ganti password saat login pertama.</p>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-lg border border-admin-line px-3.5 py-2.5">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Status Aktif</div>
                    <div className="text-xs text-gray-400">Nonaktifkan tanpa menghapus akun</div>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                    className="data-[state=checked]:bg-primary"
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

      {/* ─── Konfirmasi hapus ─── */}
      <ConfirmDeleteDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        itemLabel={toDelete ? `Pengguna "${toDelete.name}"` : ""}
        onConfirm={remove}
      />
    </div>
  );
}
