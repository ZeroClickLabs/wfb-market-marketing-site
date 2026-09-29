import Link from "next/link";
import { useId, type AnchorHTMLAttributes } from "react";
import { ART } from "./art.generated";

export type Tone =
  | "heirloom" | "bay" | "corn" | "kale" | "beet" | "deep" | "sage" | "kraft" | "canvas" | "paper"
  | "kale-tint" | "bay-tint" | "heirloom-tint" | "corn-tint" | "beet-tint";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function toneVar(tone: Tone | undefined) {
  return tone ? `var(--${tone})` : undefined;
}

/** Inline brand art with its "__U__" id placeholders made unique to this instance. */
export function useArt(key: string) {
  const uid = "wfb" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return { __html: (ART[key] ?? "").split("__U__").join(uid) };
}

/** An <a> that uses client-side navigation for internal routes. */
export function SmartLink({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  if (href.startsWith("/")) return <Link href={href} {...rest} />;
  return <a href={href} {...rest} />;
}
