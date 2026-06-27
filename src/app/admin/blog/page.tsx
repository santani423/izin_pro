"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AdminHeader from "@/components/admin/AdminHeader";
import { BLOG_POSTS } from "@/lib/constants";

/* ─── Halaman Manajemen Blog Admin ─── */
export default function AdminBlogPage() {
  const [search, setSearch] = useState("");

  const filtered = BLOG_POSTS.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <AdminHeader title="Blog & Artikel" subtitle="Kelola semua artikel dan konten blog" />

      <div className="p-6 lg:p-8 space-y-6">
        {/* ─── Toolbar ─── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari artikel..."
              className="pl-9 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              <Filter size={14} />
              Filter
            </Button>
            <Button size="sm" className="gap-1.5 rounded-xl">
              <Plus size={14} />
              Artikel Baru
            </Button>
          </div>
        </div>

        {/* ─── Tabel Artikel ─── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Judul
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Kategori
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Tanggal
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${post.gradient} flex-shrink-0`} />
                        <div>
                          <div className="font-medium text-gray-900 line-clamp-1 max-w-[240px]">
                            {post.title}
                          </div>
                          <div className="text-xs text-gray-400">{post.views} views</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs rounded-lg">
                        {post.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 hidden lg:table-cell">
                      {post.date}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Published
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer tabel */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan {filtered.length} dari {BLOG_POSTS.length} artikel
            </p>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1 rounded-lg text-xs text-gray-500 border border-gray-200 hover:border-primary hover:text-primary transition-colors">
                Sebelumnya
              </button>
              <button className="px-3 py-1 rounded-lg text-xs bg-primary text-white">1</button>
              <button className="px-3 py-1 rounded-lg text-xs text-gray-500 border border-gray-200 hover:border-primary hover:text-primary transition-colors">
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
