"use client";

import { useState } from "react";
import { PageTitle } from "@/components/dashboard/page-title";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Workflow, Plus, Image, FileText, Video } from "lucide-react";
import { PIPELINE_COLUMNS } from "@/lib/constants";

interface PipelineItem {
  id: string;
  title: string;
  script?: string;
  thumbnailUrl?: string;
  status: "idea" | "script" | "thumbnail" | "filming";
  createdAt: string;
}

const mockItems: PipelineItem[] = [
  { id: "1", title: "OpenClaw Mission Control Demo", status: "script", script: "Show all 6 components...", createdAt: "2026-02-23" },
  { id: "2", title: "Memory Archive Tutorial", status: "idea", createdAt: "2026-02-22" },
  { id: "3", title: "Content Pipeline Walkthrough", status: "thumbnail", createdAt: "2026-02-20" },
];

export default function PipelinePage() {
  const [items, setItems] = useState<PipelineItem[]>(mockItems);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const itemsByColumn = {
    idea: items.filter((i) => i.status === "idea"),
    script: items.filter((i) => i.status === "script"),
    thumbnail: items.filter((i) => i.status === "thumbnail"),
    filming: items.filter((i) => i.status === "filming"),
  };

  const addItem = () => {
    if (!newItemTitle.trim()) return;
    const newItem: PipelineItem = {
      id: Date.now().toString(),
      title: newItemTitle,
      status: "idea",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setItems([...items, newItem]);
    setNewItemTitle("");
    setShowAddForm(false);
  };

  const moveItem = (itemId: string, newStatus: PipelineItem["status"]) => {
    setItems(items.map(i => i.id === itemId ? { ...i, status: newStatus } : i));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "script":
        return <FileText className="w-4 h-4" />;
      case "thumbnail":
        return <Image className="w-4 h-4" />;
      case "filming":
        return <Video className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageTitle
        title="Content Pipeline"
        description="Track content from idea to filming"
      />

      <div className="flex items-center justify-between mb-6">
        <Badge variant="outline" className="text-white/60">
          {items.length} items
        </Badge>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Idea
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-4 mb-6 bg-white/5 border-white/10">
          <div className="flex gap-2">
            <Input
              placeholder="Content idea..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              className="flex-1 bg-white/5 border-white/10"
            />
            <Button onClick={addItem}>Add</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-4 flex-1">
        {PIPELINE_COLUMNS.map((column) => (
          <Card
            key={column.key}
            className="bg-white/5 border-white/10 flex flex-col"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{column.label}</h3>
                <Badge variant="outline" className="text-white/60">
                  {itemsByColumn[column.key as keyof typeof itemsByColumn].length}
                </Badge>
              </div>
            </div>
            <div className="p-4 space-y-3 flex-1 overflow-auto">
              {itemsByColumn[column.key as keyof typeof itemsByColumn].map((item) => (
                <Card
                  key={item.id}
                  className="p-3 bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => {
                    const statuses: PipelineItem["status"][] = ["idea", "script", "thumbnail", "filming"];
                    const currentIdx = statuses.indexOf(item.status);
                    const nextStatus = statuses[(currentIdx + 1) % statuses.length];
                    moveItem(item.id, nextStatus);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/40">{item.createdAt}</span>
                    {getStatusIcon(item.status)}
                  </div>
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.script && (
                    <p className="text-xs text-white/60 mt-2 line-clamp-2">{item.script}</p>
                  )}
                  {item.thumbnailUrl && (
                    <div className="mt-2 aspect-video bg-white/10 rounded flex items-center justify-center">
                      <Image className="w-6 h-6 text-white/40" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
