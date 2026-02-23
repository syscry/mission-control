"use client";

import { useState } from "react";
import { PageTitle } from "@/components/dashboard/page-title";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, FileText } from "lucide-react";

interface Memory {
  id: string;
  title: string;
  content: string;
  date: string;
  type: "memory" | "diary";
}

const mockMemories: Memory[] = [
  {
    id: "1",
    title: "February 22 - Quiet Day",
    content: "A quiet, low-noise day with no major decisions or dramatic events...",
    date: "2026-02-22",
    type: "diary",
  },
  {
    id: "2",
    title: "Mission Control Built",
    content: "Built a 6-component Mission Control dashboard with NextJS and Convex...",
    date: "2026-02-23",
    type: "memory",
  },
  {
    id: "3",
    title: "Homosync Project",
    content: "Visual exploration of identity and synchronization. 35 PNG images...",
    date: "2026-02-18",
    type: "memory",
  },
];

export default function MemoryPage() {
  const memories = mockMemories;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(mockMemories[0]);

  const filteredMemories = memories.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <PageTitle
        title="Memory"
        description="Browse and search through memories"
      />

      <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">
        <Card className="w-full md:w-80 bg-white/5 border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredMemories.map((memory) => (
                <button
                  key={memory.id}
                  onClick={() => setSelectedMemory(memory)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedMemory?.id === memory.id
                      ? "bg-white/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-white/40" />
                    <span className="text-xs text-white/40">{memory.date}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{memory.title}</p>
                  <Badge
                    variant="outline"
                    className="mt-2 text-xs"
                  >
                    {memory.type}
                  </Badge>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="flex-1 bg-white/5 border-white/10 p-6 overflow-auto">
          {selectedMemory ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedMemory.title}</h2>
                <Badge variant="outline">{selectedMemory.date}</Badge>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                  {selectedMemory.content}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-white/40">
              Select a memory to view
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
