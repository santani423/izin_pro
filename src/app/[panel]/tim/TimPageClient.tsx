"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus, Pencil, Trash2, MoreHorizontal, Search, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, ImagePlus,
} from "lucide-react";
import type { TeamMember } from "@prisma/client";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
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
import { cn } from "@/lib/utils";
import {
  createTeamMemberAction,
  updateTeamMemberAction,
  deleteTeamMemberAction,
  toggleTeamMemberActiveAction,
  reorderTeamMembersAction,
  uploadTeamPhotoAction,
} from "@/lib/actions/team";

type MemberRow = TeamMember & { photoMedia: { url: string } | null };

const initialsOf = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

interface MemberFormState {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  photoUrl: string | null;
  photoMediaId: string | null;
  isActive: boolean;
}

function emptyForm(): MemberFormState {
  return {
    id: "",
    name: "",
    role: "",
    department: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    photoUrl: null,
    photoMediaId: null,
    isActive: true,
  };
}

function toForm(m: MemberRow): MemberFormState {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    department: m.department ?? "",
    email: m.email ?? "",
    phone: m.phone ?? "",
    location: m.location ?? "",
    linkedinUrl: m.linkedinUrl ?? "",
    photoUrl: m.photoMedia?.url ?? null,
    photoMediaId: m.photoMediaId,
    isActive: m.isActive,
  };
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function Pagination({
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}) {
  const [jumpValue, setJumpValue] = useState("");

  const jumpToPage = () => {
    const n = Number(jumpValue);
    if (Number.isInteger(n) && n >= 1 && n <= totalPages) {
      onPageChange(n);
    }
    setJumpValue("");
  };

  return (
    <nav aria-label="Navigasi halaman" className="flex flex-wrap items-center justify-center gap-2 pt-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex items-center gap-1 rounded-lg border border-admin-line bg-white px-2.5 py-1.5 text-xs font-medium text-black transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronLeft size={14} aria-hidden="true" />
        Sebelumnya
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          aria-current={n === page ? "page" : undefined}
          onClick={() => onPageChange(n)}
          className={cn(
            "size-8 rounded-lg text-xs font-semibold transition-colors",
            n === page
              ? "bg-primary text-white"
              : "border border-admin-line bg-white text-black hover:border-primary/40 hover:text-primary",
          )}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex items-center gap-1 rounded-lg border border-admin-line bg-white px-2.5 py-1.5 text-xs font-medium text-black transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
      >
        Selanjutnya
        <ChevronRight size={14} aria-hidden="true" />
      </button>

      {/* Loncat langsung ke halaman tertentu */}
      <div className="flex items-center gap-1.5 ml-1">
        <span className="text-xs text-black">Ke halaman</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && jumpToPage()}
          placeholder={String(page)}
          className="h-8 w-14 rounded-lg border border-admin-line bg-white px-2 text-center text-xs text-black outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Loncat ke nomor halaman"
        />
        <button
          type="button"
          onClick={jumpToPage}
          className="rounded-lg border border-admin-line bg-white px-2.5 py-1.5 text-xs font-medium text-black transition-colors hover:border-primary/40 hover:text-primary"
        >
          Go
        </button>
      </div>

      {/* Ukuran halaman */}
      <div className="flex items-center gap-1.5 ml-1">
        <span className="text-xs text-black">per halaman</span>
        <Select
          items={Object.fromEntries(PAGE_SIZE_OPTIONS.map((n) => [String(n), String(n)]))}
          value={String(pageSize)}
          onValueChange={(v) => v && onPageSizeChange(Number(v))}
        >
          <SelectTrigger className="h-8 w-16 rounded-lg border border-admin-line bg-white px-2 text-xs font-medium text-black hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="end">
            {PAGE_SIZE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </nav>
  );
}

