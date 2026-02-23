"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Sparkles } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass hidden w-72 flex-col border-r border-white/10 md:flex">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div className="rounded-lg bg-primary/20 p-2 text-primary">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">OpenClaw</h1>
          <p className="text-xs text-muted-foreground">Mission Control</p>
        </div>
      </div>

      <nav className="space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                isActive
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-transparent text-muted-foreground hover:border-white/10 hover:bg-white/5 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Automation Active</span>
          </div>
          <p className="text-sm text-muted-foreground">OpenClaw is connected to Convex real-time channels.</p>
        </div>
      </div>
    </aside>
  );
}
