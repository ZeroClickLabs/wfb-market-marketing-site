# Whitefish Bay Farmers Market: brand kit for the website build

This folder is the Market's design system. Treat it as the source of truth for everything visual on the site. Read `design-system/README.md` (the brand book) before building any UI, then the component doc for whatever you're building.

## What's here

| Path | What it is | How to use it |
|---|---|---|
| `design-system/README.md` | Brand book: idea, logo rules, voice, colour, type, layout, illustration, iconography | Read first. Follow its rules; they name the tokens to use. |
| `design-system/guidelines/*.md` | Web/social/email, print, accessibility, partners | `20-web-social-email.md` defines the page anatomy and the directory, events and hours patterns. |
| `design-system/components/<Name>.md` | Guidance per component: purpose, props, do/don't | Read the matching doc before building each piece. |
| `tokens/tokens.json` | All tokens (colour for light and dark themes, type, spacing, radius, shadow, sizes) | Source for a Tailwind theme or any token pipeline. |
| `tokens/tokens.css` | The same tokens as CSS custom properties, plus a class per type style | Import globally. The light theme is the default; set `data-theme="dark"` on `<html>` for the Night Market theme. |
| `reference/bundle.js` + `bundle.css` | Working reference implementation: 24 React 18 components (UMD, global `WFBMarket`) | This is the visual spec in code. Match its markup, class structure, spacing and states. |
| `reference/components.source.js` | Readable source of the components (the `__ICONS__`/`__ART__` placeholders are filled in `bundle.js`) | Port from this rather than from the minified bundle. |
| `reference/index.d.ts` | Props for every component | The API to reproduce. |
| `reference/homepage.html` | The complete reference home page. Open it in a browser; React is included in `reference/lib`, and the fonts load from Google | The target for the home page, pixel for pixel. |
| `assets/logos` | Approved marks, SVG with outlined lettering, plus PNG | Use the files as they are. Never redraw, recolour or retype a mark. |
| `assets/illustrations`, `assets/patterns`, `assets/icons` | Linocut produce illustrations, lakefront panorama, awning/wave/sprig patterns, 19 line icons | Use as-is. Inline the icons as SVG with `stroke="currentColor"`. |

## How to build

1. **Pick the stack with the owner** before writing code. Port the components to it (Astro, Next.js or plain HTML are all fine). Keep the component names and props from `index.d.ts` so the docs still apply.
2. **Tokens first.** Load `tokens/tokens.css` globally and use only its variables. Never hard-code hex values, font stacks or spacing that a token covers. If you use Tailwind, generate the theme from `tokens.json`.
3. **Fonts.** Load them from Google Fonts: League Gothic (display, headlines only, uppercase), Yellowtail (script, accent lines of five words or fewer, never for information) and Public Sans 400/600/700/800 (everything else). Preconnect, and use `display=swap`.
4. **Page anatomy.** Follow the home page: `AnnouncementBar` → `SiteHeader` (utility row plus a header where the badge breaks below the double rule) → `Hero` → awning `SectionEdge` → sections alternating kraft, deep and canvas grounds, changing ground only through `SectionEdge` waves → `NewsletterBand` → `SiteFooter`. Every section opens with a `SectionHeading` (script eyebrow, display title, sprig ornament).
5. **The look.** Use ink outlines (3px on cards, 2px on controls), flat colour, print-offset shadows (`--shadow-print`, never blurred), pill buttons with uppercase eyebrow labels, and one `accent` (heirloom) button per view. The only gradients are the sunburst rays.
6. **Accessibility is required, not optional.** Keep the 3px focus ring with its 2px offset, touch targets of at least 44px, visible labels on every field, status shown with words as well as colour, `aria-hidden` on decorative illustrations, and respect for `prefers-reduced-motion`. Check contrast for any new colour pairing: text needs 4.5:1 in both themes.
7. **Content voice.** Put the facts first: "Saturday, June 6 · 8 am–1 pm". Use sentence-case buttons with 2–3 word verbs. No emoji. SNAP/EBT copy stays dignified. See the brand book's content section.

## Placeholder content to replace

The vendor names and towns, the event dates and locations, "hello@example.org", the social links and the sponsor slots are all samples. Ask the owner for real content, and don't publish placeholders.

## Suggested site map

Home · Visit (hours, map, parking, what to bring) · Vendors (directory with category filters) · Events & markets (Summer, Night, Pop-Up, Winter) · Food access (SNAP/EBT, Market Match) · Get involved (volunteer, sell with us, sponsor) · Contact. Night Market pages use the dark theme.
