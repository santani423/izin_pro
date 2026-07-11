"use client";

import { useState } from "react";
import { AlertCircle, Check, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { cn } from "@/lib/utils";
import { WHATSAPP_URL } from "@/lib/landing";
import {
  DEMO_ORDER_NUMBERS,
  findOrder,
  TRACKING_STEPS,
  type TrackingOrder,
} from "@/lib/tracking";

/* ─── Form lacak + hasil timeline status perizinan (client, mock data) ─── */
export default function TrackingFormSection() {
  const [input, setInput] = useState("");
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [notFound, setNotFound] = useState(false);

  const track = (orderNo: string) => {
    const found = findOrder(orderNo);
    setOrder(found);
    setNotFound(!found && orderNo.trim() !== "");
  };

  const isDone = order && order.currentStep >= TRACKING_STEPS.length;

  return (
    <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      {/* ─── Form lacak ─── */}
      <Card className="gap-0 rounded-2xl border-border/60 py-0 shadow-sm">
        <CardContent className="px-6 py-6 sm:px-8">
          <h2 className="text-lg font-bold text-foreground">
            Lacak Status Perizinan Anda
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Masukkan nomor order yang Anda terima via WhatsApp/email saat
            pendaftaran layanan.
          </p>

          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              track(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="Contoh: IZN-2025-0001"
              aria-label="Nomor order perizinan"
              className="h-11 flex-1 rounded-lg border border-border/60 bg-background px-4 text-sm font-semibold tracking-wide outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {/* Tombol — lebar penuh di mobile, ukuran normal ≥sm */}
            <Button
              type="submit"
              size="lg"
              className="w-full justify-center gap-2 rounded-lg px-2.5 text-xs font-semibold sm:w-auto sm:px-6 sm:text-sm"
            >
              Lacak Sekarang
              <Search className="size-4" aria-hidden="true" />
            </Button>
          </form>

          {/* Nomor demo (mock data — backend belum tersedia) */}
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            Coba nomor demo:
            {DEMO_ORDER_NUMBERS.map((no) => (
              <button
                key={no}
                type="button"
                onClick={() => {
                  setInput(no);
                  track(no);
                }}
                className="rounded-full border border-border/60 px-2.5 py-1 font-semibold text-primary transition-colors hover:border-primary/40"
              >
                {no}
              </button>
            ))}
          </p>
        </CardContent>
      </Card>

      {/* ─── Tidak ditemukan ─── */}
      {notFound && (
        <div
          role="alert"
          className="mt-5 flex flex-col items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-5 sm:flex-row sm:items-center"
        >
          <AlertCircle
            className="size-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">
              Nomor order tidak ditemukan
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Periksa kembali penulisan nomor order Anda, atau hubungi tim kami
              untuk bantuan pengecekan langsung.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="w-full justify-center gap-2 rounded-lg sm:w-auto"
          >
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              Hubungi Kami
              <WhatsAppIcon className="size-4 text-primary" />
            </a>
          </Button>
        </div>
      )}

      {/* ─── Hasil tracking ─── */}
      {order && (
        <div className="mt-5 space-y-5">
          {/* Ringkasan order */}
          <Card className="gap-0 rounded-2xl border-border/60 py-0">
            <CardContent className="px-6 py-6 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-bold text-foreground">
                  Detail Order
                </h3>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    isDone
                      ? "bg-primary/10 text-primary"
                      : "bg-amber-400/15 text-amber-600",
                  )}
                >
                  {isDone ? "Selesai" : "Dalam Proses"}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Nomor Order", value: order.orderNo },
                  { label: "Layanan", value: order.service },
                  { label: "Tanggal Pengajuan", value: order.submittedDate },
                  { label: "Estimasi Selesai", value: order.estimatedDone },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 text-sm font-bold text-foreground">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {/* Timeline tahapan */}
          <Card className="gap-0 rounded-2xl border-border/60 py-0">
            <CardContent className="px-6 py-6 sm:px-8">
              <h3 className="text-base font-bold text-foreground">
                Status Proses Perizinan
              </h3>
              <ol className="mt-6 space-y-6 lg:grid lg:grid-cols-5 lg:gap-4 lg:space-y-0">
                {TRACKING_STEPS.map(
                  ({ icon: Icon, title, description }, index) => {
                    const stepNo = index + 1;
                    const done = stepNo < order.currentStep || isDone;
                    const current = !isDone && stepNo === order.currentStep;
                    const date = order.stepDates[index];

                    return (
                      <li
                        key={title}
                        className="relative flex gap-4 lg:flex-col lg:items-center lg:gap-0 lg:text-center"
                      >
                        {/* Garis penghubung antar tahap */}
                        {index < TRACKING_STEPS.length - 1 && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "absolute left-[22px] top-11 h-[calc(100%-24px)] w-0.5 lg:left-[calc(50%+2rem)] lg:right-[calc(-50%+2rem)] lg:top-[22px] lg:h-0.5 lg:w-auto",
                              done ? "bg-primary" : "bg-border",
                            )}
                          />
                        )}

                        {/* Ikon status tahap */}
                        <span
                          className={cn(
                            "relative z-10 grid size-11 shrink-0 place-items-center rounded-full border-2",
                            done &&
                              "border-primary bg-primary text-white",
                            current &&
                              "border-primary bg-background text-primary ring-4 ring-primary/15",
                            !done &&
                              !current &&
                              "border-border bg-background text-muted-foreground",
                          )}
                        >
                          {done ? (
                            <Check className="size-5" aria-hidden="true" />
                          ) : (
                            <Icon className="size-5" aria-hidden="true" />
                          )}
                        </span>

                        <div className="lg:mt-3">
                          <p
                            className={cn(
                              "text-sm font-bold",
                              current ? "text-primary" : "text-foreground",
                            )}
                          >
                            {title}
                            {current && (
                              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary lg:ml-0 lg:mt-1 lg:block lg:w-fit lg:mx-auto">
                                Sedang Berjalan
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {description}
                          </p>
                          {date && (
                            <p className="mt-1 text-xs font-semibold text-primary">
                              {date}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  },
                )}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
