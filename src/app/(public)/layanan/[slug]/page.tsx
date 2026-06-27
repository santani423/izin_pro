import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CtaBannerSection from "@/components/sections/CtaBannerSection";
import { SERVICES, COMPANY_INFO } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return { title: "Layanan Tidak Ditemukan" };

  return {
    title: service.title,
    description: service.description,
  };
}

const steps = [
  "Konsultasi awal gratis via WhatsApp",
  "Analisis kebutuhan perizinan Anda",
  "Persiapan & verifikasi dokumen",
  "Pengajuan ke instansi terkait",
  "Monitoring proses secara berkala",
  "Perizinan selesai & dikirimkan",
];

/* ─── Halaman Detail Layanan ─── */
export default async function LayananDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  const waMessage = encodeURIComponent(
    `Halo IzinPro, saya ingin konsultasi tentang layanan ${service.title}.`,
  );

  return (
    <>
      {/* ─── Hero ─── */}
      <section
        className="relative py-20 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${service.bgColor}, white)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <Link
            href="/layanan"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft size={15} />
            Kembali ke Layanan
          </Link>
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
              style={{ backgroundColor: service.bgColor, border: `2px solid ${service.color}33` }}
            >
              <ArrowRight size={28} style={{ color: service.color }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              {service.title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">{service.description}</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button asChild className="gap-2 rounded-xl">
                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={16} />
                  Konsultasi Sekarang
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Konten ─── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Fitur */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Yang Anda Dapatkan</h2>
              <ul className="space-y-3">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: service.bgColor }}
                    >
                      <CheckCircle2 size={16} style={{ color: service.color }} />
                    </div>
                    <span className="text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Alur proses */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Alur Proses</h2>
              <ol className="space-y-4">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div
                      className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 text-white"
                      style={{ backgroundColor: service.color }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-gray-600 text-sm leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <CtaBannerSection />
    </>
  );
}
