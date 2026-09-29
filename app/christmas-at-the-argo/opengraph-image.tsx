import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { argo } from "@/content/argo";
import { formatDate, formatTimeRange } from "@/content/format";

// The social preview card for Christmas at The Argo: the event logo in the shop window.

export const alt = "Christmas at The Argo, presented by Whitefish Bay Farmers Market Corp. Sunday, December 13, free admission.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const RED = "#8e1b1f";
const RED_DEEP = "#5f1014";
const GOLD = "#e9b949";
const CREAM = "#fbf1dc";

// The logo PNG is 900 × 779 (a cropped copy of the event logo, transparent background).
const LOGO_W = 900;
const LOGO_H = 779;

/** A Google Font subset to the characters on the card. Satori needs TTF, which Google serves without a browser user agent. */
async function loadFont(family: string, text: string) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image() {
  const facts = `${formatDate(argo.date)} · ${formatTimeRange(argo.start, argo.end)} · Free admission`;
  const [logo, sans] = await Promise.all([
    readFile(join(process.cwd(), "components/argo/assets/christmas-at-the-argo-logo.png")),
    loadFont("Public+Sans:wght@800", facts.toUpperCase()),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const logoH = 440;
  const stripe = `repeating-linear-gradient(-45deg, ${RED} 0px, ${RED} 14px, ${CREAM} 14px, ${CREAM} 28px)`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: stripe, padding: 22, fontFamily: sans ? "Public Sans" : "sans-serif" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: RED_DEEP, border: `6px solid ${GOLD}`, borderRadius: 24, color: CREAM }}>
          <img src={logoSrc} alt="" width={Math.round((LOGO_W / LOGO_H) * logoH)} height={logoH} />
          <div style={{ marginTop: 18, padding: "12px 28px", border: `3px solid ${GOLD}`, borderRadius: 999, fontSize: 28, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>{facts}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: sans ? [{ name: "Public Sans", data: sans, style: "normal", weight: 800 }] : undefined,
    },
  );
}
