"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, ArrowRight, CheckCircle2, SlidersHorizontal,
  Building2, ClipboardList, FileText, Clock, List,
  UserCheck, Briefcase, Globe, Receipt, Tag, Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVICES } from "@/lib/constants";

/* ─── Ikon per key ─── */
const ICONS: Record<string, React.ElementType> = {
  building: Building2,
  clipboard: ClipboardList,
  "file-text": FileText,
  clock: Clock,
  list: List,
  "user-check": UserCheck,
  briefcase: Briefcase,
  globe: Globe,
  receipt: Receipt,
  tag: Tag,
  monitor: Monitor,
};

/* ─── Kategori per slug ─── */
const CATEGORY_MAP: Record<string, string> = {
  "pendirian-pt": "Legalitas Usaha",
  "nib": "Perizinan",
  "izin-usaha": "Perizinan",
  "izin-komersial": "Perizinan",
  "perizinan-lainnya": "Perizinan",
  "pt-perorangan": "Legalitas Usaha",
  "cv-firma": "Legalitas Usaha",
  "pma": "Corporate",
  "npwp-badan-pkp": "Perpajakan",
  "pendaftaran-merk": "HKI",
  "virtual-office": "Corporate",
};

const CATEGORIES = ["Semua", "Legalitas Usaha", "Perizinan", "Perpajakan", "HKI", "Corporate"];

/* ─── Catalog: search + filter + grid ─── */
export default function ServicesCatalog() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return SERVICES.filter((s) => {
      const matchQuery =
        q === "" ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);
      const matchCategory =
        activeCategory === "Semua" || CATEGORY_MAP[s.slug] === activeCategory;
      return matchQuery && matchCategory;
    });
  }, [query, activeCategory]);

  return (
    <>
      {/* ─── Search + Filter ─── */}
      <div className="flex flex-col items-center gap-3 mb-7">

        {/* Search input */}
        <div className="relative w-full max-w-xl">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari layanan..."
            className="w-full h-12 pl-11 pr-5 rounded-full border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                activeCategory === cat
                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary",
              )}
            >
              <SlidersHorizontal size={13} />
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Empty state ─── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Search size={24} className="text-gray-300" />
          </div>
          <p className="text-base font-semibold text-gray-700">Layanan tidak ditemukan</p>
          <p className="text-sm text-gray-400 mt-1">Coba kata kunci lain atau ubah kategori</p>
          <button
            onClick={() => { setQuery(""); setActiveCategory("Semua"); }}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Reset filter
          </button>
        </div>
      )}

      {/* ─── Grid ─── */}
      {filtered.length > 0 && (
        <>
          <p className="text-sm text-gray-400 mb-5">
            Menampilkan <span className="font-semibold text-gray-600">{filtered.length}</span> layanan
            {activeCategory !== "Semua" && (
              <> dalam kategori <span className="font-semibold text-primary">{activeCategory}</span></>
            )}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((service) => {
              const Icon = ICONS[service.icon] ?? FileText;
              const category = CATEGORY_MAP[service.slug];
              return (
                <div
                  key={service.id}
                  className="flex flex-col p-7 bg-white rounded-3xl border border-gray-200 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Header kartu */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="flex items-center justify-center w-14 h-14 rounded-2xl"
                      style={{ backgroundColor: service.bgColor }}
                    >
                      <Icon size={26} style={{ color: service.color }} />
                    </div>
                    {category && (
                      <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                        {category}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{service.description}</p>

                  <ul className="space-y-2 mb-6 flex-1">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <CheckCircle2 size={15} className="text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/layanan/${service.slug}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
                  >
                    Selengkapnya
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
