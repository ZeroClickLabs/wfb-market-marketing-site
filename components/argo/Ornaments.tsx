// Flat holiday decorations for Christmas at The Argo, drawn in the event's palette.
// PLACEHOLDER ART: simple shapes to carry the look until a designer or real photography
// replaces them. All are decorative and hidden from screen readers.

import type { ReactNode } from "react";

const INK = "#2a1512";
const RED = "#b3262b";
const RED_DEEP = "#7a161a";
const GREEN = "#2f6b47";
const GREEN_DEEP = "#1d4a33";
const GOLD = "#e9b949";
const CREAM = "#fbf1dc";
const GINGER = "#b8692e";

export type OrnamentName = "gift" | "star" | "bauble" | "candy-cane" | "cookie" | "mug" | "holly" | "tree";

const stroke = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const ART: Record<OrnamentName, ReactNode> = {
  gift: (
    <>
      <rect x="16" y="42" width="68" height="50" rx="3" fill={RED} {...stroke} />
      <rect x="10" y="30" width="80" height="16" rx="3" fill={RED_DEEP} {...stroke} />
      <rect x="44" y="30" width="12" height="62" fill={GOLD} {...stroke} />
      <path d="M50 30 C38 12 20 16 28 26 C32 31 44 31 50 30 Z" fill={GOLD} {...stroke} />
      <path d="M50 30 C62 12 80 16 72 26 C68 31 56 31 50 30 Z" fill={GOLD} {...stroke} />
    </>
  ),
  star: (
    <path d="M50 8 L61 36 L91 38 L68 57 L76 87 L50 70 L24 87 L32 57 L9 38 L39 36 Z" fill={GOLD} {...stroke} />
  ),
  bauble: (
    <>
      <path d="M50 4 V14" {...stroke} fill="none" />
      <rect x="40" y="14" width="20" height="12" rx="2" fill={GOLD} {...stroke} />
      <circle cx="50" cy="60" r="34" fill={GREEN} {...stroke} />
      <path d="M17 54 Q50 66 83 54" fill="none" stroke={GOLD} strokeWidth="6" />
      <path d="M19 70 Q50 82 81 70" fill="none" stroke={CREAM} strokeWidth="4" />
      <path d="M32 40 Q38 34 46 32" fill="none" stroke={CREAM} strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  "candy-cane": (
    <>
      <path d="M40 94 V36 A18 18 0 0 1 76 36 V44" fill="none" stroke={INK} strokeWidth="19" strokeLinecap="round" />
      <path d="M40 94 V36 A18 18 0 0 1 76 36 V44" fill="none" stroke={CREAM} strokeWidth="13" strokeLinecap="round" />
      <path d="M40 94 V36 A18 18 0 0 1 76 36 V44" fill="none" stroke={RED} strokeWidth="13" strokeDasharray="7 9" />
    </>
  ),
  cookie: (
    <>
      <path d="M50 8 L60 32 L88 30 L68 50 L80 78 L50 66 L20 78 L32 50 L12 30 L40 32 Z" fill={GINGER} {...stroke} />
      <path d="M50 20 L57 36 L74 35 L62 48 L69 66 L50 58 L31 66 L38 48 L26 35 L43 36 Z" fill="none" stroke={CREAM} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="50" cy="46" r="4" fill={RED} />
    </>
  ),
  mug: (
    <>
      <path d="M40 8 C34 16 46 20 40 28 M54 8 C48 16 60 20 54 28" fill="none" stroke={CREAM} strokeWidth="4" strokeLinecap="round" />
      <path d="M70 46 H78 A12 12 0 0 1 78 70 H70" fill="none" {...stroke} strokeWidth={8} />
      <path d="M70 46 H78 A12 12 0 0 1 78 70 H70" fill="none" stroke={CREAM} strokeWidth="3" />
      <path d="M18 36 H72 V78 A12 12 0 0 1 60 90 H30 A12 12 0 0 1 18 78 Z" fill={CREAM} {...stroke} />
      <rect x="18" y="52" width="54" height="12" fill={RED} />
      <path d="M18 52 H72 M18 64 H72" {...stroke} fill="none" />
    </>
  ),
  holly: (
    <>
      <path d="M50 52 C40 30 18 34 8 42 C18 44 16 52 24 54 C22 60 30 64 34 60 C38 66 46 62 50 52 Z" fill={GREEN} {...stroke} />
      <path d="M50 52 C60 30 82 34 92 42 C82 44 84 52 76 54 C78 60 70 64 66 60 C62 66 54 62 50 52 Z" fill={GREEN_DEEP} {...stroke} />
      <circle cx="42" cy="58" r="9" fill={RED} {...stroke} />
      <circle cx="58" cy="58" r="9" fill={RED} {...stroke} />
      <circle cx="50" cy="70" r="9" fill={RED} {...stroke} />
    </>
  ),
  tree: (
    <>
      <rect x="43" y="80" width="14" height="14" fill={GINGER} {...stroke} />
      <path d="M50 18 L80 58 H64 L86 82 H14 L36 58 H20 Z" fill={GREEN} {...stroke} />
      <path d="M50 4 L54 13 L64 14 L56 20 L59 30 L50 24 L41 30 L44 20 L36 14 L46 13 Z" fill={GOLD} {...stroke} strokeWidth={2} />
      <circle cx="42" cy="50" r="4" fill={RED} /><circle cx="60" cy="66" r="4" fill={GOLD} /><circle cx="38" cy="72" r="4" fill={CREAM} /><circle cx="56" cy="40" r="3.5" fill={CREAM} />
    </>
  ),
};

export function HolidayOrnament({ name, className }: { name: OrnamentName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" width={100} height={100} aria-hidden="true" focusable="false">
      {ART[name]}
    </svg>
  );
}
