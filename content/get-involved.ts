import type { FieldSpec, SponsorTier } from "@/components/site";

// PLACEHOLDER: jobs, rules, fees and tiers are working plans. Confirm with the board.

export const argoJobs = [
  { icon: "tent" as const, title: "Setup & teardown", time: "Sunday, Dec 13 · morning or evening", text: "Help turn The Argo into a holiday market, then help pack it away." },
  { icon: "info" as const, title: "Greeters", time: "Sunday, Dec 13 · 1–6 pm shifts", text: "Welcome people at the door, hand out maps and point the way to Santa." },
  { icon: "leaf" as const, title: "Cookie table", time: "Sunday, Dec 13 · afternoon", text: "Help children decorate Christmas cookies. Aprons provided." },
  { icon: "clock" as const, title: "Santa's line", time: "Sunday, Dec 13 · about 2–4 pm", text: "Keep the line moving and help families with photos." },
];

export const volunteerJobs = [
  { icon: "tent" as const, title: "Setup crew", time: "Saturday mornings from June 2027", text: "Put up the info tent, the signs and the awnings before the vendors arrive." },
  { icon: "info" as const, title: "Info tent", time: "Saturday market hours", text: "Answer questions, hand out maps and point people to the sweet corn." },
  { icon: "card" as const, title: "Market Match table", time: "Saturday market hours", text: "Swipe EBT cards and hand out tokens. We'll train you first." },
  { icon: "leaf" as const, title: "Kids' corner", time: "Saturday mornings", text: "Run the seed-planting table and the colouring station." },
];

export const volunteerFields: FieldSpec[] = [
  { kind: "text", name: "name", label: "Your name", required: true, autoComplete: "name" },
  { kind: "email", name: "email", label: "Email", required: true, autoComplete: "email", requiredMessage: "Enter your email address." },
  { kind: "tel", name: "phone", label: "Phone (optional)", hint: "Only for day-of changes, like weather.", autoComplete: "tel" },
  { kind: "checkboxes", name: "jobs", label: "What would you like to do?", hint: "Pick as many as you like.", required: true, requiredMessage: "Choose at least one job.", options: [...argoJobs.map((j) => `${j.title} (Christmas at The Argo)`), ...volunteerJobs.map((j) => `${j.title} (Summer Market)`)] },
  { kind: "textarea", name: "notes", label: "Anything else we should know? (optional)", hint: "Accessibility needs, dates you're away, or a friend you'd like to be paired with." },
];

export const sellRules = [
  { icon: "leaf" as const, title: "Grow it, raise it or make it", text: "We're a producer-only market. Everything on your table comes from your farm or your kitchen." },
  { icon: "map-pin" as const, title: "Within 100 miles", text: "Farms and studios within 100 miles of Whitefish Bay, with a few exceptions for things that don't grow here." },
  { icon: "card" as const, title: "Take tokens", text: "Every vendor accepts market tokens, which is how SNAP/EBT and Market Match reach your stall." },
  { icon: "tent" as const, title: "Bring your own stall", text: "A 10 × 10 tent with weights, a table and a sign. We supply the stall card so the aisles match." },
];

export const sellFees = {
  columns: ["Market", "Stall fee", "Season option", "Notes"],
  rows: [
    ["Summer Market", "$35 per Saturday", "$450 for the season", "Corner stalls $10 more"],
    ["Night Market", "$40 per night", "—", "Includes power for food trucks"],
    ["Pop-Up Markets", "$25 per market", "—", "Priority for season vendors"],
    ["Winter Market", "$25 per market", "$110 for the season", "Tables supplied indoors"],
  ],
};

export const applySteps = [
  { title: "Apply in January", text: "Fill in the form below once applications open, with photos of your stall and products." },
  { title: "Meet the committee", text: "A volunteer visits your farm or kitchen to say hello and see your work." },
  { title: "Set up in June", text: "We'll confirm stalls in the spring. On opening day, we'll walk you to your spot." },
];

