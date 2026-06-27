import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionWrapper from "@/components/shared/SectionWrapper";
import CtaBannerSection from "@/components/sections/CtaBannerSection";
import { COMPANY_INFO, TEAM_MEMBERS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "IzinPro adalah penyedia jasa perizinan usaha terpercaya di Indonesia sejak 2018. Pelajari visi, misi, dan tim profesional kami.",
};

const visiMisi = [
  {
    title: "Visi",
    content:
      "Menjadi platform perizinan bisnis nomor 1 di Indonesia yang terpercaya, transparan, dan mudah diakses oleh seluruh pelaku usaha.",
  },
  {
    title: "Misi",
    content:
      "Menyederhanakan proses perizinan bisnis melalui layanan profesional, digital, dan berorientasi pada kepuasan klien.",
  },
];

const nilaiPerusahaan = [
  { emoji: "⚡", title: "Kecepatan", desc: "Proses perizinan rata-rata 3–7 hari kerja." },
  { emoji: "🛡️", title: "Legalitas", desc: "Semua layanan resmi dan terverifikasi." },
  { emoji: "💬", title: "Transparansi", desc: "Tidak ada biaya tersembunyi." },
  { emoji: "🤝", title: "Kepercayaan", desc: "5.000+ klien puas se-Indonesia." },
];

/* ─── Halaman Tentang Kami ─── */
export default function AboutPage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative bg-gradient-to-br from-[#f3fae8] via-white to-[#f3fae8] py-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #5ba12b33 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10 text-center max-w-3xl">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Tentang Kami
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Mitra Perizinan Bisnis
            <br />
            <span className="text-primary">Terpercaya Anda</span>
          </h1>
          <p className="text-lg text-gray-500 mt-5 leading-relaxed">
            Sejak {COMPANY_INFO.foundedYear}, IzinPro telah membantu ribuan pengusaha Indonesia
            dalam mengurus perizinan bisnis dengan cepat, mudah, dan legal.
          </p>
        </div>
      </section>

      {/* ─── Visi & Misi ─── */}
      <SectionWrapper>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {visiMisi.map((item) => (
              <div
                key={item.title}
                className="reveal p-7 rounded-3xl border border-primary/20 bg-primary/5"
              >
                <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ─── Nilai Perusahaan ─── */}
      <SectionWrapper alt>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-10 reveal">
            <h2 className="text-3xl font-extrabold text-gray-900">Nilai-Nilai Kami</h2>
            <p className="text-gray-500 mt-2">Prinsip yang mendasari setiap langkah kami.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {nilaiPerusahaan.map((n, i) => (
              <div
                key={n.title}
                className="reveal flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="text-3xl mb-3">{n.emoji}</span>
                <h4 className="font-bold text-gray-900 mb-1">{n.title}</h4>
                <p className="text-sm text-gray-500">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ─── Tim ─── */}
      <SectionWrapper>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-10 reveal">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Tim Kami
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Para Profesional di Balik IzinPro
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {TEAM_MEMBERS.map((member, i) => (
              <div
                key={member.name}
                className="reveal flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Foto placeholder */}
                <div className="relative bg-gray-100 aspect-[4/3] overflow-hidden flex items-end justify-center">
                  {/* Silhouette orang */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-300" />
                    <div className="w-36 h-20 rounded-t-[50%] bg-gray-200 mt-1" />
                  </div>
                  {/* Badge inisial */}
                  <div
                    className={`absolute top-3 right-3 w-9 h-9 rounded-xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-xs font-bold shadow-md`}
                  >
                    {member.initials}
                  </div>
                </div>

                {/* Info anggota */}
                <div className="p-4">
                  <div className="font-semibold text-gray-900 text-sm">{member.name}</div>
                  <div className="text-xs text-primary font-medium mt-0.5">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ─── CTA ─── */}
      <CtaBannerSection />
    </>
  );
}
