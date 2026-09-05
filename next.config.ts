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
  // Security header dasar utk semua rute — CSP sengaja TIDAK dimasukkan di
  // sini: situs pakai Meta Pixel, embed Google Maps/YouTube, dan gambar
  // upload/eksternal yg domainnya bisa nambah kapan aja (dikelola admin),
  // jadi CSP butuh direview manual (cek console browser) sebelum dipasang,
  // bukan ditebak dari sini.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
