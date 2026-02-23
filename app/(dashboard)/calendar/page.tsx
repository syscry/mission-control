"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { addDays, format, isSameDay, isSameMonth, startOfWeek } from "date-fns";
import { CalendarCheck2, CheckCircle2, Clock3, Plus } from "lucide-react";
import { PageTitle } from "@/components/dashboard/page-title";
import { SeedControl } from "@/components/dashboard/seed-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildMonthGrid, formatClock } from "@/lib/dashboard";
import { CalendarView, TaskOwner } from "@/lib/types";

type CalendarItem = {
  _id: string;
  title: string;
  type: "cron" | "task";
  scheduledFor: number;
  durationMinutes?: number;
  cronExpression?: string;
  scheduledBy: TaskOwner;
  confirmed: boolean;
};

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>("week");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"cron" | "task">("cron");
  const [scheduledBy, setScheduledBy] = useState<TaskOwner>("openclaw");
  const [scheduledFor, setScheduledFor] = useState("");
  const [duration, setDuration] = useState("30");
  const [cronExpression, setCronExpression] = useState("0 * * * *");

  const events = (useQuery("calendar:list", {}) as CalendarItem[] | undefined) ?? [];
  const createEvent = useMutation("calendar:create");
  const toggleConfirmed = useMutation("calendar:toggleConfirmed");

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, idx) => addDays(weekStart, idx));
  const monthGrid = useMemo(() => buildMonthGrid(today), [today]);

  const dayEvents = events.filter((item) => isSameDay(new Date(item.scheduledFor), today));

  return (
    <div className="space-y-6">
      <PageTitle
        title="Calendar"
        description="Day/week/month schedule for cron jobs and tasks with confirmation status."
        actions={<SeedControl />}
      />

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Schedule Item</CardTitle>
          <CardDescription>Visual confirmation that OpenClaw scheduled everything correctly.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select value={type} onValueChange={(value) => setType(value as "cron" | "task")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cron">Cron Job</SelectItem>
              <SelectItem value="task">Task</SelectItem>
            </SelectContent>
          </Select>
          <Input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
          <Input type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} />
          <Select value={scheduledBy} onValueChange={(value) => setScheduledBy(value as TaskOwner)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openclaw">OpenClaw</SelectItem>
              <SelectItem value="me">Me</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Cron expression"
            value={cronExpression}
            onChange={(e) => setCronExpression(e.target.value)}
            disabled={type === "task"}
          />

          <Button
            className="md:col-span-2 lg:col-span-3"
            onClick={async () => {
              if (!title.trim() || !scheduledFor) return;
              await createEvent({
                title: title.trim(),
                type,
                scheduledFor: new Date(scheduledFor).getTime(),
                durationMinutes: Number(duration) || undefined,
                cronExpression: type === "cron" ? cronExpression : undefined,
                scheduledBy
              });
              setTitle("");
            }}
          >
            <Plus className="h-4 w-4" />
            Add Schedule Item
          </Button>
        </CardContent>
      </Card>

      <Tabs value={view} onValueChange={(value) => setView(value as CalendarView)}>
        <TabsList>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>

        <TabsContent value="day">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-base">Today ({format(today, "MMM d")})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dayEvents.map((event) => (
                <div key={event._id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.scheduledFor), "HH:mm")} • {event.type === "cron" ? "Cron job" : "Task"}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toggleConfirmed({ eventId: event._id as never })}>
                      {event.confirmed ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Clock3 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
              {dayEvents.length === 0 ? <p className="text-sm text-muted-foreground">No events today.</p> : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {weekDays.map((day) => {
              const dayItems = events.filter((event) => isSameDay(new Date(event.scheduledFor), day));
              return (
                <Card key={day.toISOString()} className="glass border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{format(day, "EEE, MMM d")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {dayItems.map((event) => (
                      <button
                        key={event._id}
                        className="w-full rounded-md border border-white/10 bg-black/20 p-2 text-left"
                        onClick={() => toggleConfirmed({ eventId: event._id as never })}
                      >
                        <p className="font-medium">{event.title}</p>
                        <p className="text-muted-foreground">{formatClock(event.scheduledFor)}</p>
                        <div className="mt-1 flex gap-1">
                          <Badge variant="outline">{event.type}</Badge>
                          <Badge variant="secondary">{event.scheduledBy === "openclaw" ? "OpenClaw" : "Me"}</Badge>
                          {event.confirmed ? <Badge>Confirmed</Badge> : <Badge variant="outline">Pending</Badge>}
                        </div>
                      </button>
                    ))}
                    {dayItems.length === 0 ? <p className="text-muted-foreground">No entries</p> : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="month">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-base">{format(today, "MMMM yyyy")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-xs">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
                  <div key={label} className="px-1 py-2 text-muted-foreground">
                    {label}
                  </div>
                ))}

                {monthGrid.map((day) => {
                  const dayItems = events.filter((event) => isSameDay(new Date(event.scheduledFor), day));
                  const inCurrentMonth = isSameMonth(day, today);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[90px] rounded-md border p-2 ${
                        inCurrentMonth ? "border-white/10 bg-black/20" : "border-transparent bg-transparent"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className={`${inCurrentMonth ? "text-foreground" : "text-muted-foreground/60"}`}>{format(day, "d")}</span>
                        {dayItems.length ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300">
                            <CalendarCheck2 className="h-3 w-3" />
                            {dayItems.filter((item) => item.confirmed).length}/{dayItems.length}
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-1">
                        {dayItems.slice(0, 2).map((event) => (
                          <p key={event._id} className="truncate rounded bg-white/5 px-1 py-0.5 text-[10px]">
                            {formatClock(event.scheduledFor)} {event.title}
                          </p>
                        ))}
                        {dayItems.length > 2 ? <p className="text-[10px] text-muted-foreground">+{dayItems.length - 2} more</p> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
