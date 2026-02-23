"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Bot, MessageSquare, Plus, UserRound } from "lucide-react";
import { PageTitle } from "@/components/dashboard/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Agent = {
  _id: string;
  name: string;
  type: "human" | "openclaw" | "subagent";
  role: string;
  responsibilities: string[];
  parentId?: string;
  status: "working" | "idle" | "blocked";
  activeTask?: string;
  avatarEmoji: string;
};

type Task = {
  _id: string;
  title: string;
  description?: string;
  assignee: "me" | "openclaw";
  status: "todo" | "inProgress" | "done";
};

type ContentItem = {
  _id: string;
  title: string;
  owner: "me" | "openclaw";
  stage: "idea" | "script" | "thumbnail" | "filming";
};

type AgentDiscipline = "Developer" | "Writer" | "Designer";

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function getDiscipline(agent: Agent): AgentDiscipline {
  const profile = `${agent.role} ${agent.responsibilities.join(" ")}`.toLowerCase();
  if (profile.includes("writer") || profile.includes("script") || profile.includes("copy")) return "Writer";
  if (profile.includes("design") || profile.includes("thumbnail") || profile.includes("visual")) return "Designer";
  return "Developer";
}

export default function TeamPage() {
  const agents = (useQuery("agents:list", {}) as Agent[] | undefined) ?? [];
  const tasks = (useQuery("tasks:list", {}) as Task[] | undefined) ?? [];
  const pipeline = (useQuery("pipeline:list", {}) as ContentItem[] | undefined) ?? [];

  const updateStatus = useMutation("agents:updateStatus");
  const spawnSubagent = useMutation("agents:spawnSubagent");
  const [busyAgentId, setBusyAgentId] = useState<string | null>(null);

  const model = useMemo(() => {
    const commander = agents.find((agent) => agent.type === "human") ?? agents.find((agent) => !agent.parentId) ?? null;

    const openclaw =
      agents.find((agent) => agent.type === "openclaw" && commander && agent.parentId === commander._id) ??
      agents.find((agent) => agent.type === "openclaw") ??
      null;

    const subagents = agents
      .filter((agent) => agent.type === "subagent")
      .filter((agent) => (openclaw ? agent.parentId === openclaw._id : true));

    const includedIds = new Set([commander?._id, openclaw?._id, ...subagents.map((agent) => agent._id)].filter(Boolean));
    const others = agents.filter((agent) => !includedIds.has(agent._id));

    return { commander, openclaw, subagents, others };
  }, [agents]);

  const meTasks = tasks.filter((task) => task.assignee === "me" && task.status !== "done").map((task) => task.title);
  const openclawTasks = tasks.filter((task) => task.assignee === "openclaw" && task.status !== "done").map((task) => task.title);
  const writingItems = pipeline.filter((item) => item.stage === "idea" || item.stage === "script").map((item) => item.title);
  const designItems = pipeline.filter((item) => item.stage === "thumbnail").map((item) => item.title);
  const activePipeline = pipeline.filter((item) => item.stage !== "filming").map((item) => item.title);

  function getWorkload(agent: Agent) {
    const role = agent.role.toLowerCase();
    const candidates: string[] = [];

    if (agent.activeTask) candidates.push(agent.activeTask);

    if (agent.type === "human") {
      candidates.push(...meTasks);
    } else if (role.includes("developer")) {
      const developerTasks = tasks
        .filter((task) => /api|mutation|bug|code|build|dashboard|feature|convex/i.test(`${task.title} ${task.description ?? ""}`))
        .map((task) => task.title);
      candidates.push(...developerTasks, ...openclawTasks);
    } else if (role.includes("writer")) {
      candidates.push(...writingItems, ...openclawTasks);
    } else if (role.includes("designer")) {
      candidates.push(...designItems, ...activePipeline);
    } else {
      candidates.push(...openclawTasks, ...activePipeline);
    }

    return unique(candidates).slice(0, 4);
  }

  async function handleMessage(agent: Agent) {
    const message = window.prompt(`Message ${agent.name}: set current task/focus`, agent.activeTask ?? "");
    if (message === null) return;

    setBusyAgentId(agent._id);
    try {
      await updateStatus({
        agentId: agent._id as never,
        status: message.trim() ? "working" : "idle",
        activeTask: message.trim() || undefined
      });
    } finally {
      setBusyAgentId(null);
    }
  }

  async function handleSpawn(agent: Agent) {
    setBusyAgentId(agent._id);
    try {
      const unit = Math.floor(Math.random() * 900 + 100);
      const discipline = getDiscipline(agent);
      await spawnSubagent({
        parentId: agent._id as never,
        name: `${agent.name.split(" ")[0]}-${unit}`,
        role: `${discipline} Subagent`,
        responsibilities: [`Assist ${agent.name}`, "Execute delegated tasks", "Post progress updates"],
        avatarEmoji: "🛰️"
      });
    } finally {
      setBusyAgentId(null);
    }
  }

  function AgentCard({ agent, compact = false }: { agent: Agent; compact?: boolean }) {
    const workload = getWorkload(agent);
    const isActive = agent.status === "working";
    const cardStatusLabel = isActive ? "active" : "idle";
    const discipline = getDiscipline(agent);

    return (
      <div className={`rounded-xl border border-white/10 bg-black/25 ${compact ? "p-3" : "p-4"}`}>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg">
              {agent.avatarEmoji}
            </div>
            <div>
              <p className="text-sm font-medium">{agent.name}</p>
              <p className="text-xs text-muted-foreground">{agent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="border-cyan-400/30 text-cyan-200">
              {discipline}
            </Badge>
            <Badge className={isActive ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300" : "border-slate-500/30 bg-slate-500/15"}>
              {cardStatusLabel}
            </Badge>
            {agent.status === "blocked" ? (
              <Badge variant="outline" className="border-rose-500/40 text-rose-300">
                blocked
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {agent.responsibilities.map((responsibility) => (
            <span key={`${agent._id}-${responsibility}`} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px]">
              {responsibility}
            </span>
          ))}
        </div>

        <div className="mb-3 rounded-lg border border-white/10 bg-black/30 p-2.5">
          <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Current Work</p>
          {workload.length ? (
            <ul className="space-y-1 text-xs">
              {workload.map((item) => (
                <li key={`${agent._id}-work-${item}`} className="truncate text-foreground/90">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No active assignment.</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" disabled={busyAgentId === agent._id} onClick={() => void handleMessage(agent)}>
            <MessageSquare className="h-3.5 w-3.5" />
            Message
          </Button>
          <Button size="sm" className="flex-1" disabled={busyAgentId === agent._id} onClick={() => void handleSpawn(agent)}>
            <Plus className="h-3.5 w-3.5" />
            Spawn
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Team"
        description="Organization chart and live execution state for the human commander and subagents."
        actions={
          <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-muted-foreground">
            {agents.some((agent) => agent.status === "working") ? <Bot className="h-3.5 w-3.5 text-emerald-300" /> : <UserRound className="h-3.5 w-3.5" />}
            {agents.length} agents connected
          </div>
        }
      />

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Organization Chart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {model.commander ? (
            <div className="mx-auto max-w-lg">
              <AgentCard agent={model.commander} compact />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No commander agent found.</p>
          )}

          {model.commander && model.openclaw ? <div className="mx-auto h-6 w-px bg-white/20" /> : null}

          {model.openclaw ? (
            <div className="mx-auto max-w-lg">
              <AgentCard agent={model.openclaw} compact />
            </div>
          ) : null}

          {model.openclaw && model.subagents.length > 0 ? <div className="mx-auto h-6 w-px bg-white/20" /> : null}

          {model.subagents.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {model.subagents.map((agent) => (
                <AgentCard key={agent._id} agent={agent} compact />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No subagents currently assigned.</p>
          )}
        </CardContent>
      </Card>

      {model.others.length > 0 ? (
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-base">Additional Agents</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {model.others.map((agent) => (
              <AgentCard key={agent._id} agent={agent} />
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
