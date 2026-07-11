import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/Reveal";
import { TENTANG_TEAM } from "@/lib/tentang";

/* Ikon LinkedIn inline — ikon brand tidak tersedia di lucide-react versi ini */
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

/* Inisial nama untuk placeholder foto, mis. "Andi Setiawan" → "AS" */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ─── Tim profesional — grid 4 kartu anggota ─── */
export default function TentangTeamSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Tim <span className="text-primary">Profesional</span> Kami
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Didukung oleh tim ahli berpengalaman yang siap membantu kebutuhan
          perizinan bisnis Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TENTANG_TEAM.map(({ name, role }, index) => (
          <Reveal key={name} delay={index * 0.08}>
            <Card className="group h-full gap-0 overflow-hidden rounded-xl border-border/60 py-0">
              {/* Placeholder foto anggota — gradient + inisial */}
              <div
                role="img"
                aria-label={`Foto ${name}, ${role} IzinPro`}
                className="grid aspect-[4/3] w-full place-items-center bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
              >
                <span className="text-3xl font-extrabold text-white/85">
                  {getInitials(name)}
                </span>
              </div>
              <CardContent className="flex items-center justify-between gap-3 px-4 py-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {role}
                  </p>
                </div>
                <a
                  href="#"
                  aria-label={`LinkedIn ${name}`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <LinkedinIcon className="size-4" />
                </a>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
