import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  messages: defineTable({
    body: v.string(),
    author: v.string(),
    userId: v.optional(v.string()), // Make userId optional for backward compatibility
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
