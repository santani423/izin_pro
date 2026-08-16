"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { useDictionary, useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";
import { WHATSAPP_URL } from "@/lib/landing";
import { submitTrackingLookupAction } from "@/lib/actions/tracking";
import type { PublicTrackingResult } from "@/lib/transaction-tracking";

const INTL_LOCALES: Record<string, string> = { id: "id-ID", en: "en-US", zh: "zh-CN" };

function formatDate(d: Date | string | null, intlLocale: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString(intlLocale, { day: "numeric", month: "long", year: "numeric" });
}

/* ─── Form lacak + hasil timeline status transaksi — beneran tersambung ke
 * database (ServiceTransaction + TransactionWorkflowStep), gantiin mock
 * lama total. initialCode dipakai buat auto-lacak dari /tracking?code=... ─── */
export default function TrackingFormSection({ initialCode }: { initialCode?: string }) {
  const dict = useDictionary();
  const intlLocale = INTL_LOCALES[useLocale()];
  const [input, setInput] = useState(initialCode ?? "");
  const [result, setResult] = useState<PublicTrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const track = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    const res = await submitTrackingLookupAction(code);
    setLoading(false);
    if (res.ok) {
      setResult(res.data);
    } else {
      setResult(null);
      setError(res.message);
    }
  };

  useEffect(() => {
    if (initialCode) track(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  const isDone = result ? result.progressPercent >= 100 : false;

  return (
    <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      {/* ─── Form lacak ─── */}
      <Card className="gap-0 rounded-2xl border-border/60 py-0 shadow-sm">
        <CardContent className="px-6 py-6 sm:px-8">
          <h2 className="text-lg font-bold text-foreground">
            {dict.trackingForm.heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {dict.trackingForm.subtitle}
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
              placeholder={dict.trackingForm.placeholder}
              aria-label={dict.trackingForm.ariaInput}
              className="h-10 w-full rounded-lg border border-border/60 bg-background pl-4 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full justify-center gap-2 rounded-lg px-2.5 text-xs font-semibold sm:w-auto sm:px-6 sm:text-sm"
            >
              {loading ? dict.trackingForm.searching : dict.trackingForm.trackNow}
              <Search className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ─── Tidak ditemukan ─── */}
      {error && (
        <div
          role="alert"
          className="mt-5 flex flex-col items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-5 sm:flex-row sm:items-center"
        >
          <AlertCircle className="size-5 shrink-0 text-destructive" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{error}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {dict.trackingForm.notFoundHelp}
            </p>
          </div>
          <Button asChild variant="outline" className="w-full justify-center gap-2 rounded-lg sm:w-auto">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              {dict.trackingForm.contactUs}
              <WhatsAppIcon className="size-4 text-primary" />
            </a>
          </Button>
        </div>
      )}

      {/* ─── Hasil tracking ─── */}
      {result && (
        <div className="mt-5 space-y-5">
          {/* Ringkasan transaksi */}
          <Card className="gap-0 rounded-2xl border-border/60 py-0">
            <CardContent className="px-6 py-6 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-bold text-foreground">{dict.trackingForm.detailHeading}</h3>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    isDone ? "bg-primary/10 text-primary" : "bg-amber-400/15 text-amber-600",
                  )}
                >
                  {result.statusLabel}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: dict.trackingForm.codeLabel, value: result.code },
                  { label: dict.trackingForm.serviceLabel, value: result.packageName ? `${result.serviceName} — ${result.packageName}` : result.serviceName },
                  { label: dict.trackingForm.currentStageLabel, value: result.currentStageName },
                  { label: dict.trackingForm.estimatedCompletionLabel, value: formatDate(result.estimatedCompletionDate, intlLocale) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 text-sm font-bold text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{dict.trackingForm.progressLabel}</span>
                  <span className="font-bold text-primary">{result.progressPercent}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${result.progressPercent}%` }} />
                </div>
              </div>
              {result.customerNotes && (
                <p className="mt-4 rounded-xl bg-brand-surface px-4 py-3 text-sm text-foreground">{result.customerNotes}</p>
              )}
            </CardContent>
          </Card>

          {/* Timeline tahapan */}
          {result.steps.length > 0 && (
            <Card className="gap-0 rounded-2xl border-border/60 py-0">
              <CardContent className="px-6 py-6 sm:px-8">
                <h3 className="text-base font-bold text-foreground">{dict.trackingForm.statusHeading}</h3>
                <ol className="mt-6 space-y-6">
                  {result.steps.map((step, index) => {
                    const done = step.status === "COMPLETED";
                    const current = !done && (step.status === "IN_PROGRESS" || step.status === "REVISION");
                    return (
                      <li key={step.id} className="relative flex gap-4">
                        {index < result.steps.length - 1 && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "absolute left-[22px] top-11 h-[calc(100%-24px)] w-0.5",
                              done ? "bg-primary" : "bg-border",
                            )}
                          />
                        )}
                        <span
                          className={cn(
                            "relative z-10 grid size-11 shrink-0 place-items-center rounded-full border-2 text-sm font-bold",
                            done && "border-primary bg-primary text-white",
                            current && "border-primary bg-background text-primary ring-4 ring-primary/15",
                            !done && !current && "border-border bg-background text-muted-foreground",
                          )}
                        >
                          {done ? <Check className="size-5" aria-hidden="true" /> : index + 1}
                        </span>
                        <div>
                          <p className={cn("text-sm font-bold", current ? "text-primary" : "text-foreground")}>
                            {step.name}
                            {current && (
                              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                {dict.trackingForm.inProgressBadge}
                              </span>
                            )}
                          </p>
                          {step.description && (
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                          )}
                          {step.completedAt && (
                            <p className="mt-1 text-xs font-semibold text-primary">{formatDate(step.completedAt, intlLocale)}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Lampiran bisa diunduh */}
          {result.attachments.length > 0 && (
            <Card className="gap-0 rounded-2xl border-border/60 py-0">
              <CardContent className="px-6 py-6 sm:px-8">
                <h3 className="text-base font-bold text-foreground">{dict.trackingForm.documentsHeading}</h3>
                <ul className="mt-3 space-y-2">
                  {result.attachments.map((a) => (
                    <li key={a.id}>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {a.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
