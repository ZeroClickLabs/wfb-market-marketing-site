# Web, social & email

## Website

- **Page anatomy:** `AnnouncementBar` → `SiteHeader` (utility row + nav + the badge breaking the header rule) → `Hero` → `SectionEdge` awning → content sections alternating `kraft` / `deep` / `canvas`, each changing ground through a `SectionEdge` → `NewsletterBand` → `SiteFooter`. `HomePage` shows the whole thing.
- The first screen must answer three questions: is the market on this week, when is it, and where is it. Put anything unusual (weather, a moved location, a cancelled date) in a `Notice` directly under the header, not in the hero.
- **Vendor directory:** a `VendorCard` grid with 1 column on phones, 2 at ≥ 640px and 4 at ≥ 1200px, with `space-5` gutters. Filter by `Tag` category.
- **Events:** `EventCard` tickets in date order, two columns on desktop. Past dates drop off.
- **Hours:** `MarketSchedule`, never a picture of a table.
- Keep the navigation to five items or fewer, with one primary CTA ("Get directions" in season, "Join the list" off-season).

## Social

- Square (1080 × 1080) and story (1080 × 1920) templates: an illustration or photo on a tint with the sunburst, a headline in League Gothic, one script line, and the icon mark in a corner at 96px.
- Captions follow the voice rules, with the fact first: "Saturday · 8 am–1 pm. Strawberries are here and they won't last."
- Add alt text to every image that describes the food and the people.
- The profile image is `icon.svg` on a `canvas` ground.

## Email

- 600px single column on `canvas`, with a `paper` content card with a 3px ink outline. The header uses the lockup on `canvas` with the awning edge below it.
- Headlines are set in League Gothic, which falls back to Arial Narrow in clients that can't load web fonts. Body copy is Public Sans at 16px.
- Subject line: the date plus one headline, e.g. "Sat June 6: Opening day, 42 vendors".
- Use one `heirloom` button per email. The footer carries the legal name "Whitefish Bay Farmers Market Corp", the mailing address and an unsubscribe link.
