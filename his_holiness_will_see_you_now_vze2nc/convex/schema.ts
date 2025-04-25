import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  messages: defineTable({
    body: v.string(),
    author: v.string(),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
