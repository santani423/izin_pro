import Link from "next/link";
import { ArrowRight, Building2, ClipboardList, FileText, Clock, List, UserCheck, Briefcase, Globe, Receipt, Tag, Monitor } from "lucide-react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import { SERVICES } from "@/lib/constants";
import type { ServiceItem } from "@/types";

/* ─── Pemetaan ikon layanan ─── */
const ICONS: Record<string, React.ElementType> = {
  building: Building2,
  clipboard: ClipboardList,
  "file-text": FileText,
  clock: Clock,
  list: List,
  "user-check": UserCheck,
  briefcase: Briefcase,
  globe: Globe,
  receipt: Receipt,
  tag: Tag,
  monitor: Monitor,
};

/* ─── Kartu layanan ─── */
function ServiceCard({ service, index }: { service: ServiceItem; index: number }) {
  const Icon = ICONS[service.icon] ?? FileText;
  const delay = index * 80;

  return (
    <Link
      href={`/layanan/${service.slug}`}
      className="reveal group flex flex-col p-6 bg-white rounded-2xl border border-gray-200 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Ikon */}
      <div
        className="flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-transform group-hover:scale-110 duration-300"
        style={{ backgroundColor: service.bgColor }}
      >
        <Icon size={22} style={{ color: service.color }} />
      </div>

      <h3 className="font-semibold text-gray-900 text-base mb-2 group-hover:text-primary transition-colors">
        {service.title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed flex-1">{service.description}</p>

      {/* Link selengkapnya */}
      <div className="flex items-center gap-1.5 mt-4 text-sm font-medium text-primary opacity-70 group-hover:opacity-100 transition-opacity">
        Selengkapnya
        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-1 duration-200"
        />
      </div>

      {/* Border bawah aksen */}
      <div
        className="h-0.5 w-0 group-hover:w-full mt-3 rounded-full transition-all duration-300"
        style={{ backgroundColor: service.color }}
      />
    </Link>
  );
}

/* ─── Section: Layanan ─── */
export default function ServicesSection() {
  return (
    <SectionWrapper id="layanan">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="reveal">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Layanan Kami
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Daftar Layanan</h2>
            <p className="text-gray-500 mt-2 max-w-md">
              Berbagai layanan perizinan untuk mendukung legalitas dan kelancaran bisnis Anda.
            </p>
          </div>
          <Link
            href="/layanan"
            className="reveal flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
          >
            Lihat Semua Layanan
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
