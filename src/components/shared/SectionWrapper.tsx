"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Latar belakang alternatif (abu-abu muda) */
  alt?: boolean;
  /** Tidak pakai padding vertikal default */
  noPadding?: boolean;
}

/* ─── Pembungkus section dengan scroll-reveal otomatis ─── */
export default function SectionWrapper({
  children,
  className,
  id,
  alt = false,
  noPadding = false,
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((child, i) => {
              setTimeout(() => {
                child.classList.add("visible");
              }, i * 80);
            });
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        !noPadding && "py-20 md:py-28 lg:py-32",
        alt && "bg-[#f8fdf9]",
        className,
      )}
    >
      {children}
    </section>
  );
}
