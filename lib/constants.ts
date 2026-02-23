import { Bot, Calendar, KanbanSquare, LayoutGrid, MemoryStick, Network, Workflow } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/tasks", label: "Tasks Board", icon: KanbanSquare },
  { href: "/pipeline", label: "Content Pipeline", icon: Workflow },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/memory", label: "Memory", icon: MemoryStick },
  { href: "/team", label: "Team", icon: Network },
  { href: "/office", label: "Office", icon: LayoutGrid }
] as const;

export const TASK_COLUMNS = [
  { key: "todo", label: "Todo" },
  { key: "inProgress", label: "In Progress" },
  { key: "done", label: "Done" }
] as const;

export const PIPELINE_COLUMNS = [
  { key: "idea", label: "Idea" },
  { key: "script", label: "Script" },
  { key: "thumbnail", label: "Thumbnail" },
  { key: "filming", label: "Filming" }
] as const;

export const AGENT_TYPE_ICONS = {
  human: "You",
  openclaw: "OpenClaw",
  subagent: "Subagent"
} as const;

export const OWNER_OPTIONS = [
  { label: "Me", value: "me" },
  { label: "OpenClaw", value: "openclaw" }
] as const;

export const STATUS_COLORS = {
  working: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  idle: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  blocked: "bg-rose-500/20 text-rose-300 border-rose-500/30"
} as const;

export const APP_META = {
  name: "OpenClaw Mission Control",
  description: "Real-time control center for OpenClaw operations"
};
