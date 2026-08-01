"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Wand2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getRolePanel } from "@/lib/permissions";
import { DEFAULT_LOGO_URL } from "@/lib/branding-constants";
import type { Role } from "@prisma/client";

/* ─── Akun demo hasil `npx prisma db seed` (dev lokal) — buat mempermudah
 * demo akses admin tanpa perlu bikin akun manual. JANGAN dipakai di
 * production sungguhan (ganti/hapus akun ini sebelum go-live beneran). */
const DEMO_ADMIN_ACCOUNT = {
  role: "ADMIN" as Role,
  email: "demo-admin@izinpro.co.id",
  password: "demo1234",
};

export default function LoginFormClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO_URL);

  useEffect(() => {
    fetch("/api/branding")
      .then((res) => res.json())
      .then((data) => setLogoUrl(data.logoUrl || DEFAULT_LOGO_URL))
      .catch(() => setLogoUrl(DEFAULT_LOGO_URL));
  }, []);

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setError("");
    setLoading(true);

    const { data, error: signInError } = await authClient.signIn.email({
      email: loginEmail,
      password: loginPassword,
    });

    if (signInError) {
      setError(signInError.message ?? "Email atau password salah. Coba periksa kembali.");
      setLoading(false);
      return;
    }

    // Panel tujuan (admin/editor/author) ditentukan role akun, bukan pilihan
    // bebas user — lihat getRolePanel di permissions.ts.
    const role = (data?.user as { role?: Role } | undefined)?.role;
    const panel = role ? getRolePanel(role) : "admin";
    router.replace(`/${panel}/dashboard`);
    router.refresh();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleDemoLogin = () => {
    setEmail(DEMO_ADMIN_ACCOUNT.email);
    setPassword(DEMO_ADMIN_ACCOUNT.password);
    performLogin(DEMO_ADMIN_ACCOUNT.email, DEMO_ADMIN_ACCOUNT.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3fae8] via-white to-[#f0f9e8] flex items-center justify-center p-4">

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-admin-line shadow-2xl shadow-gray-200/60 p-8 sm:p-10">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <Image src={logoUrl} alt="Logo aplikasi" width={48} height={48} unoptimized className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="font-bold text-gray-900 leading-none">IzinPro</div>
              <div className="text-xs text-gray-400 mt-0.5">Admin Panel</div>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Selamat Datang</h1>
          <p className="text-sm text-gray-500 mb-8">
            Masuk untuk mengelola website IzinPro.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@izinpro.co.id"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link href="/admin/forgot-password" className="text-xs text-primary hover:underline">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
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

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-[#43791b] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk ke Dashboard
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Akun demo admin (dev/staging) — satu klik login & auto-isi form. */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Wand2 size={13} />
              Masuk sebagai Demo Admin
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} IzinPro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
