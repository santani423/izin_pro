import { CLIENTS } from "@/lib/constants";

/* ─── Section: Dipercaya Oleh (Marquee Logo Klien) ─── */
export default function TrustedBySection() {
  /* Duplikat untuk loop seamless */
  const doubled = [...CLIENTS, ...CLIENTS];

  return (
    <div className="py-10 bg-white border-y border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 mb-5">
        <p className="text-center text-sm text-gray-400 font-medium">
          Dipercaya lebih dari{" "}
          <span className="text-primary font-semibold">500+ perusahaan</span> di seluruh
          Indonesia
        </p>
      </div>

      {/* Track marquee */}
      <div className="relative">
        {/* Fade kiri */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        {/* Fade kanan */}
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />

        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {doubled.map((client, idx) => (
            <div
              key={`${client.name}-${idx}`}
              className="flex items-center gap-2.5 mx-5 flex-shrink-0 px-5 py-2.5 rounded-xl border border-gray-100 bg-white hover:border-primary/20 hover:shadow-sm transition-all cursor-default"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: client.color }}
              />
              <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                {client.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
