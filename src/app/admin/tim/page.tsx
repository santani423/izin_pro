"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { TEAM_MEMBERS } from "@/lib/constants";

/* ─── Data anggota tim diperluas dengan departemen & status ─── */
const teamData = TEAM_MEMBERS.map((m, i) => ({
  ...m,
  id: String(i + 1),
  department: ["Manajemen", "Legal", "Konsultasi", "Operasional", "Business Dev", "Customer Relations"][i] ?? "Lainnya",
  email: `${m.initials.toLowerCase()}@izinpro.co.id`,
  phone: `+62 812-000-000${i + 1}`,
  location: ["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Medan"][i] ?? "Jakarta",
  active: true,
}));

type MemberRow = (typeof teamData)[number];

const GRADIENTS = [
  "from-emerald-400 to-green-600",
  "from-sky-400 to-blue-600",
  "from-amber-400 to-orange-600",
  "from-violet-400 to-purple-600",
  "from-rose-400 to-red-500",
];

const initialsOf = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const emptyForm = (): MemberRow => ({
  id: "",
  name: "",
  role: "",
  initials: "",
  gradient: GRADIENTS[0],
  department: "Lainnya",
  email: "",
  phone: "",
  location: "",
  active: true,
});

/* ─── Halaman Manajemen Tim Admin ─── */
export default function AdminTimPage() {
  const [members, setMembers] = useState(teamData);
  const [form, setForm] = useState<MemberRow | null>(null);
  const [toDelete, setToDelete] = useState<MemberRow | null>(null);

  const toggleActive = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m)),
    );
  };

  const save = () => {
    if (!form) return;
    if (!form.name.trim() || !form.role.trim()) {
      toast.error("Nama dan jabatan wajib diisi");
      return;
    }
    const next = { ...form, initials: initialsOf(form.name) };
    if (form.id) {
      setMembers((prev) => prev.map((m) => (m.id === form.id ? next : m)));
      toast.success("Anggota tim diperbarui");
    } else {
      setMembers((prev) => [
        ...prev,
        { ...next, id: String(Date.now()), gradient: GRADIENTS[prev.length % GRADIENTS.length] },
      ]);
      toast.success("Anggota tim ditambahkan");
    }
    setForm(null);
  };

  return (
    <>

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{members.length} anggota tim</p>
          <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => setForm(emptyForm())}>
            <Plus size={14} />
            Tambah Anggota
          </Button>
        </div>

        {/* ─── Grid Kartu Tim ─── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className={`relative bg-white rounded-2xl border border-admin-line p-5 transition-all ${
                !member.active ? "opacity-50" : ""
              }`}
            >
              {/* Menu aksi */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors outline-none"
                  aria-label="Menu anggota"
                >
                  <MoreHorizontal size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  <DropdownMenuItem className="text-sm cursor-pointer gap-2" onClick={() => setForm(member)}>
                    <Pencil size={13} className="text-gray-400" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-sm text-red-500 cursor-pointer gap-2 focus:text-red-500 focus:bg-red-50"
                    onClick={() => setToDelete(member)}
                  >
                    <Trash2 size={13} />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Avatar */}
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}
              >
                {member.initials}
              </div>

              {/* Nama & jabatan */}
              <div className="mt-4">
                <div className="font-bold text-gray-900 text-lg truncate">{member.name}</div>
                <div className="text-sm text-gray-500 mt-0.5">{member.role}</div>
                <Badge
                  variant="secondary"
                  className="mt-2 text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 font-medium w-fit"
                >
                  {member.department}
                </Badge>
              </div>

              {/* Email */}
              <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="text-xs text-gray-400">Email</div>
                <div className="text-sm font-semibold text-gray-900 truncate mt-0.5">{member.email}</div>
              </div>

              {/* Phone & Location */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-400">Phone</div>
                  <div className="text-sm font-semibold text-gray-900 mt-0.5">{member.phone}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Location</div>
                  <div className="text-sm font-semibold text-gray-900 mt-0.5">{member.location}</div>
                </div>
              </div>

              {/* Status aktif */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-admin-line">
                <Switch
                  checked={member.active}
                  onCheckedChange={() => toggleActive(member.id)}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-xs font-medium text-gray-600">
                  {member.active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Dialog tambah/edit anggota ─── */}
        <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
          <DialogContent className="sm:max-w-md">
            {form && (
              <>
                <DialogTitle className="text-base font-bold text-gray-900">
                  {form.id ? "Edit Anggota Tim" : "Tambah Anggota Tim"}
                </DialogTitle>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="t-name" className="text-sm font-semibold text-gray-700">Nama</Label>
                      <Input
                        id="t-name"
                        className="mt-1.5 rounded-lg"
                        placeholder="Nama lengkap"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="t-role" className="text-sm font-semibold text-gray-700">Jabatan</Label>
                      <Input
                        id="t-role"
                        className="mt-1.5 rounded-lg"
                        placeholder="mis. Legal Consultant"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="t-dept" className="text-sm font-semibold text-gray-700">Departemen</Label>
                    <Input
                      id="t-dept"
                      className="mt-1.5 rounded-lg"
                      placeholder="mis. Legal"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="t-email" className="text-sm font-semibold text-gray-700">Email</Label>
                      <Input
                        id="t-email"
                        type="email"
                        className="mt-1.5 rounded-lg"
                        placeholder="nama@izinpro.co.id"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="t-phone" className="text-sm font-semibold text-gray-700">Telepon</Label>
                      <Input
                        id="t-phone"
                        className="mt-1.5 rounded-lg"
                        placeholder="+62 812-xxxx-xxxx"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="t-location" className="text-sm font-semibold text-gray-700">Lokasi</Label>
                    <Input
                      id="t-location"
                      className="mt-1.5 rounded-lg"
                      placeholder="mis. Jakarta"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setForm(null)}>
                    Batal
                  </Button>
                  <Button className="flex-1 rounded-lg" onClick={save}>
                    Simpan
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
          itemLabel={toDelete ? `Anggota tim "${toDelete.name}"` : ""}
          onConfirm={() => {
            if (toDelete) {
              setMembers((prev) => prev.filter((m) => m.id !== toDelete.id));
              toast.success("Anggota tim dihapus");
            }
          }}
        />
      </div>
    </>
  );
}
