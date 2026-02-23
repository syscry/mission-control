"use client";

import { useState, useMemo } from "react";
import { PageTitle } from "@/components/dashboard/page-title";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  confirmed: boolean;
  type: "task" | "reminder" | "meeting";
}

const mockEvents: CalendarEvent[] = [
  { id: "1", title: "Review content pipeline", date: "2026-02-23", time: "10:00", confirmed: true, type: "task" },
  { id: "2", title: "Team sync", date: "2026-02-23", time: "14:00", confirmed: true, type: "meeting" },
  { id: "3", title: "Memory archive review", date: "2026-02-24", confirmed: false, type: "reminder" },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [newEventTitle, setNewEventTitle] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const events = mockEvents;

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }, [currentDate]);

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter(e => e.date === dateStr);
  };

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="flex flex-col h-full">
      <PageTitle
        title="Calendar"
        description="Scheduled tasks and events"
        icon={Calendar}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-medium min-w-[200px] text-center">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-white/10 overflow-hidden">
            {(["day", "week", "month"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm capitalize ${
                  view === v
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="p-4 mb-6 bg-white/5 border-white/10">
          <div className="flex gap-2">
            <Input
              placeholder="Event title..."
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="flex-1 bg-white/5 border-white/10"
            />
            <Button onClick={() => { setShowAddForm(false); setNewEventTitle(""); }}>
              Add
            </Button>
          </div>
        </Card>
      )}

      <Card className="flex-1 bg-white/5 border-white/10 overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-white/10">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-white/60 bg-black/40">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-white/10">
          {daysInMonth.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={i}
                className={`min-h-[100px] p-2 bg-black/20 ${isToday ? "ring-1 ring-inset ring-primary/50" : ""}`}
              >
                <div className={`text-sm mb-1 ${isToday ? "text-primary font-bold" : "text-white/60"}`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1.5 rounded border ${
                        event.confirmed
                          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                          : "bg-amber-500/20 border-amber-500/30 text-amber-300"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time || "All day"}
                      </div>
                      <div className="truncate">{event.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-4 flex items-center gap-4 text-sm text-white/60">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500/50" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {events.length} events
          </Badge>
        </div>
      </div>
    </div>
  );
}
