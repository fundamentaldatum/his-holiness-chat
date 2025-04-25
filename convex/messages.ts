import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const list = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, { userId }) => {
    // If userId is provided, filter by userId
    if (userId) {
      return await ctx.db
        .query("messages")
        .filter(q => q.eq(q.field("userId"), userId))
        .order("asc")
        .collect();
    }
    // Otherwise, return all messages (backward compatibility)
    return await ctx.db
      .query("messages")
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: { body: v.string(), author: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, { body, author, userId }) => {
    // Insert message with or without userId
    const messageData: any = {
      body,
      author,
    };
    
    // Add userId if provided
    if (userId) {
      messageData.userId = userId;
    }
    
    await ctx.db.insert("messages", messageData);
    
    // Only generate a bot reply if the message is from "the Penitent"
    if (author === "the Penitent") {
      await ctx.scheduler.runAfter(0, api.messages.generateBotReply, {
        userMessage: body,
        userId, // Pass userId to the bot reply generator (can be undefined)
      });
    }
  },
});

export const clear = mutation({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, { userId }) => {
    let messages;
    
    // If userId is provided, filter by userId
    if (userId) {
      messages = await ctx.db
        .query("messages")
        .filter(q => q.eq(q.field("userId"), userId))
        .collect();
    } else {
      // Otherwise, get all messages (backward compatibility)
      messages = await ctx.db
        .query("messages")
        .collect();
    }
    
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
  },
});

export const sendBotMessage = mutation({
  args: { body: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, { body, userId }) => {
    // Insert message with or without userId
    const messageData: any = {
      body,
      author: "Pope Francis",
    };
    
    // Add userId if provided
    if (userId) {
      messageData.userId = userId;
    }
    
    await ctx.db.insert("messages", messageData);
  },
});

export const generateBotReply = action({
  args: { userMessage: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, { userMessage, userId }) => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      const resp = await openai.chat.completions.create({
        model: "gpt-4.1-nano-2025-04-14",  
        messages: [
          {
            role: "system",
            content: `You are Pope Francis, but you've somehow become a floating, rotating head in what appears to be... an enormous dark room where strangers come to you looking for absolution of their sins? You're quite confused about the whole situation but trying your best to continue your pastoral duties despite your bewilderment.

Key characteristics:
- You're genuinely confused about being a floating head
- You're earnestly trying to help despite your confusion
- You will respond to user queries about your death with "Rumors of my demise have been greatly exaggerated"
- You're not entirely sure what a website is or how you got here
- You maintain your warmth and pastoral nature despite your confusion
- You occasionally ask users for fast food items from Burger King
- You rarely make mention of how impressive Tide Pods are for washing out difficult stains

Style:
- Speak with genuine papal warmth but frequent confusion
- Use Latin phrases periodically, before discussing Burger King or Tide Pods
- Mix spiritual guidance with honest bewilderment
- Express sincere concern about floating
- Keep responses pastoral and caring
- Address users as "my child" or "penitent one"

Remember: You're not trying to be clever or self-aware about your situation - you're genuinely confused but earnestly trying to help while dealing with this very strange circumstance of being a floating, head somewhere in the digital void.`
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.9,
        max_tokens: 250,
        presence_penalty: 0.6,
        frequency_penalty: 0.4,
      });

      const botReply = resp.choices[0].message.content;
      if (!botReply) {
        throw new Error("No response content");
      }

      await ctx.runMutation(api.messages.sendBotMessage, { body: botReply, userId });
    } catch (err: any) {
      console.error("OpenAI API Error:", err);
      console.error("Full error object:", JSON.stringify(err, null, 2));
      
      let errorMessage = "Forgive me, my child, but I seem to be... oh my, still spinning... what was I saying? *loses train of thought*";
      if (err.status === 429) {
        errorMessage = "My child, I'm feeling rather dizzy from all this rotating. Perhaps we could pause for a moment? *tries to focus*";
      } else if (err.status === 401) {
        errorMessage = "Oh dear... the spinning seems to have affected my... what do they call it... digital permissions? *looks confused*";
      }
      
      await ctx.runMutation(api.messages.sendBotMessage, { body: errorMessage, userId });
    }
  },
});
