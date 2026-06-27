"use client";

import { useState } from "react";
import { Play, X, Clock } from "lucide-react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import { VIDEO_TESTIMONIALS } from "@/lib/constants";
import type { VideoTestimonialItem } from "@/types";

/* ─── Modal Video ─── */
function VideoModal({
  video,
  onClose,
}: {
  video: VideoTestimonialItem;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
        >
          <X size={18} />
        </button>
        <div
          className={`aspect-video bg-gradient-to-br ${video.gradient} flex items-center justify-center`}
        >
          <div className="text-center text-white/70">
            <Play size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">{video.name}</p>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-bold text-gray-900">{video.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{video.role}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Section: Video Testimoni ─── */
export default function VideoTestimonialsSection() {
  const [activeVideo, setActiveVideo] = useState<VideoTestimonialItem | null>(null);

  return (
    <>
      <SectionWrapper id="video-testimoni">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-10 reveal">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Video Testimoni
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Pengalaman Nyata Klien Kami
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Dengarkan langsung cerita sukses dari para klien yang telah mempercayakan
              perizinan bisnis mereka kepada IzinPro.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {VIDEO_TESTIMONIALS.map((video, i) => (
              <button
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className="reveal group relative rounded-2xl overflow-hidden aspect-[3/4] text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${video.gradient}`}
                />
                {/* Overlay gelap */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                {/* Tombol play */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 group-hover:bg-white/30 backdrop-blur-sm transition-all group-hover:scale-110">
                    <Play size={18} className="text-white ml-0.5" />
                  </div>
                </div>

                {/* Durasi */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/30 text-white text-xs">
                  <Clock size={10} />
                  {video.duration}
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="text-white text-xs font-semibold leading-tight">
                    {video.name}
                  </div>
                  <div className="text-white/70 text-xs mt-0.5 leading-tight">{video.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </>
  );
}
