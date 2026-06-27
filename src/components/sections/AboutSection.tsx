"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Play, X } from "lucide-react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import { Button } from "@/components/ui/button";

const keunggulan = [
  "Legal & Resmi — semua dokumen terverifikasi resmi",
  "Proses Cepat & Efisien, rata-rata 3–7 hari kerja",
  "Tim Profesional & Berpengalaman di bidangnya",
  "Layanan Transparan — tanpa biaya tersembunyi",
];

/* ─── Modal Video ─── */
function VideoModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
        >
          <X size={18} />
        </button>
        <div className="aspect-video bg-gradient-to-br from-[#1b3309] to-[#5ba12b] flex items-center justify-center">
          <div className="text-center text-white/70">
            <Play size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Video Profil IzinPro</p>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-bold text-gray-900">Video Profil IzinPro</h3>
          <p className="text-sm text-gray-500 mt-1">Platform Perizinan Bisnis Terpercaya di Indonesia</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Section: Tentang Kami ─── */
export default function AboutSection() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <SectionWrapper id="tentang-kami" alt>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ─── Konten ─── */}
            <div className="reveal space-y-5">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                Tentang Kami
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                Mengapa IzinPro Menjadi Pilihan{" "}
                <span className="text-primary">Ribuan Pengusaha?</span>
              </h2>
              <p className="text-gray-500 leading-relaxed">
                IzinPro adalah penyedia jasa perizinan usaha terpercaya di Indonesia. Kami
                berkomitmen memberikan layanan terbaik dengan proses cepat, transparan, dan
                harga kompetitif.
              </p>

              <ul className="space-y-3.5">
                {keunggulan.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-primary flex-shrink-0 mt-0.5"
                    />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="gap-2 rounded-xl">
                  <Link href="/tentang-kami">
                    Selengkapnya Tentang Kami
                    <ArrowRight size={15} />
                  </Link>
                </Button>
              </div>
            </div>

            {/* ─── Video Thumbnail ─── */}
            <div
              className="reveal delay-2 relative cursor-pointer group"
              onClick={() => setShowVideo(true)}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-gradient-to-br from-[#1b3309] to-[#5ba12b]">
                {/* Label brand */}
                <div className="absolute top-5 left-5 text-white/80 text-xl font-bold">
                  IzinPro
                </div>

                {/* Tombol play */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 group-hover:bg-white/30 backdrop-blur-sm transition-colors shadow-lg">
                    <Play size={22} className="text-white ml-1" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">Tonton Video Profil</span>
                </div>

                {/* Dekorasi */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Badge terpercaya */}
              <div className="absolute -bottom-4 -right-4 glass rounded-2xl shadow-xl border border-white/60 p-4">
                <div className="text-2xl font-extrabold text-gray-900">10+</div>
                <div className="text-xs text-gray-500 mt-0.5">Tahun Pengalaman</div>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {showVideo && <VideoModal onClose={() => setShowVideo(false)} />}
    </>
  );
}
