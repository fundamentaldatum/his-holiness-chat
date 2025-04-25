import { query } from "./_generated/server";

// No authentication needed, so these are not used anymore.
export const loggedInUser = query({
  handler: async () => null,
});

export const users = query({
  handler: async () => [],
});
