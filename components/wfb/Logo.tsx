/* eslint-disable @next/next/no-img-element -- the marks are SVG files served as-is; next/image adds nothing here */
import { cx, SmartLink, useArt } from "./utils";

const LOGO_LABEL = "Whitefish Bay Farmers Market";

const FILES = {
  emblem: { file: "emblem.svg", width: 240, ratio: 1 },
  badge: { file: "emblem-no-ribbon.svg", width: 200, ratio: 1 },
  icon: { file: "icon.svg", width: 64, ratio: 1 },
  lockup: { file: "lockup.svg", width: 360, ratio: 240 / 880 },
  "lockup-reverse": { file: "lockup-reverse.svg", width: 360, ratio: 240 / 880 },
  night: { file: "night-market.svg", width: 260, ratio: 300 / 520 },
  winter: { file: "winter-market.svg", width: 260, ratio: 300 / 520 },
  popup: { file: "pop-up-market.svg", width: 260, ratio: 300 / 520 },
} as const;

export interface LogoProps {
  variant?: keyof typeof FILES;
  /** px */
  width?: number;
  href?: string;
  /** Accessible name; defaults to "Whitefish Bay Farmers Market". Pass "" when a parent already names it. */
  label?: string;
  className?: string;
}

/** The approved marks, from the files in brand/assets/logos (copied to public/ by `npm run sync:brand`). */
export function Logo({ variant = "emblem", width, href, label = LOGO_LABEL, className }: LogoProps) {
  const spec = FILES[variant];
  const w = width ?? spec.width;
  const img = (
    <img src={`/brand/logos/${spec.file}`} alt={label} width={w} height={Math.round(w * spec.ratio)} />
  );
  const cls = cx("wfb-logo", className);
  if (href) return <SmartLink href={href} className={cls} style={{ width: w }}>{img}</SmartLink>;
  return <span className={cls} style={{ width: w }}>{img}</span>;
}

export type IllustrationName = "tomato" | "sweet-corn" | "carrots" | "apple" | "bread" | "sunflower";

export interface IllustrationProps {
  name: IllustrationName;
  size?: number;
  /** Only when the image carries meaning. */
  label?: string;
  className?: string;
}

export function Illustration({ name, size, label, className }: IllustrationProps) {
  const html = useArt("illo-" + name);
  return (
    <span
      className={cx("wfb-illo", className)}
      style={size ? { width: size } : undefined}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={html}
    />
  );
}
