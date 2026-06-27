import SectionWrapper from "@/components/shared/SectionWrapper";
import { CLIENTS } from "@/lib/constants";

/* ─── Section: Klien Kami — placeholder logo grid ─── */
export default function ClientsSection() {
  return (
    <SectionWrapper id="klien-kami" alt>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="text-center mb-10 reveal">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            Klien Kami
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Dipercaya 500+ Perusahaan
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Dari startup hingga korporasi besar, kami telah membantu ribuan bisnis
            mengurus perizinan di seluruh Indonesia.
          </p>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {CLIENTS.map((client, i) => (
            <div
              key={client.name}
              className="reveal flex flex-col items-center gap-3"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              {/* Placeholder gambar logo */}
              <div className="w-full aspect-[3/2] bg-gray-100 border border-gray-200 rounded-2xl flex items-center justify-center hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-default">
                <svg
                  className="text-gray-300"
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              {/* Placeholder nama perusahaan */}
              <p className="text-xs font-semibold text-gray-500 text-center leading-snug">
                {client.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
