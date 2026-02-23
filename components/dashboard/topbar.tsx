"use client";

import { Clock4, DatabaseZap, Wifi } from "lucide-react";
import { useMemo } from "react";

export function TopBar() {
  const now = useMemo(() => new Date(), []);

  return (
    <header className="glass sticky top-0 z-20 border-b border-white/10 px-4 py-3 md:px-6 md:py-4 hidden md:block">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">OpenClaw Operating Layer</p>
          <p className="text-sm text-foreground/90">Realtime mission orchestration</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-300">
            <Wifi className="h-3 w-3" />
            Live Sync
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1">
            <DatabaseZap className="h-3 w-3" />
            Convex
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1">
            <Clock4 className="h-3 w-3" />
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </header>
  );
}
