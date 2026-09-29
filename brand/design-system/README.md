Whitefish Bay Farmers Market Corp is a volunteer-run non-profit that runs the village's Saturday summer market and a string of pop-up, night and winter markets. The brand borrows from the things you'd see on a market morning: a screen-printed market poster, a striped canvas awning, a hand-lettered stall sign, and the sun coming up over Lake Michigan (Whitefish Bay faces east). It should feel **handmade, generous and a little festive**, never slick and never corporate.

Build every surface from these tokens, the `WFBMarket` components and the assets named below. If something is missing, compose it from the same parts: condensed caps, a script accent, an ink outline, a flat colour, the awning or the wave.

## The idea: "Fresh from the Bay"

The brand's shorthand is **the lake and the stall**. The *lake* brings the deep water blue, the waves, the sunrise and the whitefish in our name. The *stall* brings the heirloom red, the sweet-corn gold, the awning stripes and the hand-painted lettering. Every layout pairs one of each: a deep band with a red button, a sunburst behind produce, an awning edge above a wave.

**Personality:** neighbourly · abundant · crafted · lakeside · a little old-fashioned (in a good way).

## Logo suite

| Asset | Use it for | Minimum size |
|---|---|---|
| **Bay Badge**: `Logos/emblem.svg` | The primary mark. Posters, the footer, the info tent, merch, the website hero. | 120px / 1.25 in |
| **Badge without ribbon**: `Logos/emblem-no-ribbon.svg` | The site header, social avatars and stamps, anywhere the ribbon would be tiny. | 72px / 0.75 in |
| **Icon**: `Logos/icon.svg` | Favicon, app icon, a stamp on photos, sponsor walls. | 24px |
| **Lockup**: `Logos/lockup.svg` / `lockup-reverse.svg` | Horizontal spaces: email headers, letterhead, banners, co-branding. Use the reverse on `deep`. | 200px wide |
| **Sub-brand tickets**: `night-market.svg`, `winter-market.svg`, `pop-up-market.svg` | The event's poster, its social tiles and its page header. Always shown alongside the Bay Badge or the lockup somewhere on the piece. | 160px wide |

PNG exports (`emblem.png`, `lockup.png`, `lockup-reverse.png`, `icon.png`) are for tools that can't take SVG, like Canva and Word. All lettering is outlined, so the files look identical everywhere with no fonts needed.

- **Clear space:** leave space on every side equal to the height of the letter "W" in the arched name, which is about 12% of the badge's diameter.
- **Grounds:** the badge carries its own `deep` ring, so it works on `canvas`, `paper`, `kraft`, `sage` and photographs. The lockup goes on light grounds, and the reverse lockup on `deep` or `bay`.
- **Don't:** recolour the badge, separate the fish from the badge, set the name in another typeface, stretch any mark, add effects, or place a mark on a busy part of a photo. Never redraw the marks; use the files.
- In the UI, render marks with the `Logo` component (`variant`: `emblem`, `badge`, `icon`, `lockup`, `lockup-reverse`, `night`, `winter`, `popup`).

## Content fundamentals

**Voice.** Talk like a neighbour at the next stall: warm, specific and brief. Say "we" for the Market and "you" for the reader. Facts first (when, where, what to bring), then the colour.

- Date and time together, every time: "Saturday, June 6 · 8 am–1 pm". Lowercase am/pm, en dash for ranges, middle dot `·` between facts.
- Headlines are short and concrete, and they go in `display-*` caps: "FRESH FROM THE BAY", "AT THE MARKET", "MARKETS & EVENTS". Keep them to 2–5 words.
- The script line is an accent written in a human voice, like "Saturdays by the lake", "This week" or "Mark your calendar". Keep it to five words at most, and never put information only in script.
- Buttons are 2–3 word verbs in sentence case, and the CSS sets them in caps: "Plan your visit", "Meet the vendors", "Apply to sell". Never "Click here", "Learn more" or "Submit".
- Name the food and the farm: "Heirloom tomatoes from Lakeview Acres", not "fresh local produce".
- Be plain about weather and changes: "Storms are coming in, so tonight's Night Market is cancelled. See you July 25."
- Write food-access copy with dignity: "We match SNAP/EBT dollars up to $20 every week." No "needy" or "low-income".
- No emoji on the site, on signage or in email. On social media, one produce emoji per post at most.

| Instead of | Write |
|---|---|
| The Farmers Market will be held Saturdays 8:00AM–1:00PM. | Every Saturday, June–September · 8 am–1 pm. |
| Click here to learn about vendor opportunities! | Apply to sell |
| Fresh local produce and more! | Sweet corn is in. So are the first peaches. |

## Visual foundations

**Colour.** The page is `canvas`, the unbleached market-tent colour, with a faint paper grain (`.wfb-grain`). Cards and fields sit on `paper`, and wells and alternate sections on `kraft`. `deep` is the lake at dawn: use it for the utility bar, the "Explore" band and the footer, with `on-deep` text and `corn` or `glass` accents. `bay` is the working brand blue for links, primary buttons and the Summer Market. `heirloom` is the one call to action per view (Accent button), the announcement bar and the ribbon. `corn` is for sunbursts, ornaments, stars and underlines, never as text on light grounds and always with `on-corn` text on it. `sage` grounds the newsletter and food-access bands. `beet` is for the Winter Market only. Tints carry `ink` text. On solid fills use the matching `on-*` token, never a literal white.

