"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { TEAM_MEMBERS } from "@/lib/constants";

/* ─── Data anggota tim diperluas dengan departemen & status ─── */
const teamData = TEAM_MEMBERS.map((m, i) => ({
  ...m,
  id: String(i + 1),
  department: ["Manajemen", "Legal", "Konsultasi", "Operasional", "Business Dev", "Customer Relations"][i] ?? "Lainnya",
  email: `${m.initials.toLowerCase()}@izinpro.co.id`,
  phone: `+62 812-000-000${i + 1}`,
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
              className={`bg-white rounded-2xl border border-admin-line p-5 transition-all ${
                !member.active ? "opacity-50" : ""
              }`}
            >
              {/* Avatar & nama */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
                >
                  {member.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{member.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{member.role}</div>
                  <Badge
                    variant="secondary"
                    className="mt-1.5 text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 font-medium"
                  >
                    {member.department}
                  </Badge>
                </div>
              </div>

              {/* Kontak */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone size={12} className="text-gray-400 flex-shrink-0" />
                  <span>{member.phone}</span>
                </div>
              </div>

              {/* Aksi */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <button
                  onClick={() => toggleActive(member.id)}
                  className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                    member.active
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {member.active ? "Aktif" : "Nonaktif"}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setForm(member)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                    aria-label="Edit anggota"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setToDelete(member)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Hapus anggota"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
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