export const sellFields: FieldSpec[] = [
  { kind: "text", name: "business", label: "Business name", required: true, autoComplete: "organization" },
  { kind: "text", name: "name", label: "Your name", required: true, autoComplete: "name" },
  { kind: "email", name: "email", label: "Email", required: true, autoComplete: "email", requiredMessage: "Enter your email address." },
  { kind: "text", name: "town", label: "Where is your farm or kitchen?", hint: "Town and state, like “Cedarburg, WI”.", required: true, requiredMessage: "Enter the town where you grow or make your products." },
  { kind: "select", name: "category", label: "What do you mainly sell?", required: true, options: ["Produce", "Meat & eggs", "Dairy & cheese", "Bakery", "Prepared food", "Flowers", "Crafts", "Other"] },
  { kind: "textarea", name: "products", label: "Tell us about your products", hint: "What you grow or make, and how.", required: true, requiredMessage: "Tell us a little about what you sell." },
  { kind: "checkboxes", name: "markets", label: "Which 2027 markets interest you?", hint: "The Summer Market is first; the others are still being planned.", required: true, requiredMessage: "Choose at least one market.", options: ["Summer Market", "Night Market", "Pop-Up Markets", "Winter Market"] },
  { kind: "agree", name: "insurance", label: "I have, or will get, product liability insurance before the season starts.", required: true, requiredMessage: "Tick this box to confirm you’ll have insurance." },
];

export const sponsorReasons = [
  { icon: "calendar" as const, title: "Christmas at The Argo", text: "Help bring Christmas at The Argo to life on Sunday, December 13: Santa, the cookie table and the lights." },
  { icon: "basket" as const, title: "Fresh food for everyone", text: "Sponsorship will fund Market Match, which stretches SNAP/EBT dollars for fruit and vegetables." },
  { icon: "music" as const, title: "Music by the lake", text: "Help us put live music at every Saturday market from summer 2027." },
];

export const sponsorTiers: SponsorTier[] = [
  // Add sponsors as they sign on; empty tiers are hidden.
  { name: "Awning sponsors", sponsors: [] },
  { name: "Stall sponsors", sponsors: [] },
  { name: "Neighbours", sponsors: [] },
];

export const sponsorLevels = {
  columns: ["Level", "Gift", "What it includes"],
  rows: [
    ["Awning", "$2,500", "Banner at every market, a Night Market stage mention, and your logo on the sponsor board"],
    ["Stall", "$1,000", "Your logo on the sponsor board and this site, and a thank-you in the Market Letter"],
    ["Neighbour", "$250", "Your name on the sponsor board and this site"],
  ],
};

export const sponsorFields: FieldSpec[] = [
  { kind: "text", name: "organisation", label: "Business or organisation", required: true, autoComplete: "organization" },
  { kind: "text", name: "name", label: "Your name", required: true, autoComplete: "name" },
  { kind: "email", name: "email", label: "Email", required: true, autoComplete: "email", requiredMessage: "Enter your email address." },
  { kind: "select", name: "level", label: "What would you like to sponsor?", options: ["Christmas at The Argo", "The 2027 season: Awning", "The 2027 season: Stall", "The 2027 season: Neighbour", "Not sure yet"] },
  { kind: "textarea", name: "message", label: "Anything you'd like to tell us? (optional)" },
];

export const contactFields: FieldSpec[] = [
  { kind: "text", name: "name", label: "Your name", required: true, autoComplete: "name" },
  { kind: "email", name: "email", label: "Email", required: true, autoComplete: "email", requiredMessage: "Enter your email address." },
  { kind: "select", name: "topic", label: "What's it about?", required: true, options: ["Christmas at The Argo", "Visiting the market", "Food access & SNAP/EBT", "Selling at the market", "Volunteering", "Sponsorship", "Press", "Something else"] },
  { kind: "textarea", name: "message", label: "Your message", required: true },
];
