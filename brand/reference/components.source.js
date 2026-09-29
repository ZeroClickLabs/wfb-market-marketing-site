/* @ds-bundle: {"format":4,"namespace":"WFBMarket","components":[{"name":"Logo"},{"name":"Illustration"},{"name":"Button"},{"name":"Icon"},{"name":"Tag"},{"name":"Badge"},{"name":"Notice"},{"name":"TextField"},{"name":"Select"},{"name":"Checkbox"},{"name":"Ornament"},{"name":"SectionHeading"},{"name":"SectionEdge"},{"name":"Bunting"},{"name":"AnnouncementBar"},{"name":"SiteHeader"},{"name":"Hero"},{"name":"VendorCard"},{"name":"EventCard"},{"name":"CircleTile"},{"name":"MarketSchedule"},{"name":"NewsletterBand"},{"name":"SiteFooter"},{"name":"HomePage"}]} */
(function () {
  var React = window.React, h = React.createElement;
  var ICONS = __ICONS__;
  var ART = __ART__;
  var uidN = 0;
  function cx() { var a = []; for (var i = 0; i < arguments.length; i++) if (arguments[i]) a.push(arguments[i]); return a.join(" "); }
  function omit(o, keys) { var r = {}; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k) && keys.indexOf(k) < 0) r[k] = o[k]; return r; }
  function useUid(prefix) { var r = React.useRef(null); if (!r.current) r.current = (prefix || "wfb") + (++uidN); return r.current; }
  function svgHTML(key, uid) { var s = ART[key] || ""; return { __html: s.split("__U__").join(uid) }; }

  /* ---------------------------------------------------------------- Icon */
  function Icon(p) {
    var parts = ICONS[p.name] || [];
    return h("svg", { className: cx("wfb-icon", p.className), viewBox: "0 0 24 24", width: p.size || 20, height: p.size || 20, fill: "none", stroke: "currentColor",
      strokeWidth: p.strokeWidth || 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": p.label ? undefined : "true", role: p.label ? "img" : undefined, "aria-label": p.label },
      parts.map(function (pt, i) { return h(pt[0], Object.assign({ key: i }, pt[1])); }));
  }
  Icon.names = Object.keys(ICONS);

  /* ---------------------------------------------------------------- Logo & Illustration */
  var LOGO_LABEL = "Whitefish Bay Farmers Market";
  function Logo(p) {
    var v = p.variant || "emblem", uid = useUid("lg");
    var key = { emblem: "emblem", badge: "badge", icon: "icon", lockup: "lockup", "lockup-reverse": "lockupReverse", night: "night", winter: "winter", popup: "popup" }[v] || "emblem";
    var w = p.width || ({ emblem: 240, badge: 200, icon: 64, lockup: 360, "lockup-reverse": 360 }[v] || 260);
    return h(p.href ? "a" : "span", { className: cx("wfb-logo", p.className), href: p.href, role: "img", "aria-label": p.label || LOGO_LABEL, style: { width: w }, dangerouslySetInnerHTML: svgHTML(key, uid) });
  }
  function Illustration(p) {
    var uid = useUid("il");
    return h("span", { className: cx("wfb-illo", p.className), style: p.size ? { width: p.size } : undefined, role: p.label ? "img" : undefined, "aria-label": p.label, "aria-hidden": p.label ? undefined : "true", dangerouslySetInnerHTML: svgHTML("illo-" + p.name, uid) });
  }
  Illustration.names = Object.keys(ART).filter(function (k) { return k.indexOf("illo-") === 0; }).map(function (k) { return k.slice(5); });

  /* ---------------------------------------------------------------- Button */
  function Button(p) {
    var variant = p.variant || "accent", size = p.size || "md";
    var rest = omit(p, ["variant", "size", "icon", "iconAfter", "children", "className", "href"]);
    var kids = [p.icon ? h(Icon, { key: "i", name: p.icon, size: 18 }) : null, h("span", { key: "t" }, p.children), p.iconAfter ? h(Icon, { key: "a", name: p.iconAfter, size: 18 }) : null];
    var cls = cx("wfb-btn", "wfb-btn-" + variant, size !== "md" && "wfb-btn-" + size, p.className);
    if (p.href) return h("a", Object.assign({ className: cls, href: p.href }, rest), kids);
    return h("button", Object.assign({ type: "button", className: cls }, rest), kids);
  }

  /* ---------------------------------------------------------------- Tag, Badge, Notice */
  var CAT = { produce: "Produce", meat: "Meat & eggs", dairy: "Dairy & cheese", bakery: "Bakery", prepared: "Prepared food", flowers: "Flowers", crafts: "Crafts", other: "Other" };
  function Tag(p) { return h("span", { className: cx("wfb-tag", "wfb-tag-" + (p.category || "other"), p.className) }, p.children || CAT[p.category] || p.category); }
  function Badge(p) {
    return h("span", { className: cx("wfb-badge", "wfb-badge-" + (p.tone || "neutral"), p.className) }, p.icon ? h(Icon, { name: p.icon, size: 16 }) : null, p.children);
  }
  var TONE_ICON = { info: "info", success: "check-circle", warning: "alert", danger: "x-circle" };
  function Notice(p) {
    var tone = p.tone || "info";
    return h("div", { className: cx("wfb-notice", "wfb-notice-" + tone, p.className), role: tone === "danger" || tone === "warning" ? "alert" : "status" },
      h("span", { className: "wfb-notice-ic" }, h(Icon, { name: p.icon || TONE_ICON[tone], size: 20 })),
      h("div", null,
        p.title ? h("p", { className: "wfb-notice-title" }, p.title) : null,
        p.children ? h("p", { className: "wfb-notice-body" }, p.children) : null,
        p.action ? h("div", { className: "wfb-notice-action" }, p.action) : null));
  }

  /* ---------------------------------------------------------------- Fields */
  function fieldShell(p, id, control) {
    var hintId = p.hint ? id + "-hint" : undefined, errId = p.error ? id + "-err" : undefined;
    return h("div", { className: cx("wfb-field", p.error && "wfb-field-invalid", p.className) },
      h("label", { className: "wfb-field-label", htmlFor: id }, p.label, p.required ? h("span", { className: "wfb-field-req", "aria-hidden": "true" }, "*") : null),
      p.hint ? h("p", { className: "wfb-field-hint", id: hintId }, p.hint) : null,
      control([hintId, errId].filter(Boolean).join(" ") || undefined),
      p.error ? h("p", { className: "wfb-field-error", id: errId }, h(Icon, { name: "alert", size: 16 }), p.error) : null);
  }
  function TextField(p) {
    var auto = useUid("tf"), id = p.id || auto;
    var rest = omit(p, ["label", "hint", "error", "multiline", "className", "id"]);
    return fieldShell(p, id, function (desc) {
      return h(p.multiline ? "textarea" : "input", Object.assign({ id: id, className: "wfb-field-input", "aria-describedby": desc, "aria-invalid": p.error ? "true" : undefined }, rest));
    });
  }
  function Select(p) {
    var auto = useUid("sl"), id = p.id || auto;
    var rest = omit(p, ["label", "hint", "error", "options", "className", "id", "placeholder"]);
    return fieldShell(p, id, function (desc) {
      var opts = (p.options || []).map(function (o) { o = typeof o === "string" ? { value: o, label: o } : o; return h("option", { key: o.value, value: o.value }, o.label); });
      if (p.placeholder) opts.unshift(h("option", { key: "__p", value: "" }, p.placeholder));
      return h("select", Object.assign({ id: id, className: "wfb-field-input", "aria-describedby": desc, "aria-invalid": p.error ? "true" : undefined }, rest), opts);
    });
  }
  function Checkbox(p) {
    var rest = omit(p, ["label", "hint", "className"]);
    return h("label", { className: cx("wfb-check", p.className) }, h("input", Object.assign({ type: "checkbox" }, rest)),
      h("span", null, p.label, p.hint ? h("span", { className: "wfb-check-hint" }, p.hint) : null));
  }

  /* ---------------------------------------------------------------- Ornament, headings, edges */
  function Ornament(p) { return h("div", { className: cx("wfb-ornament", p.className), style: p.color ? { color: p.color } : undefined, "aria-hidden": "true", dangerouslySetInnerHTML: { __html: ART.sprig } }); }
  function SectionHeading(p) {
    return h("header", { className: cx("wfb-heading", p.align === "left" && "wfb-heading-left", p.className) },
      p.eyebrow ? h("p", { className: "wfb-heading-eyebrow" }, p.eyebrow) : null,
      h(p.as || "h2", { className: "wfb-heading-title" }, p.title),
      p.ornament === false ? null : h(Ornament, null),
      p.lead ? h("p", { className: "wfb-lead" }, p.lead) : null);
  }
  var TONES = { heirloom: "var(--heirloom)", bay: "var(--bay)", corn: "var(--corn)", kale: "var(--kale)", beet: "var(--beet)", deep: "var(--deep)", sage: "var(--sage)", kraft: "var(--kraft)", canvas: "var(--canvas)", paper: "var(--paper)", "kale-tint": "var(--kale-tint)", "bay-tint": "var(--bay-tint)", "heirloom-tint": "var(--heirloom-tint)", "corn-tint": "var(--corn-tint)", "beet-tint": "var(--beet-tint)" };
  function SectionEdge(p) {
    var kind = p.kind || "awning";
    if (kind === "wave") return h("div", { className: cx("wfb-edge-wrap", p.className), style: { background: p.ground ? TONES[p.ground] : undefined, lineHeight: 0 }, "aria-hidden": "true" },
      h("div", { className: "wfb-edge wfb-edge-wave", style: { "--c": TONES[p.tone || "deep"], transform: p.flip ? "scaleY(-1)" : undefined } }));
    return h("div", { className: cx("wfb-edge", "wfb-edge-awning", p.className), style: { "--a": TONES[p.tone || "heirloom"], "--b": TONES[p.alt || "paper"], backgroundColor: p.ground ? TONES[p.ground] : undefined }, "aria-hidden": "true" });
  }
  function Bunting(p) {
    var cols = ["var(--heirloom)", "var(--corn)", "var(--bay)", "var(--sage)"], kids = [], k = 0;
    [[0, 720], [720, 1440]].forEach(function (seg) {
      var x0 = seg[0], x1 = seg[1], cxm = (x0 + x1) / 2;
      kids.push(h("path", { key: "s" + x0, d: "M" + x0 + " 4 Q" + cxm + " 44 " + x1 + " 4", fill: "none", stroke: "var(--ink)", strokeWidth: 2.5 }));
      for (var i = 1; i < 12; i++) {
        var t = i / 12, x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cxm + t * t * x1, y = (1 - t) * (1 - t) * 4 + 2 * (1 - t) * t * 44 + t * t * 4;
        kids.push(h("path", { key: "f" + x0 + i, d: "M" + (x - 13).toFixed(1) + " " + (y - 1).toFixed(1) + " h26 l-13 30 Z", fill: cols[k++ % 4], stroke: "var(--ink)", strokeWidth: 2.5, strokeLinejoin: "round" }));
      }
    });
    return h("div", { className: cx("wfb-bunting", p.className), "aria-hidden": "true" },
      h("svg", { viewBox: "0 0 1440 64", preserveAspectRatio: "xMidYMin slice", width: "100%", height: 64 }, kids));
  }

  /* ---------------------------------------------------------------- Chrome */
  function AnnouncementBar(p) {
    return h("div", { className: cx("wfb-announce", p.className), role: "region", "aria-label": "Announcement" },
      p.label ? h("b", null, p.label) : null, p.children, p.href ? h(React.Fragment, null, " ", h("a", { href: p.href }, p.linkText || "Learn more")) : null);
  }
  function SiteHeader(p) {
    var links = p.links || [{ label: "Visit", current: true }, { label: "Vendors" }, { label: "Events" }, { label: "Food access" }, { label: "Get involved" }];
    var cta = p.cta === undefined ? { label: "Get directions", icon: "map-pin" } : p.cta;
    return h("div", { className: cx("wfb", p.className) },
      h("div", { className: "wfb-utility" }, h("div", { className: "wfb-container" },
        h("span", { className: "wfb-utility-open" }, h("span", { className: "wfb-utility-dot", "aria-hidden": "true" }), p.status || "Open Saturdays 8 am–1 pm · Rain or shine"),
        h("span", { className: "wfb-utility-links" },
          h("a", { href: "#" }, h(Icon, { name: "card", size: 16 }), "SNAP/EBT welcome"),
          h("a", { href: "#" }, h(Icon, { name: "calendar", size: 16 }), "Market calendar"),
          h("a", { href: "#", "aria-label": "Instagram" }, h(Icon, { name: "instagram", size: 18 })),
          h("a", { href: "#", "aria-label": "Facebook" }, h(Icon, { name: "facebook", size: 18 }))))),
      h("header", { className: "wfb-header" }, h("div", { className: "wfb-container" },
        h("a", { className: "wfb-header-logo", href: p.homeHref || "#", "aria-label": "Whitefish Bay Farmers Market, home" }, h(Logo, { variant: "badge", width: 128, label: "" })),
        h("nav", { className: "wfb-nav", "aria-label": "Main" }, links.map(function (l) { return h("a", { key: l.label, href: l.href || "#", "aria-current": l.current ? "page" : undefined }, l.label); })),
        cta ? h(Button, { href: cta.href || "#", variant: "primary", icon: cta.icon }, cta.label) : null)));
  }
  function Hero(p) {
    var uid = useUid("hero");
    return h("section", { className: cx("wfb", "wfb-hero", "wfb-grain", p.className), "aria-label": p.ariaLabel || "Welcome" },
      h(Bunting, null),
      h("div", { className: "wfb-hero-copy" },
        p.script !== false ? h("p", { className: "wfb-hero-script" }, p.script || "Saturdays by the lake") : null,
        h("h1", { className: "wfb-hero-title" }, p.title || "Fresh from the Bay"),
        h(Ornament, null),
        h("p", { className: "wfb-hero-sub" }, p.sub || "Forty-plus local growers, bakers and makers, live music and a lake breeze. Every Saturday, June through September."),
        h("div", { className: "wfb-row", style: { justifyContent: "center" } }, p.actions || [
          h(Button, { key: "a", variant: "accent", size: "lg", iconAfter: "arrow-right", href: "#" }, "Plan your visit"),
          h(Button, { key: "b", variant: "outline", size: "lg", href: "#" }, "Meet the vendors")])),
      h("div", { className: "wfb-hero-art", "aria-hidden": "true", dangerouslySetInnerHTML: svgHTML("panorama", uid) }));
  }

  /* ---------------------------------------------------------------- Cards & tiles */
  function VendorCard(p) {
    var cats = p.categories || (p.category ? [p.category] : ["other"]);
    var name = p.href ? h("a", { className: "wfb-card-link", href: p.href }, p.name) : p.name;
    return h("article", { className: cx("wfb", "wfb-card", "wfb-vendor", p.className) },
      h("div", { className: cx("wfb-vendor-art", "wfb-vendor-art-" + cats[0]) },
        p.stall ? h("span", { className: "wfb-vendor-stall" }, "Stall " + p.stall) : null,
        p.image ? h("img", { className: "wfb-photo", src: p.image, alt: p.imageAlt || "" }) : h(Illustration, { name: p.illustration || "tomato" })),
      h("div", { className: "wfb-vendor-body" },
        h("div", { className: "wfb-row", style: { gap: "6px" } }, cats.map(function (c) { return h(Tag, { key: c, category: c }); })),
        h("h3", { className: "wfb-vendor-name" }, name),
        p.description ? h("p", { className: "wfb-vendor-desc" }, p.description) : null,
        h("div", { className: "wfb-vendor-foot" },
          h("div", { className: "wfb-meta" }, p.from ? h("span", null, h(Icon, { name: "map-pin", size: 16 }), p.from) : null),
          p.acceptsSnap ? h(Badge, { tone: "success", icon: "card" }, "SNAP/EBT") : null)));
  }
  var MARKET = { summer: "Summer Market", night: "Night Market", popup: "Pop-Up Market", winter: "Winter Market" };
  var MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function EventCard(p) {
    var m = p.market || "summer", d = new Date(p.date + "T12:00:00");
    var title = p.href ? h("a", { className: "wfb-card-link", href: p.href }, p.title) : p.title;
    return h("article", { className: cx("wfb", "wfb-card", "wfb-ticket", p.className) },
      h("time", { className: cx("wfb-ticket-stub", "wfb-ticket-" + m), dateTime: p.date },
        h("span", { className: "wfb-ticket-mo" }, MO[d.getMonth()]), h("span", { className: "wfb-ticket-day" }, d.getDate()), h("span", { className: "wfb-ticket-wd" }, WD[d.getDay()])),
      h("div", { className: "wfb-ticket-body" },
        h("span", { className: "wfb-ticket-eyebrow" }, p.eyebrow || MARKET[m]),
        h("h3", { className: "wfb-ticket-title" }, title),
        h("div", { className: "wfb-meta" },
          p.time ? h("span", null, h(Icon, { name: "clock", size: 16 }), p.time) : null,
          p.location ? h("span", null, h(Icon, { name: "map-pin", size: 16 }), p.location) : null),
        p.status ? h("div", null, p.status) : null));
  }
  function CircleTile(p) {
    return h(p.href ? "a" : "div", { className: cx("wfb", "wfb-circle", p.className), href: p.href },
      h("span", { className: "wfb-circle-disc", style: { background: TONES[p.tone] || undefined } }, h(Illustration, { name: p.illustration || "sunflower" })),
      h("span", { className: "wfb-circle-label" }, p.label),
      p.note ? h("span", { className: "wfb-circle-note" }, p.note) : null);
  }
  var SWATCH = { summer: "var(--bay)", night: "var(--deep)", popup: "var(--corn)", winter: "var(--beet)" };
  function MarketSchedule(p) {
    return h("table", { className: cx("wfb", "wfb-sched", p.className) },
      p.caption ? h("caption", { className: "wfb-sr" }, p.caption) : null,
      h("thead", null, h("tr", null, h("th", { scope: "col" }, "Market"), h("th", { scope: "col" }, "When"), h("th", { scope: "col" }, "Hours"), h("th", { scope: "col" }, "Where"))),
      h("tbody", null, (p.rows || []).map(function (r, i) {
        return h("tr", { key: i },
          h("td", null, h("span", { className: "wfb-sched-market" }, h("span", { className: "wfb-sched-swatch", style: { background: SWATCH[r.market_id] || SWATCH.summer } }), r.market)),
          h("td", null, r.when), h("td", null, h("b", null, r.hours)), h("td", null, r.where, r.note ? h("span", { className: "wfb-sched-note" }, r.note) : null));
      })));
  }
  function NewsletterBand(p) {
    return h("section", { className: cx("wfb", "wfb-news", "wfb-grain", p.className), "aria-label": "Newsletter" }, h("div", { className: "wfb-container" },
      h("div", { className: "wfb-news-art" }, h(Illustration, { name: p.illustration || "sunflower" })),
      h("div", null, h("h2", { className: "wfb-news-title" }, p.title || "The Market Letter"), h("p", null, p.text || "What's in season, who's at the market and what's coming up — the first Friday of every month.")),
      h("form", { onSubmit: function (e) { e.preventDefault(); } },
        h("label", { className: "wfb-sr", htmlFor: "wfb-news-email" }, "Email address"),
        h("input", { id: "wfb-news-email", className: "wfb-field-input", type: "email", placeholder: "you@example.com" }),
        h(Button, { variant: "primary", type: "submit" }, "Sign me up"))));
  }
  function SiteFooter(p) {
    return h("footer", { className: cx("wfb", "wfb-footer", p.className) },
      h(SectionEdge, { kind: "wave", tone: "deep", ground: p.above || "sage" }),
      h("div", { className: "wfb-container" },
        h("div", { className: "wfb-footer-top" },
          h("div", { className: "wfb-footer-logo" }, h(Logo, { variant: "emblem", width: 180 })),
          h("div", null, h("h4", null, "Visit"), h("p", null, "Saturdays, June–September", h("br"), "8 am–1 pm · rain or shine", h("br"), "Whitefish Bay, Wisconsin"), h("p", { className: "wfb-footer-script" }, "See you by the lake")),
          h("div", null, h("h4", null, "Explore"), h("ul", null, ["Vendors", "Events & markets", "Food access & SNAP", "Volunteer", "Sponsor the Market"].map(function (t) { return h("li", { key: t }, h("a", { href: "#" }, t)); }))),
          h("div", null, h("h4", null, "Say hello"), h("ul", null, h("li", null, h("a", { href: "#" }, "hello@example.org")), h("li", null, h("a", { href: "#" }, "Apply to sell"))),
            h("div", { className: "wfb-social" }, h("a", { href: "#", "aria-label": "Instagram" }, h(Icon, { name: "instagram", size: 18 })), h("a", { href: "#", "aria-label": "Facebook" }, h(Icon, { name: "facebook", size: 18 })), h("a", { href: "#", "aria-label": "Email" }, h(Icon, { name: "mail", size: 18 }))))),
        h("div", { className: "wfb-footer-legal" }, h("span", null, "© " + (p.year || 2026) + " Whitefish Bay Farmers Market Corp · a non-profit organization"), h("span", null, "Privacy · Accessibility"))));
  }

  /* ---------------------------------------------------------------- HomePage (showcase) */
  function HomePage(p) {
    return h("div", { className: "wfb" },
      h(AnnouncementBar, { label: "This Saturday", href: "#", linkText: "See who's coming" }, "Sweet corn is in — and the Night Market is back July 25."),
      h(SiteHeader, null),
      h(Hero, null),
      h(SectionEdge, { kind: "awning", tone: "heirloom", ground: "kraft" }),
      h("section", { className: "wfb-section wfb-section-kraft wfb-grain", style: { paddingTop: "40px" } }, h("div", { className: "wfb-container" },
        h(SectionHeading, { eyebrow: "This week", title: "At the market", lead: "A few of the growers, bakers and makers setting up by the lake this Saturday." }),
        h("div", { className: "wfb-grid" },
          h(VendorCard, { name: "Lakeview Acres", category: "produce", illustration: "tomato", description: "Heirloom tomatoes, sweet peppers and whatever the August heat brings in.", stall: 14, from: "Cedarburg, WI", acceptsSnap: true, href: "#" }),
          h(VendorCard, { name: "North Shore Bread Co.", category: "bakery", illustration: "bread", description: "Naturally leavened sourdough, rye and cardamom buns baked the night before.", stall: 3, from: "Shorewood, WI", href: "#" }),
          h(VendorCard, { name: "Two Creeks Orchard", category: "produce", illustration: "apple", description: "Early Zestar and Honeycrisp apples, cider and apple butter.", stall: 22, from: "Two Rivers, WI", acceptsSnap: true, href: "#" }),
          h(VendorCard, { name: "Bluff Top Flowers", category: "flowers", illustration: "sunflower", description: "Market bunches cut Friday night: zinnias, dahlias and sunflowers.", stall: 9, from: "Mequon, WI", href: "#" })),
        h("div", { className: "wfb-row", style: { justifyContent: "center", marginTop: "40px" } }, h(Button, { variant: "outline", iconAfter: "arrow-right", href: "#" }, "All 42 vendors")))),
      h(SectionEdge, { kind: "wave", tone: "deep", ground: "kraft" }),
      h("section", { className: "wfb-section wfb-section-deep wfb-on-deep", style: { paddingTop: "48px" } }, h("div", { className: "wfb-container" },
        h(SectionHeading, { eyebrow: "Explore", title: "More than a market" }),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "40px 24px", justifyItems: "center" } },
          h(CircleTile, { label: "Food access", illustration: "carrots", tone: "kale-tint", note: "We match SNAP/EBT dollars up to $20 every week.", href: "#" }),
          h(CircleTile, { label: "Night Market", illustration: "sweet-corn", tone: "corn", note: "Music, food trucks and the lake at dusk.", href: "#" }),
          h(CircleTile, { label: "Volunteer", illustration: "sunflower", tone: "bay-tint", note: "Two hours on a Saturday keeps the market running.", href: "#" }),
          h(CircleTile, { label: "Sell with us", illustration: "bread", tone: "heirloom-tint", note: "Applications for 2027 open in January.", href: "#" })))),
      h(SectionEdge, { kind: "wave", tone: "deep", ground: "canvas", flip: true }),
      h("section", { className: "wfb-section wfb-grain", style: { paddingTop: "48px" } }, h("div", { className: "wfb-container" },
        h(SectionHeading, { eyebrow: "Mark your calendar", title: "Markets & events" }),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px" } },
          h(EventCard, { date: "2026-06-06", market: "summer", title: "Opening day", time: "8 am–1 pm", location: "By the lake", status: h(Badge, { tone: "success", icon: "sun" }, "Rain or shine"), href: "#" }),
          h(EventCard, { date: "2026-07-25", market: "night", title: "Night Market & music", time: "5–9 pm", location: "Downtown", href: "#" }),
          h(EventCard, { date: "2026-10-17", market: "popup", title: "Harvest Pop-Up", time: "10 am–2 pm", location: "The village green", href: "#" }),
          h(EventCard, { date: "2026-12-12", market: "winter", title: "Holiday Market", time: "9 am–1 pm", location: "Indoors", href: "#" })))),
      h(NewsletterBand, null),
      h(SiteFooter, null));
  }

  window.WFBMarket = Object.assign(window.WFBMarket || {}, {
    Logo: Logo, Illustration: Illustration, Button: Button, Icon: Icon, Tag: Tag, Badge: Badge, Notice: Notice, TextField: TextField, Select: Select, Checkbox: Checkbox,
    Ornament: Ornament, SectionHeading: SectionHeading, SectionEdge: SectionEdge, Bunting: Bunting, AnnouncementBar: AnnouncementBar, SiteHeader: SiteHeader, Hero: Hero,
    VendorCard: VendorCard, EventCard: EventCard, CircleTile: CircleTile, MarketSchedule: MarketSchedule, NewsletterBand: NewsletterBand, SiteFooter: SiteFooter, HomePage: HomePage });
})();
