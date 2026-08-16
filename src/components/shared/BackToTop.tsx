"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useDictionary } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

/* ─── Tombol Kembali ke Atas ─── */
export default function BackToTop() {
  const dict = useDictionary();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      onClick={scrollToTop}
      aria-label={dict.backToTop.ariaLabel}
      className={cn(
        "fixed bottom-24 right-6 z-50 flex items-center justify-center w-10 h-10 rounded-full",
        "bg-white border border-gray-200 shadow-md text-gray-500 hover:text-primary hover:border-primary",
        "transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
      )}
    >
      <ArrowUp size={16} />
    </button>
  );
}
