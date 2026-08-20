import Image from "next/image";
import { CheckCircle2, Eye, Target } from "lucide-react";

import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import type { AboutVisiMisi } from "@/lib/hydrate-about-content";

/* ─── Visi & Misi — dua kartu berdampingan ─── */
export default async function TentangVisiMisiSection({ content }: { content: AboutVisiMisi }) {
  const dict = getDictionary(await getLocale());
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pb-14 sm:px-6 md:grid-cols-2 lg:px-8">
      {/* Visi — gambar skyline jadi background penuh kartu, transparan kalau gambar punya area transparan */}
      <div className="relative isolate flex min-h-[22rem] flex-col overflow-hidden rounded-2xl bg-transparent p-6">
        <Image
          src={content.visionImageUrl}
          alt={dict.tentangVisiMisi.visionImageAlt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/50 to-black/10" />
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm">
            <Eye className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold text-white">{dict.tentangVisiMisi.visionHeading}</h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-white/85 sm:ml-[3.25rem] sm:text-base">
          {content.vision}
        </p>
      </div>

      {/* Misi — gambar ilustrasi jadi background penuh kartu, transparan kalau gambar punya area transparan/belum diisi */}
      <div className="relative isolate flex min-h-[22rem] flex-col overflow-hidden rounded-2xl bg-transparent p-6">
        {content.missionImageUrl && (
          <Image
            src={content.missionImageUrl}
            alt={dict.tentangVisiMisi.missionImageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="-z-10 object-cover"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/50 to-black/10" />
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm">
            <Target className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold text-white">{dict.tentangVisiMisi.missionHeading}</h2>
        </div>
        <ul className="mt-4 space-y-3.5 sm:ml-[3.25rem]">
          {content.mission.map((item, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-white"
                aria-hidden="true"
              />
              <span className="text-sm leading-relaxed text-white/90 sm:text-base">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
