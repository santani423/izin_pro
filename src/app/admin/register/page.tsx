"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      sessionStorage.setItem(
        "admin-auth",
        JSON.stringify({ name: form.name, email: form.email }),
      );
      router.replace("/admin/dashboard");
    }, 700);
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Lemah", color: "bg-red-400", width: "w-1/3" };
    if (p.length < 10) return { label: "Cukup", color: "bg-amber-400", width: "w-2/3" };
    return { label: "Kuat", color: "bg-primary", width: "w-full" };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3fae8] via-white to-[#f0f9e8] flex items-center justify-center p-4">

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
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

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Buat Akun Admin</h1>
          <p className="text-sm text-gray-500 mb-8">
            Daftarkan akun untuk mengakses Admin Panel IzinPro.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Nama */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Super Admin"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="admin@izinpro.co.id"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Minimal 6 karakter"
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
              {/* Password strength indicator */}
              {strength && (
                <div className="space-y-1">
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-xs text-gray-400">
                    Kekuatan: <span className="font-medium text-gray-600">{strength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Konfirmasi Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="Ulangi password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Match indicator */}
              {form.confirmPassword && (
                <div className={`flex items-center gap-1.5 text-xs ${form.password === form.confirmPassword ? "text-primary" : "text-red-500"}`}>
                  <CheckCircle2 size={12} />
                  {form.password === form.confirmPassword ? "Password cocok" : "Password tidak cocok"}
                </div>
              )}
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
                  Mendaftarkan...
                </>
              ) : (
                <>
                  Buat Akun
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun?{" "}
            <Link href="/admin/login" className="font-semibold text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} IzinPro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