**Themes.** "Daylight" (light) is the default. "Night Market" (dark) is a full theme for the Night Market pages and for readers who prefer dark mode. Every text pair named in a token's usage note meets WCAG AA (4.5:1) in both themes.

**Type.** Three voices, each with one job:

- **League Gothic** (`display`): tall, condensed caps like a hand-painted stall sign. Headlines only, always uppercase. Use `display-hero` for the one hero line and `display-1`–`display-3` for sections, cards and tickets.
- **Yellowtail** (`script`): a sign-painter's script for the accent line above a headline, the ribbon, weekday names on tickets and sub-brand marks. Use `script-l` and `script-m`, tilt it −3° to −4° above headlines, colour it `heirloom` on light grounds and `corn` on `deep`.
- **Public Sans** (`sans`): everything people read or act on, from body copy and forms to meta. Use `eyebrow` (800, +0.14em, caps) for navigation, buttons, tags and table heads.

Never set body copy in League Gothic or Yellowtail. Keep reading text within `prose-max`.

**The hero treatment.** Set the headline in `display-hero`, `deep` on light grounds, with a two-step sign-painter shadow (`corn` 4px, then `ink` 6px). Put a script line above it and the sprig `Ornament` below. The hero sits over the corn sunburst, with the lakefront panorama anchored to the bottom and bunting across the top. Use one hero per page.

**Line & outline.** Everything illustrative, and every card, ticket, tile and button, carries a solid `ink` outline (`outline`, 3px on cards and 2px on controls). Pair it with flat colour and no gradients (the sunburst rays are the only exception). The outline is what makes the UI feel screen-printed rather than generic.

**Shadows.** Shadows are print-offset, never blurred: `shadow-print` (4px ink) when a card lifts on hover, `shadow-print-sm` on buttons and badges over art. Use `shadow-soft` only for menus and the sticky header.

**Section rhythm.** A page reads like walking down a row of stalls. Use this order: announcement bar (`heirloom`) → utility bar (`deep`) → header (`canvas`, with the badge breaking below its double rule) → hero → **awning edge** → `kraft` section → **wave edge** → `deep` section → **wave edge** → `canvas` section → `sage` newsletter → **wave edge** → `deep` footer. Change grounds only through a `SectionEdge`, never with a hard line. Pad sections `space-8` (desktop) or `space-7` (mobile). Every section opens with a `SectionHeading`: a script eyebrow, a display title and the sprig ornament.

**Shape.** Buttons and badges are pills (`radius-pill`), cards and tickets use `radius-lg`, fields use `radius-md`, and tags use a near-square `radius-sm` so they look like a rubber stamp. Circle tiles are true circles with a `corn` ring.

**Illustration.** The system has its own linocut-style spot illustrations in **Assets → Illustrations**: tomato, sweet corn, carrots, apple, bread, sunflower and the lakefront panorama. They use a 5px ink outline, flat brand colours and one carved highlight. Put them on a tint with the white sunburst behind (`VendorCard`, `CircleTile`). New illustrations follow the same rules: ink outline, at most three fills plus ink, no gradients, no faces.

**Photography.** When real Market photography is available, use it for vendor cards and the hero. Shoot overhead flat-lays of produce on kraft or weathered wood, close crops of hands and stalls, and the crowd from slightly above, all in warm natural morning light, unfiltered. Crop to 4:3 in cards with `radius-lg` corners and a 3px ink outline. Never put text over a busy photo; put it in a `deep` band. Illustrations stand in until photos exist.

**Ornament & pattern.** The sprig ornament (`Ornament`, `Patterns/sprig-ornament.svg`) sits under every section title. Use the awning stripe for edges, tote bags and stall skirts, and the lake waves as a `deep` background texture on print. Stars (five-point, `corn`) punctuate badges and tickets, and bunting belongs only at the top of the hero.

**Focus & states.** Focus is a 3px solid `focus` outline with a 2px offset on every interactive element. Hover moves an element up-left by 2–3px and adds a print shadow, pressed sets it back down, and disabled drops to 45% opacity. Motion stays at 140–160 ms ease-out, and nothing moves under `prefers-reduced-motion`.

## Iconography

The system has 19 line icons on a 24px grid, drawn with a 2px stroke and round caps (**Assets → Icons**), rendered by `Icon` in `currentColor`. They label facts (clock → time, map pin → place, card → payments) and always sit next to a word. The icons are deliberately lighter than the illustrations: illustrations are for delight, icons are for information. Don't mix them in one element. For a missing glyph, use Lucide (it has the same stroke logic) and flag it for the set.

## The markets (sub-brands)

| Market | Ticket mark | Identity colour | Notes |
|---|---|---|---|
| Summer Market | the Bay Badge itself | `bay` | The flagship and the default. |
| Night Market | `night-market.svg` | `deep` + `corn` | Evening events. Their pages use the Night Market (dark) theme. |
| Pop-Up Markets | `pop-up-market.svg` | `corn` with `on-corn` | One-off markets. Put the date and place up front. |
| Winter Market | `winter-market.svg` | `beet` | Indoor markets. Name the venue in the first line. |

The identity colour fills the event's ticket stub, poster ground and social tiles. Everything else stays in the core palette.
