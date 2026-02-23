"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, Bot, Image, PenSquare, Plus } from "lucide-react";
import { PageTitle } from "@/components/dashboard/page-title";
import { SeedControl } from "@/components/dashboard/seed-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PIPELINE_COLUMNS } from "@/lib/constants";
import { PIPELINE_STAGE_LABELS } from "@/lib/dashboard";
import { PipelineStage, TaskOwner } from "@/lib/types";

type ContentItem = {
  _id: string;
  title: string;
  owner: TaskOwner;
  stage: PipelineStage;
  notes?: string;
  scriptText?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
};

const stageOrder: PipelineStage[] = ["idea", "script", "thumbnail", "filming"];

function resolveStage(current: PipelineStage, delta: -1 | 1) {
  const idx = stageOrder.indexOf(current);
  return stageOrder[Math.min(Math.max(0, idx + delta), stageOrder.length - 1)];
}

export default function ContentPipelinePage() {
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState<TaskOwner>("me");
  const [notes, setNotes] = useState("");

  const [scriptText, setScriptText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [selected, setSelected] = useState<ContentItem | null>(null);

  const items = (useQuery("pipeline:list", {}) as ContentItem[] | undefined) ?? [];

  const createItem = useMutation("pipeline:create");
  const moveStage = useMutation("pipeline:moveStage");
  const updateAssets = useMutation("pipeline:updateAssets");
  const openclawAdvance = useMutation("pipeline:openclawAdvance");

  const grouped = useMemo(() => {
    return PIPELINE_COLUMNS.reduce<Record<PipelineStage, ContentItem[]>>(
      (acc, column) => {
        acc[column.key as PipelineStage] = items.filter((item) => item.stage === column.key);
        return acc;
      },
      { idea: [], script: [], thumbnail: [], filming: [] }
    );
  }, [items]);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Content Pipeline"
        description="Idea → Script → Thumbnail → Filming workflow with OpenClaw automation."
        actions={
          <>
            <SeedControl />
            <Button variant="secondary" size="sm" onClick={() => openclawAdvance({})}>
              <Bot className="h-4 w-4" />
              OpenClaw Move Forward
            </Button>
          </>
        }
      />

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Create Content Item</CardTitle>
          <CardDescription>Attach ownership and notes now, then enrich assets later.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Video/topic title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select value={owner} onValueChange={(value) => setOwner(value as TaskOwner)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="me">Me</SelectItem>
              <SelectItem value="openclaw">OpenClaw</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            className="md:col-span-2"
            value={notes}
            placeholder="Brief notes, hooks, angle..."
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button
            className="md:col-span-2"
            onClick={async () => {
              if (!title.trim()) return;
              await createItem({ title: title.trim(), owner, notes: notes.trim() || undefined });
              setTitle("");
              setNotes("");
            }}
          >
            <Plus className="h-4 w-4" />
            Add To Pipeline
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-4">
        {PIPELINE_COLUMNS.map((column) => {
          const stageItems = grouped[column.key as PipelineStage] ?? [];
          return (
            <Card key={column.key} className="glass min-h-[360px] border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{column.label}</CardTitle>
                  <Badge variant="secondary">{stageItems.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {stageItems.map((item) => {
                  const idx = stageOrder.indexOf(item.stage);
                  return (
                    <div key={item._id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <h3 className="font-medium leading-tight">{item.title}</h3>
                        <Badge variant="outline">{item.owner === "openclaw" ? "OpenClaw" : "Me"}</Badge>
                      </div>
                      {item.notes ? <p className="mb-2 text-xs text-muted-foreground">{item.notes}</p> : null}

                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="secondary">{PIPELINE_STAGE_LABELS[item.stage]}</Badge>
                        {item.scriptText ? <Badge variant="outline">Script</Badge> : null}
                        {item.imageUrl ? <Badge variant="outline">Image</Badge> : null}
                        {item.thumbnailUrl ? <Badge variant="outline">Thumbnail</Badge> : null}
                      </div>

                      <div className="mb-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={idx === 0}
                          onClick={() => moveStage({ contentId: item._id as never, stage: resolveStage(item.stage, -1) })}
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          disabled={idx === stageOrder.length - 1}
                          onClick={() => moveStage({ contentId: item._id as never, stage: resolveStage(item.stage, 1) })}
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setSelected(item);
                                setScriptText(item.scriptText ?? "");
                                setImageUrl(item.imageUrl ?? "");
                                setThumbnailUrl(item.thumbnailUrl ?? "");
                                setNotes(item.notes ?? "");
                              }}
                            >
                              <PenSquare className="h-3 w-3" />
                              Assets
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assets for {selected?.title}</DialogTitle>
                              <DialogDescription>Attach script content, image references, and thumbnail URLs.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                              <Textarea
                                placeholder="Script text"
                                value={scriptText}
                                onChange={(e) => setScriptText(e.target.value)}
                              />
                              <Input
                                placeholder="Reference image URL"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                              />
                              <Input
                                placeholder="Thumbnail URL"
                                value={thumbnailUrl}
                                onChange={(e) => setThumbnailUrl(e.target.value)}
                              />
                              <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                              <Button
                                className="w-full"
                                onClick={async () => {
                                  if (!selected) return;
                                  await updateAssets({
                                    contentId: selected._id as never,
                                    scriptText: scriptText || undefined,
                                    imageUrl: imageUrl || undefined,
                                    thumbnailUrl: thumbnailUrl || undefined,
                                    notes: notes || undefined
                                  });
                                }}
                              >
                                <Image className="h-4 w-4" />
                                Save Assets
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  );
                })}
                {stageItems.length === 0 ? <p className="text-sm text-muted-foreground">Nothing in this stage.</p> : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
