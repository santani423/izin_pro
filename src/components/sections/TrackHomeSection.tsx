"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/contexts/LocaleContext";

/* ─── Section "Lacak Layanan Anda" di homepage — cuma redirect ke
 * /tracking?code=..., pencarian sebenarnya (query DB) tetap di
 * TrackingFormSection halaman /tracking (auto-lacak dari query param). ─── */
export default function TrackHomeSection() {
  const dict = useDictionary();
  const router = useRouter();
  const [code, setCode] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(`/tracking?code=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="bg-brand-surface">
      <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {dict.trackHome.headingPrefix} <span className="text-primary">{dict.trackHome.headingHighlight}</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          {dict.trackHome.subtitle}
        </p>
        <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={dict.trackHome.placeholder}
            aria-label={dict.trackHome.ariaInput}
            className="h-11 w-full rounded-lg border border-border/60 bg-background px-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" size="lg" className="w-full justify-center gap-2 rounded-lg font-semibold sm:w-auto">
            {dict.trackHome.button}
            <Search className="size-4" aria-hidden="true" />
          </Button>
        </form>
      </div>
    </section>
  );
}
