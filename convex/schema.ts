import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("inProgress"), v.literal("done")),
    assignee: v.union(v.literal("me"), v.literal("openclaw")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"])
    .index("by_dueDate", ["dueDate"]),

  contentItems: defineTable({
    title: v.string(),
    owner: v.union(v.literal("me"), v.literal("openclaw")),
    stage: v.union(v.literal("idea"), v.literal("script"), v.literal("thumbnail"), v.literal("filming")),
    scriptText: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_stage", ["stage"])
    .index("by_owner", ["owner"]),

  calendarItems: defineTable({
    title: v.string(),
    type: v.union(v.literal("cron"), v.literal("task")),
    scheduledFor: v.number(),
    durationMinutes: v.optional(v.number()),
    cronExpression: v.optional(v.string()),
    scheduledBy: v.union(v.literal("me"), v.literal("openclaw")),
    confirmed: v.boolean(),
    linkedTaskId: v.optional(v.id("tasks")),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_scheduledFor", ["scheduledFor"])
    .index("by_type", ["type"]),

  agents: defineTable({
    name: v.string(),
    type: v.union(v.literal("human"), v.literal("openclaw"), v.literal("subagent")),
    role: v.string(),
    responsibilities: v.array(v.string()),
    parentId: v.optional(v.id("agents")),
    status: v.union(v.literal("working"), v.literal("idle"), v.literal("blocked")),
    activeTask: v.optional(v.string()),
    avatarEmoji: v.string(),
    updatedAt: v.number()
  }).index("by_parent", ["parentId"])
});
