import Link from "next/link";
import type { QA } from "./types";
import { site } from "./site";

// PLACEHOLDER: the Market hasn't opened yet; these answers describe plans. Confirm each with the Market.

export const visitFaqs: QA[] = [
  { q: "When does the market open?", a: <p>The Summer Market opens in June 2027, on Saturday mornings by the lake. We&rsquo;ll announce the exact date and hours in the spring.</p> },
  { q: "What's happening before then?", a: <p><Link href="/christmas-at-the-argo">Christmas at The Argo</Link>: a free indoor holiday market on Sunday, December 13, 2026.</p> },
  { q: "Where will the Summer Market be?", a: <p>By the lake in Whitefish Bay. We&rsquo;ll confirm the exact location, parking and accessibility details before we open.</p> },
  { q: "Will you accept SNAP/EBT?", a: <p>Yes, that&rsquo;s the plan, along with Market Match to stretch those dollars further. See <Link href="/food-access">food access</Link>.</p> },
  { q: "How can I sell at the market?", a: <p>Applications for the 2027 Summer Market open in January. <Link href="/get-involved/sell">Here&rsquo;s how to apply</Link>.</p> },
  { q: "How do I hear news first?", a: <p>Join the Market Letter at the bottom of any page, or email us at {site.email}.</p> },
];

export const foodAccessFaqs: QA[] = [
  { q: "Will I need to sign up or show anything?", a: <p>No. The plan is simple: bring your EBT card to the info tent, say how much you&rsquo;d like, and we&rsquo;ll swipe it like any other card. You&rsquo;ll never have to explain why you&rsquo;re using EBT.</p> },
  { q: "What will I be able to buy?", a: <p>Anything SNAP covers: fruit and vegetables, meat, eggs, dairy, bread, honey, and seeds and plants that grow food. Market Match is planned for fruit and vegetables.</p> },
  { q: "When does it start?", a: <p>When the Summer Market opens in June 2027. We&rsquo;ll confirm the details, including how much we can match, before then.</p> },
];
