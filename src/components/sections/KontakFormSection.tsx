"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ChevronRight, Lock, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { cn } from "@/lib/utils";
import { SERVICES } from "@/lib/constants";
import { KONTAK_CHANNELS } from "@/lib/kontak";

/* ─── Skema validasi form kontak ─── */
const kontakSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  whatsapp: z
    .string()
    .min(9, "Nomor WhatsApp minimal 9 digit")
    .regex(/^[0-9+\-\s]+$/, "Nomor hanya boleh berisi angka"),
  layanan: z.string().min(1, "Pilih layanan yang dibutuhkan"),
  pesan: z.string().min(10, "Pesan minimal 10 karakter"),
});

type KontakFormValues = z.infer<typeof kontakSchema>;

const inputClass =
  "h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

/* ─── Form kontak + sidebar informasi kontak ─── */
export default function KontakFormSection() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<KontakFormValues>({
    resolver: zodResolver(kontakSchema),
    defaultValues: { layanan: "" },
  });

  /* Simulasi kirim — backend belum tersedia (frontend-only) */
  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmitted(true);
    reset();
  };

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      {/* ─── Form ─── */}
      <Card className="gap-0 rounded-2xl border-border/60 py-0">
        <CardContent className="px-6 py-7 sm:px-8">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Kirim Pesan Kepada Kami
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Isi form di bawah ini dan tim kami akan segera menghubungi Anda.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-xl bg-primary/10 px-5 py-6 text-center">
              <CheckCircle2
                className="mx-auto size-10 text-primary"
                aria-hidden="true"
              />
              <p className="mt-3 text-base font-bold text-foreground">
                Pesan Terkirim!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Terima kasih, tim kami akan menghubungi Anda maksimal 1×24 jam
                kerja.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-lg"
                onClick={() => setSubmitted(false)}
              >
                Kirim Pesan Lagi
              </Button>
            </div>
          ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="nama"
                    className="text-sm font-semibold text-foreground"
                  >
                    Nama Lengkap <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="nama"
                    type="text"
                    placeholder="Masukkan nama lengkap Anda"
                    className={cn(inputClass, "mt-1.5")}
                    aria-invalid={!!errors.nama}
                    {...register("nama")}
                  />
                  {errors.nama && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.nama.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-foreground"
                  >
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Masukkan email Anda"
                    className={cn(inputClass, "mt-1.5")}
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="whatsapp"
                    className="text-sm font-semibold text-foreground"
                  >
                    No. WhatsApp <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    placeholder="Contoh: 0812-3456-7890"
                    className={cn(inputClass, "mt-1.5")}
                    aria-invalid={!!errors.whatsapp}
                    {...register("whatsapp")}
                  />
                  {errors.whatsapp && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.whatsapp.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="layanan"
                    className="text-sm font-semibold text-foreground"
                  >
                    Layanan yang Dibutuhkan{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="layanan"
                    className={cn(inputClass, "mt-1.5")}
                    aria-invalid={!!errors.layanan}
                    {...register("layanan")}
                  >
                    <option value="" disabled>
                      Pilih layanan
                    </option>
                    {SERVICES.map((service) => (
                      <option key={service.slug} value={service.title}>
                        {service.title}
                      </option>
                    ))}
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  {errors.layanan && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.layanan.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="pesan"
                  className="text-sm font-semibold text-foreground"
                >
                  Pesan <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="pesan"
                  rows={5}
                  placeholder="Tuliskan kebutuhan atau pertanyaan Anda di sini..."
                  className={cn(
                    inputClass,
                    "mt-1.5 h-auto resize-y py-2.5",
                  )}
                  aria-invalid={!!errors.pesan}
                  {...register("pesan")}
                />
                {errors.pesan && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.pesan.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full justify-center gap-2 rounded-lg font-semibold"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
                <Send className="size-4" aria-hidden="true" />
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3.5" aria-hidden="true" />
                Data Anda aman dan tidak akan dibagikan kepada pihak ketiga.
              </p>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ─── Sidebar informasi kontak ─── */}
      <Card className="gap-0 self-start rounded-2xl border-border/60 py-0">
        <CardContent className="px-6 py-7">
          <h2 className="text-lg font-bold text-foreground">
            Informasi Kontak
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilih cara terbaik untuk menghubungi kami.
          </p>
          <ul className="mt-5 divide-y divide-border/60">
            {KONTAK_CHANNELS.map(({ icon: Icon, title, value, href }) => (
              <li key={title}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 py-4 transition-colors hover:text-primary"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
                    {Icon === "whatsapp" ? (
                      <WhatsAppIcon className="size-4" />
                    ) : (
                      <Icon className="size-4" aria-hidden="true" />
                    )}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-foreground group-hover:text-primary">
                      {title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {value}
                    </span>
                  </span>
                  <ChevronRight
                    className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
