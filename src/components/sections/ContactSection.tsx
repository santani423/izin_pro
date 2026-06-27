import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import { Button } from "@/components/ui/button";
import { COMPANY_INFO } from "@/lib/constants";

const contactItems = [
  {
    icon: MapPin,
    label: "Alamat Kantor",
    value: COMPANY_INFO.address,
    href: COMPANY_INFO.mapsUrl,
  },
  {
    icon: Phone,
    label: "Telepon / WhatsApp",
    value: COMPANY_INFO.whatsappDisplay,
    href: `tel:${COMPANY_INFO.whatsappDisplay}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: COMPANY_INFO.email,
    href: `mailto:${COMPANY_INFO.email}`,
  },
  {
    icon: Clock,
    label: "Jam Operasional",
    value: COMPANY_INFO.hours,
    href: null,
  },
];

/* ─── Section: Kontak & Lokasi ─── */
export default function ContactSection() {
  return (
    <SectionWrapper id="kontak" alt>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ─── Info Kontak ─── */}
          <div className="reveal space-y-6">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                Lokasi &amp; Kontak
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Temukan Kami di Sini
              </h2>
              <p className="text-gray-500 mt-3">
                Kunjungi kantor kami atau hubungi tim profesional IzinPro kapan saja.
              </p>
            </div>

            <div className="space-y-4">
              {contactItems.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 flex-shrink-0">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                      {label}
                    </div>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-sm text-gray-800 hover:text-primary transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-800">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button asChild className="gap-2 rounded-xl">
              <a
                href={`https://wa.me/${COMPANY_INFO.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={16} />
                Hubungi via WhatsApp
              </a>
            </Button>
          </div>

          {/* ─── Peta Placeholder ─── */}
          <div className="reveal delay-2">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#f3fae8] to-[#ddf0b5] border border-gray-200 h-80 flex flex-col items-center justify-center text-center p-6">
              {/* Pin animasi */}
              <div className="relative mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 animate-bounce">
                  <MapPin size={20} className="text-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              </div>
              <p className="font-bold text-gray-800">IzinPro — Jakarta Selatan</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">{COMPANY_INFO.addressShort}</p>
              <a
                href={COMPANY_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:text-primary hover:border-primary transition-colors shadow-sm"
              >
                <MapPin size={14} />
                Buka di Google Maps
              </a>
            </div>
          </div>

        </div>
      </div>
    </SectionWrapper>
  );
}
