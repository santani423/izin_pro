"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminHeader from "@/components/admin/AdminHeader";
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

/* ─── Halaman Manajemen Tim Admin ─── */
export default function AdminTimPage() {
  const [members, setMembers] = useState(teamData);

  const toggleActive = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m)),
    );
  };

  return (
    <>
      <AdminHeader title="Tim" subtitle="Kelola profil anggota tim IzinPro" />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{members.length} anggota tim</p>
          <Button size="sm" className="gap-1.5 rounded-xl">
            <Plus size={14} />
            Tambah Anggota
          </Button>
        </div>

        {/* ─── Grid Kartu Tim ─── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className={`bg-white rounded-2xl border border-gray-100 p-5 transition-all ${
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
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
