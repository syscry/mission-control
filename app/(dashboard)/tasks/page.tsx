"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, Bot, CheckCheck, Plus } from "lucide-react";
import { PageTitle } from "@/components/dashboard/page-title";
import { SeedControl } from "@/components/dashboard/seed-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TASK_COLUMNS } from "@/lib/constants";
import { TASK_STATUS_LABELS, formatDateTime } from "@/lib/dashboard";
import { TaskOwner, TaskStatus } from "@/lib/types";

type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee: TaskOwner;
  priority: "low" | "medium" | "high";
  dueDate?: number;
};

const order: TaskStatus[] = ["todo", "inProgress", "done"];

function nextStatus(current: TaskStatus, delta: -1 | 1) {
  const idx = order.indexOf(current);
  return order[Math.min(Math.max(0, idx + delta), order.length - 1)];
}

export default function TasksBoardPage() {
  const [filter, setFilter] = useState<"all" | TaskOwner>("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState<TaskOwner>("me");
  const [dueDate, setDueDate] = useState("");

  const tasks =
    (useQuery("tasks:list", {
      assignee: filter === "all" ? undefined : filter
    }) as Task[] | undefined) ?? [];

  const createTask = useMutation("tasks:create");
  const updateTaskStatus = useMutation("tasks:updateStatus");
  const updateTaskAssignee = useMutation("tasks:updateAssignee");
  const openclawAdvance = useMutation("tasks:openclawAdvance");

  const grouped = useMemo(() => {
    return TASK_COLUMNS.reduce<Record<TaskStatus, Task[]>>(
      (acc, col) => {
        acc[col.key as TaskStatus] = tasks.filter((task) => task.status === col.key);
        return acc;
      },
      { todo: [], inProgress: [], done: [] }
    );
  }, [tasks]);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Tasks Board"
        description="Kanban board for human vs OpenClaw execution with real-time status transitions."
        actions={
          <>
            <SeedControl />
            <Button variant="secondary" size="sm" onClick={() => openclawAdvance({})}>
              <Bot className="h-4 w-4" />
              OpenClaw Advance
            </Button>
            <Select value={filter} onValueChange={(value) => setFilter(value as "all" | TaskOwner)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                <SelectItem value="me">Me</SelectItem>
                <SelectItem value="openclaw">OpenClaw</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Create Task</CardTitle>
          <CardDescription>Add work for yourself or OpenClaw.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Textarea
            className="md:col-span-2"
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <Select value={assignee} onValueChange={(value) => setAssignee(value as TaskOwner)}>
              <SelectTrigger>
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="me">Me</SelectItem>
                <SelectItem value="openclaw">OpenClaw</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full"
              onClick={async () => {
                if (!title.trim()) return;
                await createTask({
                  title: title.trim(),
                  description: description.trim() || undefined,
                  assignee,
                  dueDate: dueDate ? new Date(dueDate).getTime() : undefined
                });
                setTitle("");
                setDescription("");
                setDueDate("");
              }}
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {TASK_COLUMNS.map((column) => {
          const columnTasks = grouped[column.key as TaskStatus] ?? [];
          return (
            <Card key={column.key} className="glass min-h-[360px] border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{column.label}</CardTitle>
                  <Badge variant="secondary">{columnTasks.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {columnTasks.map((task) => {
                  const statusIndex = order.indexOf(task.status);
                  return (
                    <div key={task._id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="font-medium leading-tight">{task.title}</h3>
                        <Badge variant="outline">{task.priority}</Badge>
                      </div>

                      {task.description ? <p className="mb-2 text-xs text-muted-foreground">{task.description}</p> : null}

                      <div className="mb-3 flex items-center gap-2 text-xs">
                        <Badge variant="secondary">{TASK_STATUS_LABELS[task.status]}</Badge>
                        <Badge variant="outline">{task.assignee === "me" ? "Me" : "OpenClaw"}</Badge>
                      </div>

                      {task.dueDate ? (
                        <p className="mb-3 text-xs text-muted-foreground">Due {formatDateTime(task.dueDate)}</p>
                      ) : null}

                      <div className="mb-2">
                        <Select
                          value={task.assignee}
                          onValueChange={(value) => updateTaskAssignee({ taskId: task._id as never, assignee: value as TaskOwner })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="me">Me</SelectItem>
                            <SelectItem value="openclaw">OpenClaw</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={statusIndex === 0}
                          onClick={() => updateTaskStatus({ taskId: task._id as never, status: nextStatus(task.status, -1) })}
                        >
                          <ArrowLeft className="h-3 w-3" />
                          Back
                        </Button>

                        <Button
                          size="sm"
                          disabled={statusIndex === order.length - 1}
                          onClick={() => updateTaskStatus({ taskId: task._id as never, status: nextStatus(task.status, 1) })}
                        >
                          {statusIndex === order.length - 2 ? <CheckCheck className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                          Next
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {columnTasks.length === 0 ? <p className="text-sm text-muted-foreground">No tasks in this column.</p> : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
