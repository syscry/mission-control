import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MarkdownViewerProps = {
  content: string;
  className?: string;
};

function sanitizeHref(rawHref: string) {
  const trimmed = rawHref.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("./") || trimmed.startsWith("../")) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:") {
      return trimmed;
    }
  } catch {
    return null;
  }

  return null;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;

  let lastIndex = 0;
  let tokenIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    if (match[2] && match[3]) {
      const href = sanitizeHref(match[3]);
      if (href) {
        nodes.push(
          <a
            key={`${keyPrefix}-link-${tokenIndex}`}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-300 underline decoration-cyan-400/40 underline-offset-2 hover:text-cyan-200"
          >
            {match[2]}
          </a>
        );
      } else {
        nodes.push(match[2]);
      }
    } else if (match[4]) {
      nodes.push(
        <code key={`${keyPrefix}-inline-code-${tokenIndex}`} className="rounded bg-white/10 px-1 py-0.5 text-[0.9em] text-cyan-200">
          {match[4]}
        </code>
      );
    } else if (match[5]) {
      nodes.push(
        <strong key={`${keyPrefix}-strong-${tokenIndex}`} className="font-semibold text-foreground">
          {match[5]}
        </strong>
      );
    } else if (match[6]) {
      nodes.push(
        <em key={`${keyPrefix}-em-${tokenIndex}`} className="italic text-foreground/95">
          {match[6]}
        </em>
      );
    }

    lastIndex = start + match[0].length;
    tokenIndex += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let blockIndex = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim();
      i += 1;
      const codeLines: string[] = [];

      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;

      blocks.push(
        <pre
          key={`md-code-${blockIndex}`}
          className="overflow-x-auto rounded-xl border border-white/10 bg-black/50 p-3 text-xs text-cyan-100"
        >
          {language ? <div className="mb-2 text-[10px] uppercase tracking-wide text-cyan-300/80">{language}</div> : null}
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      blockIndex += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(6, Math.max(1, heading[1].length));
      const headingClass =
        level === 1
          ? "mt-2 text-2xl font-semibold tracking-tight"
          : level === 2
            ? "mt-2 text-xl font-semibold"
            : "mt-2 text-base font-semibold";

      blocks.push(
        <div key={`md-heading-${blockIndex}`} className={headingClass}>
          {renderInline(heading[2], `heading-${blockIndex}`)}
        </div>
      );
      i += 1;
      blockIndex += 1;
      continue;
    }

    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      blocks.push(<hr key={`md-hr-${blockIndex}`} className="my-3 border-white/10" />);
      i += 1;
      blockIndex += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, "").trim());
        i += 1;
      }

      blocks.push(
        <blockquote
          key={`md-quote-${blockIndex}`}
          className="border-l-2 border-cyan-400/50 bg-cyan-500/5 px-3 py-2 text-sm text-foreground/90"
        >
          {renderInline(quoteLines.join(" "), `quote-${blockIndex}`)}
        </blockquote>
      );
      blockIndex += 1;
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+]\s+/, "").trim());
        i += 1;
      }

      blocks.push(
        <ul key={`md-ul-${blockIndex}`} className="list-inside list-disc space-y-1 text-sm text-foreground/90">
          {items.map((item, itemIndex) => (
            <li key={`md-ul-${blockIndex}-${itemIndex}`}>{renderInline(item, `ul-${blockIndex}-${itemIndex}`)}</li>
          ))}
        </ul>
      );
      blockIndex += 1;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, "").trim());
        i += 1;
      }

      blocks.push(
        <ol key={`md-ol-${blockIndex}`} className="list-inside list-decimal space-y-1 text-sm text-foreground/90">
          {items.map((item, itemIndex) => (
            <li key={`md-ol-${blockIndex}-${itemIndex}`}>{renderInline(item, `ol-${blockIndex}-${itemIndex}`)}</li>
          ))}
        </ol>
      );
      blockIndex += 1;
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    i += 1;
    while (i < lines.length) {
      const next = lines[i];
      const nextTrimmed = next.trim();
      const isBoundary =
        !nextTrimmed ||
        nextTrimmed.startsWith("```") ||
        /^(#{1,6})\s+/.test(next) ||
        /^>\s?/.test(next) ||
        /^[-*+]\s+/.test(next) ||
        /^\d+\.\s+/.test(next) ||
        /^---+$/.test(nextTrimmed) ||
        /^\*\*\*+$/.test(nextTrimmed);

      if (isBoundary) break;
      paragraphLines.push(nextTrimmed);
      i += 1;
    }

    blocks.push(
      <p key={`md-p-${blockIndex}`} className="text-sm leading-6 text-foreground/90">
        {renderInline(paragraphLines.join(" "), `p-${blockIndex}`)}
      </p>
    );
    blockIndex += 1;
  }

  return <div className={cn("space-y-3", className)}>{blocks}</div>;
}
