// Checks every text pairing in the Christmas at The Argo palette against WCAG AA (4.5:1).
// Reads the --color-argo-* colours straight from app/globals.css. Run: node scripts/check-argo-contrast.mjs
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../app/globals.css"), "utf8");
const colours = Object.fromEntries([...css.matchAll(/--color-argo-([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));

// [text, ground] pairs the page actually uses.
const PAIRS = [
  ["gold", "red"], ["cream", "red"], ["gold", "red-deep"], ["cream", "red-deep"],
  ["gold", "green"], ["cream", "green"], ["gold", "green-deep"], ["cream", "green-deep"],
  ["red", "cream"], ["green", "cream"], ["ink", "cream"], ["ink-muted", "cream"], ["gold-text", "cream"],
  ["red-deep", "gold"], ["ink", "gold"],
  ["ink", "paper"], ["red", "paper"], ["ink-muted", "paper"], ["gold-text", "paper"], ["green", "paper"],
];

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

let failed = 0;
for (const [text, ground] of PAIRS) {
  if (!colours[text] || !colours[ground]) { console.log(`missing --color-argo-${!colours[text] ? text : ground}`); failed++; continue; }
  const r = ratio(colours[text], colours[ground]);
  const ok = r >= 4.5;
  if (!ok) failed++;
  console.log(`${ok ? "pass" : "FAIL"}  ${text.padEnd(10)} on ${ground.padEnd(10)} ${r.toFixed(2)}:1`);
}
process.exit(failed ? 1 : 0);
