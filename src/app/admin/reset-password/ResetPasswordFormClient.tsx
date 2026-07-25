"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const invalidLink = !token || Boolean(tokenError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Password minimal 6 karakter.");
    if (password !== confirmPassword) return setError("Konfirmasi password tidak cocok.");
    if (!token) return setError("Link reset tidak valid.");

    setLoading(true);
    const { error: resetError } = await authClient.resetPassword({ newPassword: password, token });
    setLoading(false);

    if (resetError) {
      setError(resetError.message ?? "Gagal reset password. Link mungkin sudah kedaluwarsa.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/admin/login"), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3fae8] via-white to-[#f0f9e8] flex items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white rounded-3xl border border-admin-line shadow-2xl shadow-gray-200/60 p-8 sm:p-10">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Kembali ke Login
          </Link>

          {done ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 size={24} className="text-primary" />
              </div>
              <h1 className="text-lg font-extrabold text-gray-900 mb-2">Password Berhasil Diubah</h1>
              <p className="text-sm text-gray-500">Mengarahkan ke halaman login...</p>
            </div>
          ) : invalidLink ? (
            <div className="py-4">
              <h1 className="text-lg font-extrabold text-gray-900 mb-2">Link Tidak Valid</h1>
              <p className="text-sm text-gray-500 mb-6">
                Link reset password ini tidak valid atau sudah kedaluwarsa. Minta link baru lewat
                halaman lupa password.
              </p>
              <Link
                href="/admin/forgot-password"
                className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-[#43791b] transition-all"
              >
                Minta Link Baru
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Buat Password Baru</h1>
              <p className="text-sm text-gray-500 mb-8">Minimal 6 karakter.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Password Baru</label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Konfirmasi Password</label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                    <span className="mt-0.5 flex-shrink-0">⚠</span>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-[#43791b] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Password Baru"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
