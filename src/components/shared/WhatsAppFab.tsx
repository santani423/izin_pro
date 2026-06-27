"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

/* ─── Floating Action Button WhatsApp ─── */
export default function WhatsAppFab() {
  const [showTooltip, setShowTooltip] = useState(false);

  const waUrl = `https://wa.me/${COMPANY_INFO.whatsapp}?text=Halo%20IzinPro%2C%20saya%20ingin%20konsultasi%20gratis%20mengenai%20perizinan%20bisnis.`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Tooltip */}
      {showTooltip && (
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-3.5 pr-10 max-w-[220px] animate-fade-up">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-600"
          >
            <X size={13} />
          </button>
          <p className="text-xs font-semibold text-gray-900 mb-1">Chat dengan kami!</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Konsultasi gratis perizinan bisnis Anda sekarang.
          </p>
        </div>
      )}

      {/* Tombol */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat WhatsApp"
        className="animate-pulse-ring flex items-center justify-center w-14 h-14 rounded-full bg-[#25d366] text-white shadow-lg shadow-[#25d366]/30 hover:scale-105 active:scale-95 transition-transform"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.528 5.843L0 24l6.335-1.508A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.848 0-3.586-.48-5.1-1.32L2.8 21.8l1.14-4.04A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      </a>
    </div>
  );
}
