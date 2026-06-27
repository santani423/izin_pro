"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { COMPANY_INFO } from "@/lib/constants";

/* ─── Halaman Kontak ─── */
export default function KontakPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    /* Simulasi submit — backend belum ada */
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  const contactItems = [
    { icon: Phone, label: "Telepon / WhatsApp", value: COMPANY_INFO.whatsappDisplay, href: `https://wa.me/${COMPANY_INFO.whatsapp}` },
    { icon: Mail, label: "Email", value: COMPANY_INFO.email, href: `mailto:${COMPANY_INFO.email}` },
    { icon: MapPin, label: "Alamat", value: COMPANY_INFO.address, href: COMPANY_INFO.mapsUrl },
    { icon: Clock, label: "Jam Operasional", value: COMPANY_INFO.hours, href: null },
  ];

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="bg-gradient-to-br from-[#f3fae8] via-white to-[#f3fae8] py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center max-w-2xl">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            Kontak
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Hubungi Kami
          </h1>
          <p className="text-lg text-gray-500 mt-4">
            Ada pertanyaan? Tim kami siap membantu Anda kapan saja.
          </p>
        </div>
      </section>

      {/* ─── Konten ─── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">

            {/* ─── Form Kontak ─── */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Kirim Pesan</h2>
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-3xl bg-primary/5 border border-primary/20">
                  <CheckCircle2 size={48} className="text-primary mb-4" />
                  <h3 className="text-lg font-bold text-gray-900">Pesan Terkirim!</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Terima kasih! Tim kami akan menghubungi Anda dalam 1×24 jam.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-sm text-primary font-medium hover:underline"
                  >
                    Kirim pesan lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Nama Lengkap *</Label>
                      <Input id="name" placeholder="Nama Anda" required className="rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">No. HP / WhatsApp *</Label>
                      <Input id="phone" type="tel" placeholder="08xx-xxxx-xxxx" required className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="email@domain.com" required className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subjek</Label>
                    <Input id="subject" placeholder="Perihal pesan Anda" className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Pesan *</Label>
                    <Textarea
                      id="message"
                      placeholder="Ceritakan kebutuhan perizinan Anda..."
                      required
                      rows={5}
                      className="rounded-xl resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2 rounded-xl"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Mengirim...
                      </span>
                    ) : (
                      <>
                        <Send size={16} />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* ─── Info Kontak ─── */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informasi Kontak</h2>
              <div className="space-y-4 mb-7">
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

              {/* Peta placeholder */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#f3fae8] to-[#ddf0b5] border border-gray-200 h-52 flex flex-col items-center justify-center text-center p-6">
                <div className="relative mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 animate-bounce">
                    <MapPin size={16} className="text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                </div>
                <p className="font-bold text-gray-800 text-sm">IzinPro — Jakarta Selatan</p>
                <a
                  href={COMPANY_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:text-primary hover:border-primary transition-colors shadow-sm"
                >
                  <MapPin size={12} />
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
