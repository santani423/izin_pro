import {
  IdCard,
  FileText,
  FileCheck,
  Mail,
  Smartphone,
  House,
  ShieldCheck,
  BadgeCheck,
  Clock,
  Wallet,
  Building2,
  Briefcase,
  Award,
  Users,
  Headset,
  CheckCircle2,
  Leaf,
  Ship,
  Tag,
  HelpCircle,
  MessageSquare,
  Handshake,
  Scale,
  Network,
  UserPlus,
  LogIn,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import type { DOMOutputSpec } from "@tiptap/pm/model";

/** Ikon pilihan buat kartu di Card Grid — dua representasi:
 * - ICON_COMPONENTS: komponen React asli, dipakai di picker & preview editor.
 * - ICON_PATHS: data path SVG mentah (disalin dari source lucide-react),
 *   dipakai renderHTML() Tiptap yang butuh output HTML statis (bukan React). */

export const ICON_COMPONENTS: Record<string, LucideIcon> = {
  "id-card": IdCard,
  "file-text": FileText,
  "file-check": FileCheck,
  mail: Mail,
  smartphone: Smartphone,
  house: House,
  "shield-check": ShieldCheck,
  "badge-check": BadgeCheck,
  clock: Clock,
  wallet: Wallet,
  "building-2": Building2,
  briefcase: Briefcase,
  award: Award,
  users: Users,
  headset: Headset,
  "check-circle-2": CheckCircle2,
  leaf: Leaf,
  ship: Ship,
  tag: Tag,
  "help-circle": HelpCircle,
  "message-square": MessageSquare,
  handshake: Handshake,
  scale: Scale,
  network: Network,
  "user-plus": UserPlus,
  "log-in": LogIn,
  "list-checks": ListChecks,
};

export const ICON_NAMES = Object.keys(ICON_COMPONENTS);

type IconNode = [string, Record<string, string>][];

const ICON_PATHS: Record<string, IconNode> = {
  "user-plus": [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
    ["circle", { cx: "9", cy: "7", r: "4" }],
    ["line", { x1: "19", x2: "19", y1: "8", y2: "14" }],
    ["line", { x1: "22", x2: "16", y1: "11", y2: "11" }],
  ],
  "log-in": [
    ["path", { d: "m10 17 5-5-5-5" }],
    ["path", { d: "M15 12H3" }],
    ["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" }],
  ],
  "list-checks": [
    ["path", { d: "M13 5h8" }],
    ["path", { d: "M13 12h8" }],
    ["path", { d: "M13 19h8" }],
    ["path", { d: "m3 17 2 2 4-4" }],
    ["path", { d: "m3 7 2 2 4-4" }],
  ],
  "id-card": [
    ["path", { d: "M16 10h2" }],
    ["path", { d: "M16 14h2" }],
    ["path", { d: "M6.17 15a3 3 0 0 1 5.66 0" }],
    ["circle", { cx: "9", cy: "11", r: "2" }],
    ["rect", { x: "2", y: "5", width: "20", height: "14", rx: "2" }],
  ],
  "file-text": [
    [
      "path",
      {
        d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      },
    ],
    ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
    ["path", { d: "M10 9H8" }],
    ["path", { d: "M16 13H8" }],
    ["path", { d: "M16 17H8" }],
  ],
  "file-check": [
    [
      "path",
      {
        d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      },
    ],
    ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
    ["path", { d: "m9 15 2 2 4-4" }],
  ],
  mail: [
    ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" }],
    ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2" }],
  ],
  smartphone: [
    ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2" }],
    ["path", { d: "M12 18h.01" }],
  ],
  house: [
    ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }],
    [
      "path",
      {
        d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
      },
    ],
  ],
  "shield-check": [
    [
      "path",
      {
        d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      },
    ],
    ["path", { d: "m9 12 2 2 4-4" }],
  ],
  "badge-check": [
    [
      "path",
      {
        d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
      },
    ],
    ["path", { d: "m9 12 2 2 4-4" }],
  ],
  clock: [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["path", { d: "M12 6v6l4 2" }],
  ],
  wallet: [
    [
      "path",
      {
        d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",
      },
    ],
    ["path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" }],
  ],
  "building-2": [
    ["path", { d: "M10 12h4" }],
    ["path", { d: "M10 8h4" }],
    ["path", { d: "M14 21v-3a2 2 0 0 0-4 0v3" }],
    [
      "path",
      {
        d: "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2",
      },
    ],
    ["path", { d: "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" }],
  ],
  briefcase: [
    ["path", { d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" }],
    ["rect", { width: "20", height: "14", x: "2", y: "6", rx: "2" }],
  ],
  award: [
    [
      "path",
      {
        d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
      },
    ],
    ["circle", { cx: "12", cy: "8", r: "6" }],
  ],
  users: [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
    ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744" }],
    ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }],
    ["circle", { cx: "9", cy: "7", r: "4" }],
  ],
  headset: [
    [
      "path",
      {
        d: "M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z",
      },
    ],
    ["path", { d: "M21 16v2a4 4 0 0 1-4 4h-5" }],
  ],
  "check-circle-2": [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["path", { d: "m9 12 2 2 4-4" }],
  ],
  leaf: [
    [
      "path",
      { d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" },
    ],
    ["path", { d: "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" }],
  ],
  ship: [
    ["path", { d: "M12 10.189V14" }],
    ["path", { d: "M12 2v3" }],
    ["path", { d: "M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" }],
    [
      "path",
      {
        d: "M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76",
      },
    ],
    [
      "path",
      {
        d: "M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      },
    ],
  ],
  tag: [
    [
      "path",
      {
        d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
      },
    ],
    ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor" }],
  ],
  "help-circle": [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }],
    ["path", { d: "M12 17h.01" }],
  ],
  "message-square": [
    [
      "path",
      {
        d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
      },
    ],
  ],
  handshake: [
    ["path", { d: "m11 17 2 2a1 1 0 1 0 3-3" }],
    [
      "path",
      {
        d: "m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4",
      },
    ],
    ["path", { d: "m21 3 1 11h-2" }],
    ["path", { d: "M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" }],
    ["path", { d: "M3 4h8" }],
  ],
  scale: [
    ["path", { d: "M12 3v18" }],
    ["path", { d: "m19 8 3 8a5 5 0 0 1-6 0zV7" }],
    ["path", { d: "M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1" }],
    ["path", { d: "m5 8 3 8a5 5 0 0 1-6 0zV7" }],
    ["path", { d: "M7 21h10" }],
  ],
  network: [
    ["rect", { x: "16", y: "16", width: "6", height: "6", rx: "1" }],
    ["rect", { x: "2", y: "16", width: "6", height: "6", rx: "1" }],
    ["rect", { x: "9", y: "2", width: "6", height: "6", rx: "1" }],
    ["path", { d: "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" }],
    ["path", { d: "M12 12V8" }],
  ],
};

/** Bangun DOMOutputSpec <svg> statis buat renderHTML() — dipakai di luar
 * konteks React, jadi gak bisa langsung render komponen LucideIcon. */
export function iconSvgSpec(name: string, className: string): DOMOutputSpec {
  const nodes = ICON_PATHS[name];
  if (!nodes) return ["span", {}];
  return [
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      class: className,
    },
    ...nodes,
  ] as unknown as DOMOutputSpec;
}
