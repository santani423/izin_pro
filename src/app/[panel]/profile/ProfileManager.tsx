"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Save, User, KeyRound, Camera } from "lucide-react";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import type { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { updateProfilePhotoAction, removeProfilePhotoAction } from "@/lib/actions/profile";

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
  AUTHOR: "Author",
};

const initialsOf = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

/* ─── Halaman Profil Saya (tersambung Better Auth) ───
 * Cuma nama & password yg bisa diubah dari sini — email gak ditampilkan
 * sebagai input yg bisa diedit, biar gak ada yg gak sengaja ganti email
 * login sendiri. */
export default function ProfileManager({
  name,
  email,
  role,
  image,
}: {
  name: string;
  email: string;
  role: Role;
  image: string | null;
}) {
  const router = useRouter();
  const [savingName, setSavingName] = useState(false);
  const [fullName, setFullName] = useState(name);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, startPhotoUpload] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const currentPhoto = previewUrl ?? image;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      swalError("Format foto harus PNG, JPG, atau WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      swalError("Ukuran foto maksimal 2MB");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    const formData = new FormData();
    formData.append("photo", file);
    startPhotoUpload(async () => {
      const res = await updateProfilePhotoAction(formData);
      if (res.ok) {
        swalSuccess("Foto profil berhasil diperbarui");
        router.refresh();
      } else {
        swalError(res.message);
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(null);
      }
    });
  };

  const handleRemovePhoto = async () => {
    const confirmed = await swalConfirmDelete("Foto profil Anda");
    if (!confirmed) return;
    startPhotoUpload(async () => {
      const res = await removeProfilePhotoAction();
      if (res.ok) {
        swalSuccess("Foto profil dihapus");
        setPreviewUrl(null);
        router.refresh();
      } else {
        swalError(res.message);
      }
    });
  };

  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const saveName = async () => {
    if (!fullName.trim()) {
      swalError("Nama tidak boleh kosong");
      return;
    }
    setSavingName(true);
    const { error } = await authClient.updateUser({ name: fullName.trim() });
    setSavingName(false);
    if (error) {
      swalError(error.message ?? "Gagal memperbarui nama");
      return;
    }
    swalSuccess("Nama berhasil diperbarui");
    router.refresh();
  };

  const savePassword = async () => {
    if (newPassword.length < 6) {
      swalError("Password baru minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      swalError("Konfirmasi password baru tidak cocok");
      return;
    }
    setSavingPassword(true);
    const { error } = await authClient.changePassword({ currentPassword, newPassword });
    setSavingPassword(false);
    if (error) {
      swalError(error.message ?? "Gagal mengubah password");
      return;
    }
    swalSuccess("Password berhasil diubah");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPass(false);
  };

  return (
    <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* ─── Informasi Akun ─── */}
      <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <User size={16} className="text-primary" />
          Informasi Akun
        </h3>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => currentPhoto && setShowPhotoPreview(true)}
              disabled={!currentPhoto}
              className="rounded-full disabled:cursor-default"
              aria-label="Lihat foto profil"
            >
              <Avatar className="size-16">
                {currentPhoto && <AvatarImage src={currentPhoto} alt={name} />}
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {initialsOf(name)}
                </AvatarFallback>
              </Avatar>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="absolute -right-1 -bottom-1 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white ring-2 ring-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              aria-label="Ganti foto profil"
            >
              <Camera size={12} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
              >
                {isUploadingPhoto ? "Mengunggah..." : "Ganti Foto"}
              </button>
              {currentPhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isUploadingPhoto}
                  className="text-sm font-semibold text-red-500 hover:underline disabled:opacity-50"
                >
                  Hapus Foto
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, atau WebP. Maks 2MB.</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-name" className="text-sm font-semibold text-gray-700">Nama Lengkap</Label>
          <Input
            id="p-name"
            className="rounded-xl"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">Email</Label>
          <Input value={email} disabled className="rounded-xl bg-gray-50 text-gray-500" />
          <p className="text-xs text-gray-400">Email tidak bisa diubah sendiri. Hubungi Super Admin/Admin bila perlu diganti.</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">Role</Label>
          <div>
            <Badge className="text-[11px] px-2.5 py-0.5 font-medium border-0 bg-primary/10 text-primary">
              {ROLE_LABEL[role]}
            </Badge>
          </div>
        </div>
        <Button onClick={saveName} disabled={savingName} className="gap-2 rounded-xl">
          <Save size={15} />
          {savingName ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>

      {/* ─── Ubah Password ─── */}
      <div className="bg-white rounded-2xl border border-admin-line p-6 space-y-5">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <KeyRound size={16} className="text-primary" />
          Ubah Password
        </h3>
        <div className="space-y-1.5">
          <Label htmlFor="p-current" className="text-sm font-semibold text-gray-700">Password Saat Ini</Label>
          <Input
            id="p-current"
            type={showPass ? "text" : "password"}
            className="rounded-xl"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-new" className="text-sm font-semibold text-gray-700">Password Baru</Label>
            <div className="relative">
              <Input
                id="p-new"
                type={showPass ? "text" : "password"}
                className="rounded-xl pr-10"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-confirm" className="text-sm font-semibold text-gray-700">Konfirmasi Password Baru</Label>
            <Input
              id="p-confirm"
              type={showPass ? "text" : "password"}
              className="rounded-xl"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={savePassword} disabled={savingPassword} className="gap-2 rounded-xl">
          <Save size={15} />
          {savingPassword ? "Menyimpan..." : "Ubah Password"}
        </Button>
      </div>

      {/* ─── Preview foto profil ukuran penuh ─── */}
      <Dialog open={showPhotoPreview} onOpenChange={setShowPhotoPreview}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="text-base font-bold text-gray-900">Foto Profil</DialogTitle>
          {currentPhoto && (
            <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-gray-100">
              {/* Foto preview bisa berupa blob: URL sementara (sebelum upload
               * selesai) — next/image gak bisa optimize itu, jadi img biasa. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentPhoto} alt={name} className="absolute inset-0 w-full h-full object-cover" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
