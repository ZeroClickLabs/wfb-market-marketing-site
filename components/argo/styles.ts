import { cx } from "@/components/wfb/utils";

// Shared Tailwind class strings for Christmas at The Argo's holiday look.
// Colours come from the argo-* palette in app/globals.css. Numbers 5–9 on the spacing scale
// are the brand's (p-5 = 24px, p-6 = 32px, p-7 = 48px, p-8 = 72px).

/** Put on the outermost element of any Argo area: sets the font and a focus ring that shows on every ground.
 *  Grounds and cards change --argo-focus (gold on red and green, green on cream and paper). */
export const ARGO_ROOT = cx(
  "font-sans [--argo-focus:var(--color-argo-gold)]",
  "[&_:is(a,button,input,summary):focus-visible]:outline-3 [&_:is(a,button,input,summary):focus-visible]:outline-offset-2",
  "[&_:is(a,button,input,summary):focus-visible]:outline-solid [&_:is(a,button,input,summary):focus-visible]:outline-(--argo-focus)",
);

/** The kit Button, recoloured. Utilities override the kit's CSS, so pass these as className. */
export const ARGO_BUTTON = {
  /** Gold, the main action. */
  accent: "border-argo-red-deep bg-argo-gold text-argo-red-deep shadow-none hover:bg-argo-gold-light hover:shadow-[3px_3px_0_var(--color-argo-red-deep)]",
  /** Cream outline on the red and green grounds. */
  outlineOnDark: "border-argo-cream bg-transparent text-argo-cream shadow-none hover:bg-argo-cream hover:text-argo-red-deep hover:shadow-[3px_3px_0_var(--color-argo-gold)]",
  /** Ink outline on cream and paper. */
  outlineOnLight: "border-argo-ink bg-argo-paper text-argo-ink shadow-none hover:bg-argo-gold-light hover:text-argo-ink hover:shadow-[3px_3px_0_var(--color-argo-gold)]",
  /** Green, for form submit buttons. */
  primary: "border-argo-ink bg-argo-green text-argo-cream shadow-none hover:bg-argo-green-deep hover:shadow-none",
};

/** A paper card with a gold outline and a print shadow. */
export const ARGO_CARD = cx(
  "relative flex flex-col gap-2.5 rounded-[14px] border-3 border-argo-gold bg-argo-paper p-5 text-argo-ink",
  "shadow-[6px_6px_0_rgba(0,0,0,.28)] [--argo-focus:var(--color-argo-green)]",
);

/** A small uppercase label in the logo's serif. Gold on dark grounds, darker gold on cream. */
export const ARGO_KICKER = "m-0 font-argo text-[14px] leading-[20px] font-bold uppercase tracking-[.28em] text-argo-gold in-data-[ground=cream]:text-argo-gold-text";

/** Section title in the logo's serif. */
export const ARGO_H2 = "mt-1.5 mb-0 font-argo text-[clamp(34px,4.6vw,52px)] leading-[1.1] font-bold text-argo-gold in-data-[ground=cream]:text-argo-red";

/** Paragraph copy. */
export const ARGO_BODY = "mt-0 mb-4 font-sans text-[18px] leading-[30px]";

/** A row of buttons. */
export const ARGO_ACTIONS = "mt-5 flex flex-wrap gap-3";
