import { format, isSameDay, isSameMonth, startOfDay, startOfMonth, startOfWeek, addDays } from "date-fns";
import { AgentStatus, PipelineStage, TaskStatus } from "@/lib/types";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  inProgress: "In Progress",
  done: "Done"
};

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  idea: "Idea",
  script: "Script",
  thumbnail: "Thumbnail",
  filming: "Filming"
};

export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  working: "Working",
  idle: "Idle",
  blocked: "Blocked"
};

export function formatDateTime(input: number) {
  return format(new Date(input), "MMM d, yyyy HH:mm");
}

export function formatClock(input: number) {
  return format(new Date(input), "HH:mm");
}

export function buildMonthGrid(date = new Date()) {
  const firstVisibleDay = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  return Array.from({ length: 42 }, (_, idx) => addDays(firstVisibleDay, idx));
}

export function inDayRange(timestamp: number, date = new Date()) {
  return isSameDay(new Date(timestamp), date);
}

export function inWeekRange(timestamp: number, date = new Date()) {
  const start = startOfWeek(startOfDay(date), { weekStartsOn: 1 });
  const end = addDays(start, 7);
  return timestamp >= start.getTime() && timestamp < end.getTime();
}

export function inMonthRange(timestamp: number, date = new Date()) {
  return isSameMonth(new Date(timestamp), date);
}
