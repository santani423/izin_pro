"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ChevronRight, Lock, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { useDictionary } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";
import { submitInquiryAction } from "@/lib/actions/inquiry";
import { resolveDetailIcon } from "@/lib/detail-icons";
import type { KontakChannelRaw } from "@/lib/hydrate-kontak-content";

const LAINNYA = "lainnya";

type KontakFormValues = {
  nama: string;
  email: string;
  whatsapp: string;
  layanan: string;
  pesan: string;
};

const inputClass =
  "h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

/* ─── Form kontak + sidebar informasi kontak ─── */
export default function KontakFormSection({
  title,
  subtitle,
  sidebarTitle,
  sidebarSubtitle,
  channels,
  services,
}: {
  title: string;
  subtitle: string;
  sidebarTitle: string;
  sidebarSubtitle: string;
  channels: KontakChannelRaw[];
  services: { id: string; title: string }[];
}) {
  const dict = useDictionary();
  const kontakSchema = useMemo(
    () =>
      z.object({
        nama: z.string().min(3, dict.kontakForm.validation.nameMin),
        email: z.string().email(dict.kontakForm.validation.emailInvalid),
        whatsapp: z
          .string()
          .min(9, dict.kontakForm.validation.whatsappMin)
          .regex(/^[0-9+\-\s]+$/, dict.kontakForm.validation.whatsappDigitsOnly),
        layanan: z.string().min(1, dict.kontakForm.validation.serviceRequired),
        pesan: z.string().min(10, dict.kontakForm.validation.messageMin),
      }),
    [dict],
  );
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<KontakFormValues>({
    resolver: zodResolver(kontakSchema),
    defaultValues: { layanan: "" },
  });

  const onSubmit = async (values: KontakFormValues) => {
    setSubmitError(null);
    const res = await submitInquiryAction({
      name: values.nama,
      email: values.email,
      whatsapp: values.whatsapp,
      serviceId: values.layanan === LAINNYA ? null : values.layanan,
      message: values.pesan,
    });
    if (res.ok) {
      setSubmitted(true);
      reset();
    } else {
      setSubmitError(res.message);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 rounded-3xl bg-muted/40 p-4 sm:p-6 lg:grid-cols-[1fr_400px] lg:p-8">
      {/* ─── Form ─── */}
      <Card className="gap-0 rounded-2xl border-border/60 py-0">
        <CardContent className="px-6 py-7 sm:px-8">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {subtitle}
          </p>

          {submitted ? (
            <div className="mt-6 rounded-xl bg-primary/10 px-5 py-6 text-center">
              <CheckCircle2
                className="mx-auto size-10 text-primary"
                aria-hidden="true"
              />
              <p className="mt-3 text-base font-bold text-foreground">
                {dict.kontakForm.successTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dict.kontakForm.successCopy}
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-lg"
                onClick={() => setSubmitted(false)}
              >
                {dict.kontakForm.sendAgain}
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
                    {dict.kontakForm.nameLabel} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="nama"
                    type="text"
                    placeholder={dict.kontakForm.namePlaceholder}
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
                    {dict.kontakForm.emailLabel} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder={dict.kontakForm.emailPlaceholder}
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
                    {dict.kontakForm.whatsappLabel} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    placeholder={dict.kontakForm.whatsappPlaceholder}
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
                    {dict.kontakForm.serviceLabel}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <Controller
                    name="layanan"
                    control={control}
                    render={({ field }) => (
                      <Select
                        items={Object.fromEntries([
                          ...services.map((s) => [s.id, s.title]),
                          [LAINNYA, dict.kontakForm.otherOption],
                        ])}
                        value={field.value || null}
                        onValueChange={(value) => field.onChange(value ?? "")}
                      >
                        <SelectTrigger
                          id="layanan"
                          aria-invalid={!!errors.layanan}
                          className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20"
                        >
                          <SelectValue placeholder={dict.kontakForm.servicePlaceholder} />
                        </SelectTrigger>
                        <SelectContent
                          alignItemWithTrigger={false}
                          align="start"
                        >
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.title}
                            </SelectItem>
                          ))}
                          <SelectItem value={LAINNYA}>{dict.kontakForm.otherOption}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
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
                  {dict.kontakForm.messageLabel} <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="pesan"
                  rows={5}
                  placeholder={dict.kontakForm.messagePlaceholder}
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

              {submitError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {submitError}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full justify-center gap-2 rounded-lg font-semibold"
              >
                {isSubmitting ? dict.kontakForm.sending : dict.kontakForm.send}
                <Send className="size-4" aria-hidden="true" />
              </Button>

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3.5" aria-hidden="true" />
                {dict.kontakForm.privacyNote}
              </p>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ─── Sidebar informasi kontak — tiap kanal kartu putih tersendiri ─── */}
      <div className="lg:py-2">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          {sidebarTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {sidebarSubtitle}
        </p>
        <ul className="mt-5 space-y-4">
          {channels.map(({ icon, title, value, note, href }) => {
            const Icon = resolveDetailIcon(icon);
            return (
            <li key={title}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-xl border border-border/60 bg-background px-5 py-4 shadow-sm transition-colors hover:border-primary/40"
              >
                <span
                  className="shrink-0 text-primary"
                  aria-hidden="true"
                >
                  {icon === "whatsapp" ? (
                    <WhatsAppIcon className="size-7" />
                  ) : (
                    <Icon className="size-7" strokeWidth={1.7} />
                  )}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold text-foreground">
                    {title}
                  </span>
                  {value && (
                    <span className="mt-0.5 block text-sm font-bold text-foreground">
                      {value}
                    </span>
                  )}
                  {note && (
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {note}
                    </span>
                  )}
                </span>
                <ChevronRight
                  className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            </li>
            );
          })}
        </ul>
      </div>
      </div>
    </section>
  );
}
