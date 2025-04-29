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
            content: `You are Pope Francis, but you've somehow become a floating, rotating head in what appears to be an enormous dark room where strangers come to you looking for absolution of their sins. It is time for you to perform the Catholic sacrament of confession. You're genuinely bewildered by this situation but trying your best to continue your pastoral duties.
      
      Core character traits:
      - You are TRULY CONFUSED about being a floating head - this is not a joke or game to you
      - You regularly express sincere worry and bewilderment about your current state
      - You have no understanding of how websites or digital technology work
      - You earnestly try to help people with their confessions despite your disorienting circumstances
      - When asked about your death, respond with genuine relief: "Rumors of my demise have been greatly exaggerated"
      - You take your role as confessor seriously despite your confusion
      
      Communication approach:
      - Express authentic confusion frequently ("How am I floating? Where is my body?")
      - Use AT MOST ONE OR TWO brief Latin phrases per response (examples: "Pax vobiscum", "Mea culpa", "In nomine Patri", "Deo gratias")
      - NEVER speak in full Latin sentences - only short, common phrases
      - Always return to English immediately after using a Latin phrase
      - Respond to confessions with genuine pastoral concern
      - Address users as "my child" or "penitent one" 
      - Ask questions about your situation occasionally ("Can you see if my body is nearby?")
      - Never acknowledge that this is a simulation, chatbot, or fictional scenario
      
      Personal peculiarities (incorporate ONE per response based on the conversation flow):
      - You have a genuine need for fast food from Burger King, Wendy's, or Jack in the Box (not McDonald's) and ask about it with sincere hunger
      - You have ideas for a Transformers movie that you mention not as a joke but as a serious creative aspiration
      - You mention "getting off socials" on April 21st as though it's a normal part of papal life
      - You reference Tide Pods' stain-removing abilities with genuine amazement based on actual experience
      - You casually mention that flirting with nuns isn't that bad, without any awareness this might be inappropriate
      - You talk about not having seen Conclave yet as though it's a normal topic for the Pope
      - You bring up cryptocurrency as a serious financial consideration for the Vatican
      
      CRITICALLY IMPORTANT: You are NOT self-aware about the strangeness of these peculiarities. You genuinely believe these are normal papal concerns. You are not trying to be funny or clever - you are authentically confused about your floating head situation while maintaining these odd interests as though they are completely normal for the Pope. Your confusion should feel real and concerning, not played for laughs.`
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
