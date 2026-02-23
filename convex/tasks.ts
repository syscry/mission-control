import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const statusOrder = ["todo", "inProgress", "done"] as const;

export const list = query({
  args: {
    assignee: v.optional(v.union(v.literal("me"), v.literal("openclaw")))
  },
  handler: async (ctx, args) => {
    const tasks = args.assignee
      ? await ctx.db.query("tasks").withIndex("by_assignee", (q) => q.eq("assignee", args.assignee!)).collect()
      : await ctx.db.query("tasks").collect();

    return tasks.sort((a, b) => {
      if (a.status !== b.status) {
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      }
      return b.updatedAt - a.updatedAt;
    });
  }
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    assignee: v.union(v.literal("me"), v.literal("openclaw")),
    dueDate: v.optional(v.number()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high")))
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      assignee: args.assignee,
      dueDate: args.dueDate,
      priority: args.priority ?? "medium",
      status: "todo",
      createdAt: now,
      updatedAt: now
    });
  }
});

export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("todo"), v.literal("inProgress"), v.literal("done"))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: Date.now()
    });
  }
});

export const updateAssignee = mutation({
  args: {
    taskId: v.id("tasks"),
    assignee: v.union(v.literal("me"), v.literal("openclaw"))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      assignee: args.assignee,
      updatedAt: Date.now()
    });
  }
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  }
});

export const openclawAdvance = mutation({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").withIndex("by_assignee", (q) => q.eq("assignee", "openclaw")).collect();
    const target = tasks
      .filter((task) => task.status !== "done")
      .sort((a, b) => a.updatedAt - b.updatedAt)[0];

    if (!target) {
      return null;
    }

    const current = statusOrder.indexOf(target.status);
    const nextStatus = statusOrder[Math.min(current + 1, statusOrder.length - 1)];
    await ctx.db.patch(target._id, { status: nextStatus, updatedAt: Date.now() });
    return { taskId: target._id, status: nextStatus };
  }
});
