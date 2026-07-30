import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/Reveal";
import type { AboutTeamSettings } from "@/lib/hydrate-about-content";

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

export interface TeamMemberCard {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
}

/* ─── Tim profesional — grid 4 kartu anggota ─── */
export default function TentangTeamSection({
  settings,
  members,
}: {
  settings: AboutTeamSettings;
  members: TeamMemberCard[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {settings.title} <span className="text-primary">{settings.titleHighlight}</span> Kami
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {settings.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {members.map(({ id, name, role, photoUrl, linkedinUrl }, index) => (
          <Reveal key={id} delay={index * 0.08}>
            <Card className="group h-full gap-0 overflow-hidden rounded-xl border-border/60 py-0">
              {photoUrl ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={photoUrl}
                    alt={`Foto ${name}, ${role} IzinPro`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  role="img"
                  aria-label={`Foto ${name}, ${role} IzinPro`}
                  className="grid aspect-[4/3] w-full place-items-center bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
                >
                  <span className="text-3xl font-extrabold text-white/85">
                    {getInitials(name)}
                  </span>
                </div>
              )}
              <CardContent className="flex items-center justify-between gap-3 px-4 py-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {role}
                  </p>
                </div>
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`LinkedIn ${name}`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#0a9bff] text-white transition-colors hover:bg-[#0a66c2]"
                  >
                    <LinkedinIcon className="size-4" />
                  </a>
                )}
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
