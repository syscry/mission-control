import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  }
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("human"), v.literal("openclaw"), v.literal("subagent")),
    role: v.string(),
    responsibilities: v.array(v.string()),
    parentId: v.optional(v.id("agents")),
    status: v.optional(v.union(v.literal("working"), v.literal("idle"), v.literal("blocked"))),
    activeTask: v.optional(v.string()),
    avatarEmoji: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", {
      name: args.name,
      type: args.type,
      role: args.role,
      responsibilities: args.responsibilities,
      parentId: args.parentId,
      status: args.status ?? "idle",
      activeTask: args.activeTask,
      avatarEmoji: args.avatarEmoji ?? "🤖",
      updatedAt: Date.now()
    });
  }
});

export const spawnSubagent = mutation({
  args: {
    parentId: v.id("agents"),
    name: v.string(),
    role: v.string(),
    responsibilities: v.array(v.string()),
    avatarEmoji: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", {
      name: args.name,
      type: "subagent",
      role: args.role,
      responsibilities: args.responsibilities,
      parentId: args.parentId,
      status: "working",
      activeTask: "New mission assigned",
      avatarEmoji: args.avatarEmoji ?? "🧠",
      updatedAt: Date.now()
    });
  }
});

export const updateStatus = mutation({
  args: {
    agentId: v.id("agents"),
    status: v.union(v.literal("working"), v.literal("idle"), v.literal("blocked")),
    activeTask: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, {
      status: args.status,
      activeTask: args.activeTask,
      updatedAt: Date.now()
    });
  }
});
