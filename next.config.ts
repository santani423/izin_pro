import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tanpa ini, Next.js salah nebak root project pas ada lockfile lain di
  // direktori atasnya (mis. ~/package-lock.json) — Turbopack jadi watch
  // seluruh home directory, bikin dev server ngabisin CPU terus-terusan
  // dan tiap request jadi lambat banget (lihat warning "multiple lockfiles").
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    // Default 1MB terlalu kecil utk upload logo klien/media (admin/klien, admin/media)
    serverActions: { bodySizeLimit: "4mb" },
  },
  // sharp itu native binary package — biarin Node yg require() langsung
  // (bukan Turbopack yg coba bundle/transform). Tanpa ini, entry .mjs
  // sharp (pakai sintaks `with { type: ... }`) bisa gagal di-parse Turbopack
  // di Node versi yg belum dukung import attributes (<20.10 / <18.20).
  serverExternalPackages: ["sharp"],
  images: {
    // Semua gambar upload (src/lib/media.ts) udah diresize + dikompres WebP
    // sendiri pas upload, jadi endpoint optimasi /_next/image bawaan Next.js
    // gak dibutuhkan lagi — dan di shared hosting (Passenger/LiteSpeed) endpoint
    // itu sering gagal jalan (butuh sharp + write access ke cache folder saat
    // request), beda dgn serve file statis biasa yg selalu jalan. Matiin di
    // sini biar konsisten dgn semua <Image unoptimized> yg dipakai di panel
    // admin & Navbar/Footer — sebelumnya publik Landing Page (Hero/Layanan/dst)
    // gak ikut pola ini, itu penyebab gambar gak muncul di Landing Page.
    unoptimized: true,
  },
};

export default nextConfig;
