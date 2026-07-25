import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Default 1MB terlalu kecil utk upload logo klien/media (admin/klien, admin/media)
    serverActions: { bodySizeLimit: "4mb" },
  },
  // sharp itu native binary package — biarin Node yg require() langsung
  // (bukan Turbopack yg coba bundle/transform). Tanpa ini, entry .mjs
  // sharp (pakai sintaks `with { type: ... }`) bisa gagal di-parse Turbopack
  // di Node versi yg belum dukung import attributes (<20.10 / <18.20).
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
