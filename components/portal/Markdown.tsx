import ReactMarkdown from "react-markdown";

/** Renders Markdown written by Market admins (updates, guides) in the brand's reading style. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="max-w-(--prose-max) font-sans text-[16px] leading-[26px] text-ink [&_a]:brand-link [&_li]:mb-1.5 [&_p]:mt-0 [&_p]:mb-3 [&_strong]:font-extrabold [&_ul]:mt-0 [&_ul]:mb-3 [&_ul]:pl-5 [&>:last-child]:mb-0">
      <ReactMarkdown skipHtml>{children}</ReactMarkdown>
    </div>
  );
}

/** Plain-text excerpt of Markdown, for lists. */
export function excerpt(markdown: string, length = 150) {
  const text = markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → their text
    .replace(/^\s*(?:[-*+]|\d+\.|#+|>)\s+/gm, "") // list markers, headings, quotes
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > length ? `${text.slice(0, length).replace(/\s\S*$/, "")}…` : text;
}
