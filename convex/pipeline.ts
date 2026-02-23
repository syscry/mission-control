import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const stageOrder = ["idea", "script", "thumbnail", "filming"] as const;

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("contentItems").collect();
    return items.sort((a, b) => {
      if (a.stage !== b.stage) {
        return stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
      }
      return b.updatedAt - a.updatedAt;
    });
  }
});

export const create = mutation({
  args: {
    title: v.string(),
    owner: v.union(v.literal("me"), v.literal("openclaw")),
    notes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("contentItems", {
      title: args.title,
      owner: args.owner,
      stage: "idea",
      notes: args.notes,
      createdAt: now,
      updatedAt: now
    });
  }
});

export const moveStage = mutation({
  args: {
    contentId: v.id("contentItems"),
    stage: v.union(v.literal("idea"), v.literal("script"), v.literal("thumbnail"), v.literal("filming"))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.contentId, {
      stage: args.stage,
      updatedAt: Date.now()
    });
  }
});

export const updateAssets = mutation({
  args: {
    contentId: v.id("contentItems"),
    scriptText: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    notes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.contentId, {
      scriptText: args.scriptText,
      imageUrl: args.imageUrl,
      thumbnailUrl: args.thumbnailUrl,
      notes: args.notes,
      updatedAt: Date.now()
    });
  }
});

export const remove = mutation({
  args: {
    contentId: v.id("contentItems")
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.contentId);
  }
});

export const openclawAdvance = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("contentItems").withIndex("by_owner", (q) => q.eq("owner", "openclaw")).collect();
    const target = items.sort((a, b) => a.updatedAt - b.updatedAt)[0];

    if (!target) {
      return null;
    }

    const current = stageOrder.indexOf(target.stage);
    const next = stageOrder[Math.min(current + 1, stageOrder.length - 1)];

    await ctx.db.patch(target._id, {
      stage: next,
      updatedAt: Date.now()
    });

    return { contentId: target._id, stage: next };
  }
});
