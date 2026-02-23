"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, FileText, Search } from "lucide-react";
import { MarkdownViewer } from "@/components/dashboard/markdown-viewer";
import { PageTitle } from "@/components/dashboard/page-title";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type MemoryItem = {
  id: string;
  source: "memory" | "diary";
  title: string;
  path: string;
  date: number;
  updatedAt: number;
  content: string;
  preview: string;
};

type MemoriesResponse = {
  count: number;
  memories: MemoryItem[];
  roots: Array<{
    source: "memory" | "diary";
    root: string;
    count: number;
    error?: string;
  }>;
};

function formatMemoryDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function MemoryPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [data, setData] = useState<MemoriesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadMemories() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/memories", { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load memories (${response.status})`);
        const json = (await response.json()) as MemoriesResponse;
        if (!alive) return;
        setData(json);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Unable to load memory index");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void loadMemories();
    return () => {
      alive = false;
    };
  }, []);

  const memories = data?.memories ?? [];

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return memories;

    return memories.filter((item) =>
      [item.title, item.path, item.source, item.preview, item.content].some((field) => field.toLowerCase().includes(normalized))
    );
  }, [memories, query]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }

    const stillVisible = selectedId && filtered.some((item) => item.id === selectedId);
    if (!stillVisible) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const selected = filtered.find((item) => item.id === selectedId) ?? null;
  const sourceSummary = data?.roots ?? [];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Memory"
        description="Unified memory and diary index with global full-text search."
        actions={
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {sourceSummary.map((source) => (
              <span key={source.source} className="rounded-md border border-white/10 bg-black/20 px-2 py-1">
                {source.source}: {source.count}
              </span>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="glass border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Documents</CardTitle>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search all memory content..."
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[65vh]">
              <div className="space-y-2 p-4 pt-0">
                {loading ? <p className="text-sm text-muted-foreground">Loading memory index...</p> : null}
                {error ? <p className="text-sm text-rose-300">{error}</p> : null}
                {!loading && !error && filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No markdown files matched your search.</p>
                ) : null}

                {filtered.map((item) => {
                  const active = item.id === selectedId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        active ? "border-primary/40 bg-primary/10" : "border-white/10 bg-black/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{item.title}</p>
                        <Badge variant={item.source === "diary" ? "secondary" : "outline"}>{item.source}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.preview}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="truncate">{item.path}</span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatMemoryDate(item.date)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="border-b border-white/10">
            {selected ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{selected.title}</CardTitle>
                  <Badge variant={selected.source === "diary" ? "secondary" : "outline"}>{selected.source}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {selected.path}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatMemoryDate(selected.date)}
                  </span>
                </div>
              </div>
            ) : (
              <CardTitle className="text-base">Select a document to view</CardTitle>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[65vh]">
              <div className="p-5">
                {selected ? (
                  <MarkdownViewer content={selected.content} />
                ) : (
                  <p className="text-sm text-muted-foreground">Choose a memory entry from the left panel.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
