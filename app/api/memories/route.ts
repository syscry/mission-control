import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

type MemorySource = "memory" | "diary";

type MemoryItem = {
  id: string;
  source: MemorySource;
  title: string;
  path: string;
  date: number;
  updatedAt: number;
  content: string;
  preview: string;
};

type SourceConfig = {
  source: MemorySource;
  envVar: string;
  fallbackDir: string;
};

const SOURCE_CONFIGS: SourceConfig[] = [
  { source: "memory", envVar: "OPENCLAW_MEMORY_DIR", fallbackDir: "memory" },
  { source: "diary", envVar: "OPENCLAW_DIARY_DIR", fallbackDir: "diary" }
];

async function collectMarkdownFiles(root: string): Promise<string[]> {
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }

  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(root, entry.name);
      if (entry.isDirectory()) {
        return collectMarkdownFiles(absolutePath);
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
        return [absolutePath];
      }
      return [];
    })
  );

  return nested.flat();
}

function extractTitle(content: string, filePath: string) {
  const frontmatterTitle = content.match(/^---[\s\S]*?\n(?:title|Title):\s*(.+)\n[\s\S]*?---/m)?.[1]?.trim();
  if (frontmatterTitle) return frontmatterTitle;

  const headingTitle = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (headingTitle) return headingTitle;

  return path
    .basename(filePath, ".md")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDate(content: string, filePath: string, fallback: number) {
  const frontmatterDate = content.match(/^---[\s\S]*?\n(?:date|Date):\s*(.+)\n[\s\S]*?---/m)?.[1]?.trim();
  if (frontmatterDate) {
    const parsed = Date.parse(frontmatterDate);
    if (!Number.isNaN(parsed)) return parsed;
  }

  const filenameDate = filePath.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
  if (filenameDate) {
    const parsed = Date.parse(filenameDate);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return fallback;
}

function buildPreview(content: string) {
  return content
    .replace(/^#+\s+/gm, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

export async function GET() {
  const roots = SOURCE_CONFIGS.map((config) => {
    const resolved = process.env[config.envVar] ?? path.join(os.homedir(), "openclaw-workspace", config.fallbackDir);
    return { ...config, root: resolved };
  });

  const sourceResults = await Promise.all(
    roots.map(async ({ source, root }) => {
      try {
        const filePaths = await collectMarkdownFiles(root);
        const items = (
          await Promise.all(
            filePaths.map(async (filePath): Promise<MemoryItem | null> => {
              try {
                const [content, stat] = await Promise.all([fs.readFile(filePath, "utf8"), fs.stat(filePath)]);
                const relativePath = path.relative(root, filePath);
                const title = extractTitle(content, filePath);
                const date = extractDate(content, filePath, stat.mtimeMs);
                return {
                  id: `${source}:${relativePath}`,
                  source,
                  title,
                  path: relativePath,
                  date,
                  updatedAt: stat.mtimeMs,
                  content,
                  preview: buildPreview(content)
                };
              } catch {
                return null;
              }
            })
          )
        ).filter((item): item is MemoryItem => item !== null);

        return { source, root, count: items.length, items, error: undefined as string | undefined };
      } catch (error) {
        return {
          source,
          root,
          count: 0,
          items: [] as MemoryItem[],
          error: error instanceof Error ? error.message : "Unable to read directory"
        };
      }
    })
  );

  const memories = sourceResults
    .flatMap((source) => source.items)
    .sort((a, b) => b.date - a.date || b.updatedAt - a.updatedAt || a.title.localeCompare(b.title));

  return NextResponse.json({
    count: memories.length,
    roots: sourceResults.map(({ source, root, count, error }) => ({ source, root, count, error })),
    memories
  });
}
