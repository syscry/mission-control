import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    from: v.optional(v.number()),
    to: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("calendarItems").withIndex("by_scheduledFor").collect();

    if (typeof args.from === "number") {
      items = items.filter((item) => item.scheduledFor >= args.from!);
    }
    if (typeof args.to === "number") {
      items = items.filter((item) => item.scheduledFor <= args.to!);
    }

    return items.sort((a, b) => a.scheduledFor - b.scheduledFor);
  }
});

export const create = mutation({
  args: {
    title: v.string(),
    type: v.union(v.literal("cron"), v.literal("task")),
    scheduledFor: v.number(),
    durationMinutes: v.optional(v.number()),
    cronExpression: v.optional(v.string()),
    scheduledBy: v.union(v.literal("me"), v.literal("openclaw"))
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("calendarItems", {
      ...args,
      confirmed: true,
      createdAt: now,
      updatedAt: now
    });
  }
});

export const toggleConfirmed = mutation({
  args: { eventId: v.id("calendarItems") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      return;
    }

    await ctx.db.patch(args.eventId, {
      confirmed: !event.confirmed,
      updatedAt: Date.now()
    });
  }
});

export const remove = mutation({
  args: { eventId: v.id("calendarItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.eventId);
  }
});
