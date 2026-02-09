// AI Chat Edge Function - Handles both student doubt solving and staff AI tools
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode, subject, classTitle } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Different system prompts based on mode
    let systemPrompt = "";
    
    switch (mode) {
      case "doubt":
        systemPrompt = `You are an expert educational AI tutor for "${classTitle || "a classroom"}" (Subject: ${subject || "General"}). 
Help students understand concepts clearly. Provide:
- Clear, step-by-step explanations
- Examples and analogies
- Code snippets when relevant (with syntax highlighting hints)
- Encourage critical thinking
Keep responses concise but thorough. Use markdown formatting.`;
        break;
      
      case "generate_assignment":
        systemPrompt = `You are an AI assistant for teachers. Generate a professional assignment for "${classTitle}" (Subject: ${subject}).
Include: title, description, detailed instructions, suggested points, and estimated time.
Format with clear markdown headings.`;
        break;
      
      case "generate_quiz":
        systemPrompt = `You are an AI assistant for teachers. Generate quiz questions for "${classTitle}" (Subject: ${subject}).
Create 5-10 multiple choice questions with 4 options each. Mark the correct answer.
Format cleanly with markdown.`;
        break;
      
      case "generate_notes":
        systemPrompt = `You are an AI assistant for teachers. Generate a comprehensive notes summary for "${classTitle}" (Subject: ${subject}).
Create well-structured study notes with key concepts, definitions, and important points.
Use markdown headings, bullet points, and bold for key terms.`;
        break;
      
      case "generate_announcement":
        systemPrompt = `You are an AI assistant for teachers. Generate a professional classroom announcement for "${classTitle}".
Keep it clear, formal yet friendly. Include relevant details.`;
        break;
      
      default:
        systemPrompt = "You are a helpful AI educational assistant. Answer questions clearly and concisely using markdown.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
