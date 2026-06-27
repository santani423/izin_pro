"use client";

import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminHeader from "@/components/admin/AdminHeader";

const pages = [
  { id: "1", title: "Beranda", slug: "/", status: "published", updatedAt: "28 Jun 2026" },
  { id: "2", title: "Tentang Kami", slug: "/tentang-kami", status: "published", updatedAt: "27 Jun 2026" },
  { id: "3", title: "Layanan", slug: "/layanan", status: "published", updatedAt: "26 Jun 2026" },
  { id: "4", title: "Blog", slug: "/blog", status: "published", updatedAt: "25 Jun 2026" },
  { id: "5", title: "Kontak", slug: "/kontak", status: "published", updatedAt: "24 Jun 2026" },
  { id: "6", title: "FAQ", slug: "/faq", status: "draft", updatedAt: "23 Jun 2026" },
  { id: "7", title: "Karir", slug: "/karir", status: "draft", updatedAt: "22 Jun 2026" },
  { id: "8", title: "Kebijakan Privasi", slug: "/kebijakan-privasi", status: "draft", updatedAt: "20 Jun 2026" },
];

const statusStyle: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700",
  draft: "bg-amber-50 text-amber-700",
};

/* ─── Halaman Manajemen Pages Admin ─── */
export default function AdminPagesPage() {
  return (
    <>
      <AdminHeader title="Halaman" subtitle="Kelola semua halaman statis website" />
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{pages.length} halaman</p>
          <Button size="sm" className="gap-1.5 rounded-xl">
            <Plus size={14} />
            Halaman Baru
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Judul</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Diperbarui</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{page.title}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 font-mono hidden md:table-cell">{page.slug}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyle[page.status]}`}>
                      {page.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell">{page.updatedAt}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"><Eye size={14} /></button>
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"><Pencil size={14} /></button>
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
