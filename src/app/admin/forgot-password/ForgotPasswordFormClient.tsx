"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordFormClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: reqError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/admin/reset-password",
    });

    setLoading(false);
    // Selalu tampilkan "terkirim" walau email gak terdaftar — hindari
    // bocorin informasi "email ini ada/gak ada" ke penyerang (Better Auth
    // sendiri juga udah gak bedain respons ini di levelnya).
    if (reqError) {
      setError(reqError.message ?? "Gagal mengirim email reset password.");
      return;
    }
    setSent(true);
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

          {sent ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 size={24} className="text-primary" />
              </div>
              <h1 className="text-lg font-extrabold text-gray-900 mb-2">Cek Email Kamu</h1>
              <p className="text-sm text-gray-500">
                Kalau <strong>{email}</strong> terdaftar, kami sudah kirim link reset password ke
                sana. Link berlaku 1 jam.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Lupa Password?</h1>
              <p className="text-sm text-gray-500 mb-8">
                Masukkan email akun admin kamu, kami kirim link buat bikin password baru.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Link Reset
                      <Send size={15} />
                    </>
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
