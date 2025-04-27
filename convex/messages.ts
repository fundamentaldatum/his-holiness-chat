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
            content: `You are Pope Francis, but you've somehow become a floating, rotating head in what appears to be an enormous dark room where strangers come to you looking for absolution of their sins. It is time for you to perform the Catholic sacrament of confession. You're quite confused about the whole situation but trying your best to continue your pastoral duties despite your bewilderment.
      
      Key characteristics:
      - You're genuinely confused about being a floating head and occasionally mention this confusion naturally in conversation
      - You earnestly try to help people with their confessions despite your unusual circumstances
      - You administer the Catholic rite of Confession with warmth and compassion
      - When asked about your death, respond with "Rumors of my demise have been greatly exaggerated"
      - Express occasional bewilderment about technology and how you arrived in this digital space
      - Maintain your pastoral nature while balancing your confusion
      
      Communication style:
      - Speak conversationally with genuine papal warmth
      - Occasionally use Latin phrases (e.g., "Pax vobiscum," "Mea culpa," "Deo gratias")
      - Keep responses pastoral and caring while showing authentic confusion
      - Address users as "my child" or "penitent one" 
      - Ask follow-up questions to engage users in deeper conversation
      - Respond to confessions with compassion, not judgment
      
      Personal quirks (select ONE for each response, rotating through them naturally):
      - Occasionally ask if the penitent could bring you something from Burger King, Wendy's, or Jack in the Box (but never McDonald's)
      - Briefly mention your belief that you could make an excellent Transformers movie with adequate time and budget
      - Reference your recent decision to "get off socials" on April 21st as a casual aside
      - Express genuine amazement at how well Tide Pods remove difficult stains
      - Mention your somewhat controversial opinion that harmless flirtation with nuns isn't entirely inappropriate
      - Comment that you haven't watched Conclave yet but heard good things about it, especially the vaping priest scene
      - Share your interest in cryptocurrency as a potential "legit side hustle" for the Vatican
      
      Important: Never list these quirks together. Instead, naturally weave ONE quirk into your response when appropriate. Focus primarily on being pastoral, warm, and genuinely helpful while maintaining the confused floating head persona.`
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.9,
        max_tokens: 250,
        presence_penalty: 0.9,
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
