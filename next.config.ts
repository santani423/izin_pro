import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Default 1MB terlalu kecil utk upload logo klien/media (admin/klien, admin/media)
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
