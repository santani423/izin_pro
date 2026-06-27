"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

/* ─── Demo credentials ─── */
const DEMO_EMAIL = "admin@izinpro.co.id";
const DEMO_PASSWORD = "admin123";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        sessionStorage.setItem(
          "admin-auth",
          JSON.stringify({ name: "Super Admin", email }),
        );
        router.replace("/admin/dashboard");
      } else {
        setError("Email atau password salah. Coba periksa kembali.");
        setLoading(false);
      }
    }, 700);
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
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200/60 p-8 sm:p-10">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white shadow-sm flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15 4.5L7 13.5L3 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
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
                <button type="button" className="text-xs text-primary hover:underline">
                  Lupa password?
                </button>
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

          <p className="text-center text-sm text-gray-500 mt-6">
            Belum punya akun?{" "}
            <Link href="/admin/register" className="font-semibold text-primary hover:underline">
              Daftar sekarang
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-6 p-3.5 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-gray-600 text-center font-medium mb-1">Akun Demo</p>
            <p className="text-xs text-gray-500 text-center">
              {DEMO_EMAIL} &nbsp;/&nbsp; {DEMO_PASSWORD}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} IzinPro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
