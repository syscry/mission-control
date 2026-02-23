import { mutation, query } from "./_generated/server";

export const isSeeded = query({
  args: {},
  handler: async (ctx) => {
    const [task, content, event, agent] = await Promise.all([
      ctx.db.query("tasks").first(),
      ctx.db.query("contentItems").first(),
      ctx.db.query("calendarItems").first(),
      ctx.db.query("agents").first()
    ]);

    return Boolean(task || content || event || agent);
  }
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const existing = await ctx.db.query("tasks").first();
    if (existing) {
      return { seeded: false, reason: "Database already contains data." };
    }

    await Promise.all([
      ctx.db.insert("tasks", {
        title: "Finalize creator analytics dashboard",
        description: "Wire metrics cards and anomaly alerts.",
        status: "inProgress",
        assignee: "me",
        priority: "high",
        dueDate: now + 1000 * 60 * 60 * 24,
        createdAt: now,
        updatedAt: now
      }),
      ctx.db.insert("tasks", {
        title: "Generate transcript summaries",
        description: "OpenClaw should summarize 8 long episodes.",
        status: "todo",
        assignee: "openclaw",
        priority: "medium",
        dueDate: now + 1000 * 60 * 60 * 5,
        createdAt: now,
        updatedAt: now
      }),
      ctx.db.insert("tasks", {
        title: "Publish shorts to all channels",
        description: "Bundle with UTM tracking and scheduling.",
        status: "done",
        assignee: "openclaw",
        priority: "low",
        dueDate: now - 1000 * 60 * 60 * 4,
        createdAt: now - 1000 * 60 * 60 * 12,
        updatedAt: now - 1000 * 60 * 60 * 2
      })
    ]);

    await Promise.all([
      ctx.db.insert("contentItems", {
        title: "Can AI agents run a startup?",
        owner: "me",
        stage: "script",
        scriptText: "Hook: two agents, one startup, seven days.",
        notes: "Need competitor examples",
        createdAt: now,
        updatedAt: now
      }),
      ctx.db.insert("contentItems", {
        title: "OpenClaw productivity workflow",
        owner: "openclaw",
        stage: "thumbnail",
        scriptText: "3-step walkthrough with before/after timelines.",
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
        thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
        createdAt: now,
        updatedAt: now
      }),
      ctx.db.insert("contentItems", {
        title: "Daily standup automation",
        owner: "openclaw",
        stage: "idea",
        notes: "Keep under 4 minutes",
        createdAt: now,
        updatedAt: now
      })
    ]);

    await Promise.all([
      ctx.db.insert("calendarItems", {
        title: "Cron: Pull new analytics",
        type: "cron",
        cronExpression: "0 * * * *",
        scheduledFor: now + 1000 * 60 * 20,
        scheduledBy: "openclaw",
        confirmed: true,
        durationMinutes: 5,
        createdAt: now,
        updatedAt: now
      }),
      ctx.db.insert("calendarItems", {
        title: "Record AI startup episode",
        type: "task",
        scheduledFor: now + 1000 * 60 * 60 * 24,
        durationMinutes: 60,
        scheduledBy: "me",
        confirmed: true,
        createdAt: now,
        updatedAt: now
      }),
      ctx.db.insert("calendarItems", {
        title: "Cron: Auto-publish approved reels",
        type: "cron",
        cronExpression: "0 */6 * * *",
        scheduledFor: now + 1000 * 60 * 60 * 6,
        scheduledBy: "openclaw",
        confirmed: true,
        durationMinutes: 10,
        createdAt: now,
        updatedAt: now
      })
    ]);

    const meId = await ctx.db.insert("agents", {
      name: "You",
      type: "human",
      role: "Mission Commander",
      responsibilities: ["Approvals", "Strategy", "Publishing decisions"],
      status: "working",
      activeTask: "Reviewing automation queue",
      avatarEmoji: "🧑‍🚀",
      updatedAt: now
    });

    const openclawId = await ctx.db.insert("agents", {
      name: "OpenClaw",
      type: "openclaw",
      role: "Chief Automation Agent",
      responsibilities: ["Scheduling", "Execution", "Context management"],
      parentId: meId,
      status: "working",
      activeTask: "Running content pipeline",
      avatarEmoji: "🤖",
      updatedAt: now
    });

    await Promise.all([
      ctx.db.insert("agents", {
        name: "Codewright",
        type: "subagent",
        role: "Developer Subagent",
        responsibilities: ["Shipping features", "Bug triage"],
        parentId: openclawId,
        status: "working",
        activeTask: "Implementing Convex mutation",
        avatarEmoji: "👨‍💻",
        updatedAt: now
      }),
      ctx.db.insert("agents", {
        name: "Storyforge",
        type: "subagent",
        role: "Writer Subagent",
        responsibilities: ["Scripts", "Hooks", "CTA optimization"],
        parentId: openclawId,
        status: "idle",
        activeTask: "Awaiting script brief",
        avatarEmoji: "✍️",
        updatedAt: now
      }),
      ctx.db.insert("agents", {
        name: "Framepilot",
        type: "subagent",
        role: "Designer Subagent",
        responsibilities: ["Thumbnail concepts", "Visual QA"],
        parentId: openclawId,
        status: "blocked",
        activeTask: "Waiting for brand assets",
        avatarEmoji: "🎨",
        updatedAt: now
      })
    ]);

    return { seeded: true };
  }
});
