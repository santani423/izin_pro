"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import { TESTIMONIALS } from "@/lib/constants";

/* ─── Section: Testimoni Klien ─── */
export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const total = TESTIMONIALS.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = () => setCurrent((c) => (c - 1 + total) % total);

  /* Auto-play setiap 5 detik */
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  /* Hitung indeks yang ditampilkan (1 mobile, 2 tablet, 3 desktop) */
  const getVisible = () => {
    return [
      TESTIMONIALS[current % total],
      TESTIMONIALS[(current + 1) % total],
      TESTIMONIALS[(current + 2) % total],
    ];
  };

  return (
    <SectionWrapper id="testimoni" alt>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="text-center mb-10 reveal">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            Testimoni
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Kata Klien Kami</h2>
          <p className="text-gray-500 mt-3">
            Kepercayaan klien adalah prioritas utama kami. Ini yang mereka katakan.
          </p>
        </div>

        {/* Slider */}
        <div className="reveal overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {getVisible().map((t, i) => (
              <div
                key={`${t.id}-${current}-${i}`}
                className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col transition-all duration-300 ${
                  i === 2 ? "hidden lg:flex" : i === 1 ? "hidden md:flex" : "flex"
                }`}
              >
                {/* Quote mark */}
                <div className="text-6xl font-serif text-primary/15 leading-none select-none mb-2">
                  "
                </div>

                {/* Rating */}
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Teks */}
                <p className="text-sm text-gray-700 leading-relaxed flex-1">{t.content}</p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-200">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} text-white text-xs font-bold flex-shrink-0`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500">
                      {t.role}, {t.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kontrol slider */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 hover:border-primary hover:text-primary text-gray-400 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1.5">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 h-2 bg-primary"
                    : "w-2 h-2 bg-gray-200 hover:bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 hover:border-primary hover:text-primary text-gray-400 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
