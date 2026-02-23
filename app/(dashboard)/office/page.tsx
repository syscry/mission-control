"use client";

import { useMemo, useState } from "react";
import { Activity, Monitor, UserRound } from "lucide-react";
import { PageTitle } from "@/components/dashboard/page-title";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Agent {
  _id: string;
  name: string;
  type: "human" | "openclaw" | "subagent";
  role: string;
  status: "working" | "idle" | "blocked";
  activeTask?: string;
  avatarEmoji: string;
}

interface DeskSlot {
  id: string;
  name: string;
  left: number;
  top: number;
}

const DESK_SLOTS: DeskSlot[] = [
  { id: "desk-commander", name: "Command", left: 8, top: 10 },
  { id: "desk-orchestrator", name: "Orchestrator", left: 38, top: 10 },
  { id: "desk-dev", name: "Dev Pod", left: 68, top: 10 },
  { id: "desk-writer", name: "Writer Bay", left: 8, top: 58 },
  { id: "desk-design", name: "Design Lab", left: 38, top: 58 },
  { id: "desk-overflow", name: "Overflow", left: 68, top: 58 }
];

const mockAgents: Agent[] = [
  { _id: "1", name: "You", type: "human", role: "Commander", status: "working", activeTask: "Reviewing dashboard", avatarEmoji: "👤" },
  { _id: "2", name: "OpenClaw", type: "openclaw", role: "Assistant", status: "working", activeTask: "Deploying app", avatarEmoji: "🤖" },
  { _id: "3", name: "Code Agent", type: "subagent", role: "Developer", status: "idle", avatarEmoji: "💻" },
  { _id: "4", name: "Writer", type: "subagent", role: "Content", status: "idle", avatarEmoji: "✍️" },
];

function priority(agent: Agent) {
  if (agent.type === "human") return 0;
  if (agent.type === "openclaw") return 1;
  return 2;
}

export default function OfficePage() {
  const agents = mockAgents;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const orderedAgents = useMemo(
    () => [...agents].sort((a, b) => priority(a) - priority(b) || a.name.localeCompare(b.name)),
    [agents]
  );

  const placements = useMemo(
    () =>
      orderedAgents.map((agent, index) => ({
        agent,
        slot: DESK_SLOTS[index % DESK_SLOTS.length]
      })),
    [orderedAgents]
  );

  const selectedAgent =
    placements.find((placement) => placement.agent._id === selectedId)?.agent ?? placements[0]?.agent ?? null;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Office"
        description="Live floorplan of where agents are working right now."
      />

      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-emerald-300" />
          {agents.filter((agent) => agent.status === "working").length} active
        </div>
      </div>

      <Card className="glass border-white/10">
        <CardHeader className="px-4 py-3 md:px-6 md:py-4">
          <CardTitle className="text-sm md:text-base">Office Floorplan</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="relative min-h-[350px] md:min-h-[540px] overflow-hidden rounded-xl md:rounded-2xl border border-white/10 bg-black/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.12),transparent_36%),radial-gradient(circle_at_80%_100%,rgba(16,185,129,0.08),transparent_40%)]" />
            <div className="absolute inset-4 rounded-xl border border-dashed border-white/10" />

            {DESK_SLOTS.map((slot) => (
              <div key={slot.id} className="absolute" style={{ left: `${slot.left}%`, top: `${slot.top}%` }}>
                <div className="relative h-28 w-36 rounded-xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                  <div className="absolute right-2 top-2 inline-flex h-7 w-11 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
                    <Monitor className="h-3.5 w-3.5" />
                  </div>
                  <p className="mt-16 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{slot.name}</p>
                </div>
              </div>
            ))}

            {placements.map(({ agent, slot }) => {
              const atComputer = agent.status === "working";
              const avatarLeft = slot.left + 5;
              const avatarTop = atComputer ? slot.top + 17 : slot.top + 29;
              const isSelected = selectedAgent?._id === agent._id;

              return (
                <button
                  key={agent._id}
                  type="button"
                  onClick={() => setSelectedId(agent._id)}
                  className="absolute text-left transition"
                  style={{ left: `${avatarLeft}%`, top: `${avatarTop}%` }}
                >
                  <div
                    className={`relative flex h-11 w-11 items-center justify-center rounded-full border text-lg ${
                      isSelected ? "border-primary/50 bg-primary/15" : "border-white/20 bg-black/40"
                    } ${!atComputer ? "opacity-80" : ""}`}
                  >
                    {agent.avatarEmoji}
                    <span
                      className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-black/40 ${
                        atComputer ? "animate-pulse bg-emerald-400" : "bg-slate-400"
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-[11px] font-medium">{agent.name}</p>
                  <p className="text-[10px] text-muted-foreground">{atComputer ? "at computer" : "away"}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Agent Status</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedAgent ? (
            <div className="flex flex-wrap items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-black/30 text-2xl">
                {selectedAgent.avatarEmoji}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-medium">{selectedAgent.name}</p>
                  <Badge className={selectedAgent.status === "working" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15"}>
                    {selectedAgent.status === "working" ? "active" : "idle"}
                  </Badge>
                  {selectedAgent.status === "blocked" ? (
                    <Badge variant="outline" className="border-rose-500/40 text-rose-300">
                      blocked
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{selectedAgent.role}</p>
                <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Current Task</p>
                  <p className="text-sm text-foreground/90">{selectedAgent.activeTask || "Awaiting assignment"}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <UserRound className="h-4 w-4" />
              No agents available yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