/* ─── Halaman Manajemen Tim Admin ─── */
export default function TimPageClient({ members: initialMembers }: { members: MemberRow[] }) {
  const router = useRouter();
  // Sinkron ulang tiap kali router.refresh() ngasih initialMembers baru —
  // pola resmi React "adjusting state when a prop changes", bukan useEffect.
  const [prevInitialMembers, setPrevInitialMembers] = useState(initialMembers);
  const [members, setMembers] = useState(initialMembers);
  if (initialMembers !== prevInitialMembers) {
    setPrevInitialMembers(initialMembers);
    setMembers(initialMembers);
  }

  const [form, setForm] = useState<MemberFormState | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [isReordering, startReorderTransition] = useTransition();

  const toggleActive = (id: string, current: boolean) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, isActive: !current } : m)));
    startSaveTransition(async () => {
      const res = await toggleTeamMemberActiveAction(id, !current);
      if (!res.ok) {
        swalError(res.message);
        setMembers(initialMembers);
      }
    });
  };

  const uploadPhoto = async (file: File) => {
    if (!form) return;
    setIsUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await uploadTeamPhotoAction(fd);
      if (res.ok) {
        setForm({ ...form, photoUrl: res.url, photoMediaId: res.mediaId });
      } else {
        swalError(res.message);
      }
    } catch {
      swalError("Gagal mengunggah foto. Cek koneksi lalu coba lagi.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const save = () => {
    if (!form) return;
    if (!form.name.trim() || !form.role.trim()) {
      swalError("Nama dan jabatan wajib diisi");
      return;
    }
    startSaveTransition(async () => {
      try {
        const payload = {
          name: form.name,
          role: form.role,
          department: form.department || null,
          email: form.email || null,
          phone: form.phone || null,
          location: form.location || null,
          linkedinUrl: form.linkedinUrl || null,
          photoMediaId: form.photoMediaId,
        };
        const res = form.id
          ? await updateTeamMemberAction(form.id, payload)
          : await createTeamMemberAction(payload);
        if (res.ok) {
          swalSuccess(form.id ? "Anggota tim diperbarui" : "Anggota tim ditambahkan");
          setForm(null);
          router.refresh();
        } else {
          swalError(res.message);
        }
      } catch {
        swalError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
      }
    });
  };

  const removeMember = async (member: MemberRow) => {
    const confirmed = await swalConfirmDelete(`Anggota tim "${member.name}"`);
    if (!confirmed) return;
    startSaveTransition(async () => {
      const res = await deleteTeamMemberAction(member.id);
      if (res.ok) {
        swalSuccess("Anggota tim dihapus");
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const filtered = members.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      (m.department ?? "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  // Urutan cuma bisa diubah kalau daftar gak lagi difilter/dipaginasi — sama
  // pola dgn LayananManager (drag-reorder di sana), di sini pakai tombol
  // naik/turun krn layout kartu Tim berupa grid multi-kolom (bukan list
  // vertikal 1-kolom), yg gak cocok sama strategi sort vertikal SortableList.
  const canReorder = search.trim() === "" && totalPages === 1;

  const moveMember = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= members.length) return;
    const next = [...members];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setMembers(next);
    startReorderTransition(async () => {
      const res = await reorderTeamMembersAction(next.map((m) => m.id));
      if (!res.ok) {
        swalError(res.message);
        setMembers(initialMembers);
      }
    });
  };

  return (
    <>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex gap-2 flex-1 sm:max-w-sm">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari nama, jabatan, atau departemen..."
                className="pl-9 rounded-xl h-10"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <Button size="sm" className="gap-1.5 rounded-xl flex-shrink-0" onClick={() => setForm(emptyForm())}>
            <Plus size={14} />
            Tambah Anggota
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{filtered.length} anggota tim</p>
          {!canReorder && filtered.length > 0 && (
            <p className="text-xs text-gray-400">
              Kosongkan pencarian &amp; tampilkan &ldquo;Semua&rdquo; per halaman untuk mengurutkan.
            </p>
          )}
        </div>

        {/* ─── Grid Kartu Tim ─── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageItems.map((member, index) => (
            <div
              key={member.id}
              className={`relative bg-white rounded-2xl border border-admin-line p-5 transition-all ${
                !member.isActive ? "opacity-50" : ""
              }`}
            >
              {/* Naik/turun urutan */}
              {canReorder && (
                <div className="absolute top-4 left-4 flex flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0 || isReordering}
                    onClick={() => moveMember(index, -1)}
                    className="p-0.5 rounded text-gray-400 hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Naikkan urutan"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={index === pageItems.length - 1 || isReordering}
                    onClick={() => moveMember(index, 1)}
                    className="p-0.5 rounded text-gray-400 hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Turunkan urutan"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              )}

              {/* Menu aksi */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors outline-none"
                  aria-label="Menu anggota"
                >
                  <MoreHorizontal size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  <DropdownMenuItem className="text-sm cursor-pointer gap-2" onClick={() => setForm(toForm(member))}>
                    <Pencil size={13} className="text-gray-400" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-sm text-red-500 cursor-pointer gap-2 focus:text-red-500 focus:bg-red-50"
                    onClick={() => removeMember(member)}
                  >
                    <Trash2 size={13} />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Avatar */}
              {member.photoMedia?.url ? (
                <div className="relative size-16 rounded-full overflow-hidden flex-shrink-0">
                  <Image src={member.photoMedia.url} alt={member.name} fill sizes="64px" className="object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {initialsOf(member.name)}
                </div>
              )}

              {/* Nama & jabatan */}
              <div className="mt-4">
                <div className="font-bold text-gray-900 text-lg truncate">{member.name}</div>
                <div className="text-sm text-gray-500 mt-0.5">{member.role}</div>
                {member.department && (
                  <Badge
                    variant="secondary"
                    className="mt-2 text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 font-medium w-fit"
                  >
                    {member.department}
                  </Badge>
                )}
              </div>

              {/* Email */}
              {member.email && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <div className="text-xs text-gray-400">Email</div>
                  <div className="text-sm font-semibold text-gray-900 truncate mt-0.5">{member.email}</div>
                </div>
              )}

              {/* Phone & Location */}
              {(member.phone || member.location) && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-400">Phone</div>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5">{member.phone || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Location</div>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5">{member.location || "-"}</div>
                  </div>
                </div>
              )}

              {/* Status aktif */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-admin-line">
                <Switch
                  checked={member.isActive}
                  onCheckedChange={() => toggleActive(member.id, member.isActive)}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-xs font-medium text-gray-600">
                  {member.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
          ))}
          {pageItems.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl border border-admin-line px-5 py-10 text-center text-sm text-gray-400">
              Tidak ada anggota tim yang cocok.
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">
          Menampilkan {pageItems.length} dari {filtered.length} anggota tim
        </p>

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />

        {/* ─── Dialog tambah/edit anggota ─── */}
        <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
          <DialogContent className="sm:max-w-md">
            {form && (
              <>
                <DialogTitle className="text-base font-bold text-gray-900">
                  {form.id ? "Edit Anggota Tim" : "Tambah Anggota Tim"}
                </DialogTitle>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                      {form.photoUrl ? (
                        <Image src={form.photoUrl} alt="" width={64} height={64} unoptimized className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlus size={18} className="text-gray-300" />
                      )}
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                      <ImagePlus size={14} />
                      {isUploadingPhoto ? "Mengunggah..." : "Pilih Foto"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={isUploadingPhoto}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadPhoto(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
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
                    <Label htmlFor="t-dept" className="text-sm font-semibold text-gray-700">Departemen (opsional)</Label>
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
                      <Label htmlFor="t-email" className="text-sm font-semibold text-gray-700">Email (opsional)</Label>
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
                      <Label htmlFor="t-phone" className="text-sm font-semibold text-gray-700">Telepon (opsional)</Label>
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
                    <Label htmlFor="t-location" className="text-sm font-semibold text-gray-700">Lokasi (opsional)</Label>
                    <Input
                      id="t-location"
                      className="mt-1.5 rounded-lg"
                      placeholder="mis. Jakarta"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="t-linkedin" className="text-sm font-semibold text-gray-700">LinkedIn (opsional)</Label>
                    <Input
                      id="t-linkedin"
                      className="mt-1.5 rounded-lg"
                      placeholder="https://linkedin.com/in/..."
                      value={form.linkedinUrl}
                      onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                    />
                    <p className="mt-1 text-xs text-gray-400">Kosongkan untuk sembunyikan tombol LinkedIn di halaman Tentang Kami.</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setForm(null)}>
                    Batal
                  </Button>
                  <Button className="flex-1 rounded-lg" onClick={save} disabled={isSaving}>
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
