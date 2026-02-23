"use client";

import { useState } from "react";
import { PageTitle } from "@/components/dashboard/page-title";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles, User, Bot } from "lucide-react";
import { TASK_COLUMNS, OWNER_OPTIONS } from "@/lib/constants";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "inProgress" | "done";
  owner: "me" | "openclaw";
  priority: "low" | "medium" | "high";
  dueDate?: string;
}

const mockTasks: Task[] = [
  { id: "1", title: "Review Mission Control design", status: "inProgress", owner: "me", priority: "high" },
  { id: "2", title: "Build content pipeline", status: "todo", owner: "openclaw", priority: "high" },
  { id: "3", title: "Archive February memories", status: "done", owner: "openclaw", priority: "medium" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskOwner, setNewTaskOwner] = useState<"me" | "openclaw">("me");
  const [showAddForm, setShowAddForm] = useState(false);

  const tasksByColumn = {
    todo: tasks.filter((t) => t.status === "todo"),
    inProgress: tasks.filter((t) => t.status === "inProgress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: "todo",
      owner: newTaskOwner,
      priority: "medium",
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setShowAddForm(false);
  };

  const moveTask = (taskId: string, newStatus: Task["status"]) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "medium":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageTitle
        title="Tasks Board"
        description="Track tasks assigned to you and OpenClaw"
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-white/60">
            {tasks.length} tasks
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => alert("OpenClaw would help move tasks forward")}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            OpenClaw Advance
          </Button>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="p-4 mb-6 bg-white/5 border-white/10">
          <div className="flex gap-2">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-white/5 border-white/10"
            />
            <Select
              value={newTaskOwner}
              onValueChange={(v: "me" | "openclaw") => setNewTaskOwner(v)}
            >
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OWNER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addTask}>Add</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4 flex-1">
        {TASK_COLUMNS.map((column) => (
          <Card
            key={column.key}
            className="bg-white/5 border-white/10 flex flex-col"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{column.label}</h3>
                <Badge variant="outline" className="text-white/60">
                  {tasksByColumn[column.key as keyof typeof tasksByColumn].length}
                </Badge>
              </div>
            </div>
            <div className="p-4 space-y-3 flex-1 overflow-auto">
              {tasksByColumn[column.key as keyof typeof tasksByColumn].map((task) => (
                <Card
                  key={task.id}
                  className="p-3 bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
                  onClick={() => {
                    const statuses: Task["status"][] = ["todo", "inProgress", "done"];
                    const currentIdx = statuses.indexOf(task.status);
                    const nextStatus = statuses[(currentIdx + 1) % statuses.length];
                    moveTask(task.id, nextStatus);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </Badge>
                    {task.owner === "me" ? (
                      <User className="w-4 h-4 text-white/40" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm font-medium mb-1">{task.title}</p>
                  {task.dueDate && (
                    <p className="text-xs text-white/40">Due {task.dueDate}</p>
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
