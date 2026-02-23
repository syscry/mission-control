"use client";

import { PageTitle } from "@/components/dashboard/page-title";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Network, User, Bot, Users, Plus, MessageSquare } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  type: "human" | "openclaw" | "subagent";
  role: string;
  responsibilities: string[];
  status: "active" | "idle" | "working";
  currentTask?: string;
}

const mockAgents: Agent[] = [
  {
    id: "1",
    name: "You",
    type: "human",
    role: "Commander",
    responsibilities: ["Strategic decisions", "Content direction", "Final approval"],
    status: "active",
    currentTask: "Reviewing Mission Control",
  },
  {
    id: "2",
    name: "OpenClaw",
    type: "openclaw",
    role: "Executive Assistant",
    responsibilities: ["Task management", "Memory archival", "Content creation"],
    status: "working",
    currentTask: "Deploying dashboard",
  },
  {
    id: "3",
    name: "Code Agent",
    type: "subagent",
    role: "Developer",
    responsibilities: ["Code generation", "Debugging", "Architecture"],
    status: "idle",
  },
  {
    id: "4",
    name: "Writer",
    type: "subagent",
    role: "Content Writer",
    responsibilities: ["Scripts", "Documentation", "Copy editing"],
    status: "idle",
  },
];

export default function TeamPage() {
  const agents = mockAgents;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "working":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "active":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const getAvatarIcon = (type: string) => {
    switch (type) {
      case "human":
        return <User className="w-5 h-5" />;
      case "openclaw":
        return <Bot className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageTitle
        title="Team"
        description="Organization structure and agent roles"
        icon={Network}
      />

      <div className="flex items-center justify-between mb-6">
        <Badge variant="outline" className="text-white/60">
          {agents.length} members
        </Badge>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Spawn Subagent
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {agents.map((agent) => (
          <Card
            key={agent.id}
            className="p-6 bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 bg-white/10">
                  <AvatarFallback className="bg-white/10 text-white">
                    {getAvatarIcon(agent.type)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <p className="text-sm text-white/60">{agent.role}</p>
                </div>
              </div>
              <Badge variant="outline" className={getStatusColor(agent.status)}>
                {agent.status}
              </Badge>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-white/60 mb-2">
                Responsibilities
              </h4>
              <div className="flex flex-wrap gap-2">
                {agent.responsibilities.map((resp, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-xs bg-white/5"
                  >
                    {resp}
                  </Badge>
                ))}
              </div>
            </div>

            {agent.currentTask && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-white/40" />
                  <span className="text-white/60">Current task:</span>
                  <span>{agent.currentTask}</span>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
              {agent.type === "subagent" && (
                <Button variant="outline" size="sm" className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Spawn
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
