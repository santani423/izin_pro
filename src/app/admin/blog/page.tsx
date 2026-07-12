"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { BLOG_POSTS } from "@/lib/constants";

type PostStatus = "Published" | "Draft";

interface PostRow {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  views: string;
  gradient: string;
  status: PostStatus;
}

const GRADIENTS = [
  "from-emerald-400 to-green-600",
  "from-sky-400 to-blue-600",
  "from-amber-400 to-orange-600",
  "from-violet-400 to-purple-600",
  "from-rose-400 to-red-500",
];

const SEED: PostRow[] = BLOG_POSTS.map((p) => ({ ...p, status: "Published" as const }));

const CATEGORIES = [...new Set(SEED.map((p) => p.category))];

const STATUS_ITEMS: Record<PostStatus, string> = { Published: "Published", Draft: "Draft" };

const emptyForm = (): PostRow => ({
  id: "",
  title: "",
  excerpt: "",
  category: CATEGORIES[0] ?? "Umum",
  date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
  views: "0",
  gradient: GRADIENTS[0],
  status: "Draft",
});

/* ─── Halaman Manajemen Blog Admin ─── */
export default function AdminBlogPage() {
  const [posts, setPosts] = useState<PostRow[]>(SEED);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<PostRow | null>(null);
  const [toDelete, setToDelete] = useState<PostRow | null>(null);

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  const save = () => {
    if (!form) return;
    if (!form.title.trim()) {
      toast.error("Judul artikel wajib diisi");
      return;
    }
    if (form.id) {
      setPosts((prev) => prev.map((p) => (p.id === form.id ? form : p)));
      toast.success("Artikel diperbarui");
    } else {
      setPosts((prev) => [
        { ...form, id: String(Date.now()), gradient: GRADIENTS[prev.length % GRADIENTS.length] },
        ...prev,
      ]);
      toast.success("Artikel baru ditambahkan");
    }
    setForm(null);
  };

  return (
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
        <Button size="sm" className="gap-1.5 rounded-xl" onClick={() => setForm(emptyForm())}>
          <Plus size={14} />
          Artikel Baru
        </Button>
      </div>

      {/* ─── Tabel Artikel ─── */}
      <div className="bg-white rounded-2xl border border-admin-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-line bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Kategori</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${post.gradient} flex-shrink-0`} />
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1 max-w-[240px]">{post.title}</div>
                        <div className="text-xs text-gray-400">{post.views} views</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <Badge variant="secondary" className="text-xs rounded-lg">{post.category}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 hidden lg:table-cell">{post.date}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.status === "Published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${post.status === "Published" ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {post.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setForm(post)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                        aria-label="Edit artikel"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setToDelete(post)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Hapus artikel"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                    Tidak ada artikel yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-admin-line">
          <p className="text-xs text-gray-400">
            Menampilkan {filtered.length} dari {posts.length} artikel
          </p>
        </div>
      </div>

      {/* ─── Dialog tambah/edit artikel ─── */}
      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          {form && (
            <>
              <DialogTitle className="text-base font-bold text-gray-900">
                {form.id ? "Edit Artikel" : "Artikel Baru"}
              </DialogTitle>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="b-title" className="text-sm font-semibold text-gray-700">Judul</Label>
                  <Input
                    id="b-title"
                    className="mt-1.5 rounded-lg"
                    placeholder="Judul artikel"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="b-excerpt" className="text-sm font-semibold text-gray-700">Ringkasan</Label>
                  <Textarea
                    id="b-excerpt"
                    rows={3}
                    className="mt-1.5 rounded-lg resize-none"
                    placeholder="Ringkasan singkat artikel..."
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="b-category" className="text-sm font-semibold text-gray-700">Kategori</Label>
                    <Input
                      id="b-category"
                      className="mt-1.5 rounded-lg"
                      placeholder="mis. Perizinan"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Status</Label>
                    <Select
                      items={STATUS_ITEMS}
                      value={form.status}
                      onValueChange={(v) => v && setForm({ ...form, status: v as PostStatus })}
                    >
                      <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false} align="start">
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
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
        itemLabel={toDelete ? `Artikel "${toDelete.title}"` : ""}
        onConfirm={() => {
          if (toDelete) {
            setPosts((prev) => prev.filter((p) => p.id !== toDelete.id));
            toast.success("Artikel dihapus");
          }
        }}
      />
    </div>
  );
}
