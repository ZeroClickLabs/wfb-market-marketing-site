import type { CSSProperties, ReactNode } from "react";
import { ART } from "./art.generated";
import { cx, toneVar, type Tone } from "./utils";

export function Ornament({ color, className }: { color?: string; className?: string }) {
  return (
    <div
      className={cx("wfb-ornament", className)}
      style={color ? { color } : undefined}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ART.sprig }}
    />
  );
}

export interface SectionHeadingProps {
  title: ReactNode;
  eyebrow?: string;
  lead?: ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2" | "h3";
  ornament?: boolean;
  className?: string;
}

export function SectionHeading({ title, eyebrow, lead, align, as: Title = "h2", ornament = true, className }: SectionHeadingProps) {
  return (
    <header className={cx("wfb-heading", align === "left" && "wfb-heading-left", className)}>
      {eyebrow ? <p className="wfb-heading-eyebrow">{eyebrow}</p> : null}
      <Title className="wfb-heading-title">{title}</Title>
      {ornament ? <Ornament /> : null}
      {lead ? <p className="wfb-lead">{lead}</p> : null}
    </header>
  );
}

export interface SectionEdgeProps {
  kind?: "awning" | "wave";
  /** Colour of the edge itself. */
  tone?: Tone;
  /** Awning's second stripe. */
  alt?: Tone;
  /** Colour behind the edge. */
  ground?: Tone;
  /** Wave pointing down. */
  flip?: boolean;
  className?: string;
}

// App addition: the grounds that sections draw with the paper grain (.wfb-grain). An edge on one of
// these carries the same grain (see wfb.css), so the wave and the section read as one surface.
const GRAINED: Tone[] = ["kraft", "canvas", "sage"];
const grainAttr = (tone: Tone | undefined) => (tone && GRAINED.includes(tone) ? "" : undefined);

export function SectionEdge({ kind = "awning", tone, alt, ground, flip, className }: SectionEdgeProps) {
  if (kind === "wave") {
    const waveTone = tone ?? "deep";
    return (
      <div
        className={cx("wfb-edge-wrap", className)}
        style={{ backgroundColor: toneVar(ground), lineHeight: 0 }}
        data-grain={grainAttr(ground)}
        aria-hidden="true"
      >
        <div
          className="wfb-edge wfb-edge-wave"
          style={{ "--c": toneVar(waveTone), transform: flip ? "scaleY(-1)" : undefined } as CSSProperties}
          data-grain={grainAttr(waveTone)}
        />
      </div>
    );
  }
  return (
    <div
      className={cx("wfb-edge", "wfb-edge-awning", className)}
      style={{ "--a": toneVar(tone ?? "heirloom"), "--b": toneVar(alt ?? "paper"), backgroundColor: toneVar(ground) } as CSSProperties}
      data-grain={grainAttr(ground)}
      aria-hidden="true"
    />
  );
}

const BUNTING_COLOURS = ["var(--heirloom)", "var(--corn)", "var(--bay)", "var(--sage)"];

export function Bunting({ className }: { className?: string }) {
  const kids: ReactNode[] = [];
  let k = 0;
  for (const [x0, x1] of [[0, 720], [720, 1440]]) {
    const mid = (x0 + x1) / 2;
    kids.push(<path key={`s${x0}`} d={`M${x0} 4 Q${mid} 44 ${x1} 4`} fill="none" stroke="var(--ink)" strokeWidth={2.5} />);
    for (let i = 1; i < 12; i++) {
      const t = i / 12;
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mid + t * t * x1;
      const y = (1 - t) * (1 - t) * 4 + 2 * (1 - t) * t * 44 + t * t * 4;
      kids.push(
        <path
          key={`f${x0}-${i}`}
          d={`M${(x - 13).toFixed(1)} ${(y - 1).toFixed(1)} h26 l-13 30 Z`}
          fill={BUNTING_COLOURS[k++ % 4]}
          stroke="var(--ink)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />,
      );
    }
  }
  return (
    <div className={cx("wfb-bunting", className)} aria-hidden="true">
      <svg viewBox="0 0 1440 64" preserveAspectRatio="xMidYMin slice" width="100%" height={64}>{kids}</svg>
    </div>
  );
}
