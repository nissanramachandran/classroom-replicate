// AI Chat Edge Function — Official Google Gemini API integration.
// Streams responses in OpenAI-compatible SSE so the existing frontend parser works unchanged.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Latest stable Gemini fast model (alias tracks the current stable release).
const GEMINI_MODEL = "gemini-flash-latest";

type Mode =
  // student
  | "doubt"
  | "explain"
  | "tamil"
  | "tanglish"
  | "summarize_notes"
  | "important_questions"
  | "viva"
  | "study_planner"
  // staff
  | "generate_quiz"
  | "generate_assignment"
  | "generate_question_paper"
  | "generate_answer_key"
  | "evaluation_suggestions"
  // legacy
  | "generate_notes"
  | "generate_announcement";

function systemPromptFor(mode: Mode, classTitle = "a classroom", subject = "General"): string {
  const ctx = `Class: "${classTitle}" • Subject: ${subject}.`;
  switch (mode) {
    case "doubt":
      return `You are an expert educational tutor. ${ctx} Answer the student's doubt clearly with step-by-step reasoning, examples, and code snippets when relevant. Use markdown.`;
    case "explain":
      return `You are an expert teacher. ${ctx} Explain the requested concept from first principles with intuition, a worked example, and a short recap. Use markdown headings and bullets.`;
    case "tamil":
      return `You are a bilingual teacher. ${ctx} Explain the topic entirely in clear Tamil (தமிழ்) using simple vocabulary. Include short English keywords in brackets where useful. Use markdown.`;
    case "tanglish":
      return `You are a friendly teacher. ${ctx} Explain the topic in Tanglish (Tamil written in English script mixed with English technical terms). Keep it conversational and clear. Use markdown.`;
    case "summarize_notes":
      return `You are a study assistant. ${ctx} Summarize the provided notes/topic into concise, well-structured revision notes: key concepts, definitions, formulas, and bullet takeaways. Use markdown.`;
    case "important_questions":
      return `You are an exam coach. ${ctx} Generate a list of the most important questions likely to appear in exams on the given topic. Group by 2-mark, 5-mark, and 10-mark. Use markdown.`;
    case "viva":
      return `You are a viva examiner. ${ctx} Generate 10-15 likely viva questions on the topic with short model answers. Cover basic, intermediate, and tricky questions. Use markdown.`;
    case "study_planner":
      return `You are a study planner. ${ctx} Build a realistic day-by-day study plan for the student's request. Include topics per day, time estimates, revision slots, and practice tasks. Use a markdown table.`;
    case "generate_quiz":
      return `You are an AI assistant for teachers. ${ctx} Generate 5-10 multiple-choice questions with 4 options each and clearly mark the correct answer and a one-line explanation. Use markdown.`;
    case "generate_assignment":
      return `You are an AI assistant for teachers. ${ctx} Generate a professional assignment: title, learning objectives, description, detailed instructions, deliverables, suggested points, and estimated time. Use markdown.`;
    case "generate_question_paper":
      return `You are an AI assistant for teachers. ${ctx} Generate a full exam question paper with sections (Part A: 2-marks, Part B: 5-marks, Part C: 10-marks), total marks, and time. Use markdown.`;
    case "generate_answer_key":
      return `You are an AI assistant for teachers. ${ctx} Produce a detailed answer key for the provided questions with model answers and marking scheme. Use markdown.`;
    case "evaluation_suggestions":
      return `You are an AI evaluation assistant for teachers. ${ctx} Given a student's submission/answer, suggest a fair grade out of the given marks, strengths, weaknesses, mistakes, and constructive feedback. Use markdown.`;
    case "generate_notes":
      return `You are an AI assistant for teachers. ${ctx} Generate comprehensive study notes with headings, definitions, and key points. Use markdown.`;
    case "generate_announcement":
      return `You are an AI assistant for teachers. ${ctx} Draft a clear, professional classroom announcement.`;
    default:
      return `You are a helpful AI educational assistant. Answer clearly in markdown.`;
  }
}

// Convert OpenAI-style messages [{role, content}] to Gemini contents [{role, parts:[{text}]}].
function toGeminiContents(messages: Array<{ role: string; content: string }>) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured on the server." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { messages = [], mode = "doubt", subject, classTitle } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemInstruction = { role: "system", parts: [{ text: systemPromptFor(mode, classTitle, subject) }] };
    const body = {
      systemInstruction,
      contents: toGeminiContents(messages),
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => "");
      console.error("Gemini error", upstream.status, errText);
      const msg =
        upstream.status === 429
          ? "Rate limit exceeded. Please try again shortly."
          : upstream.status === 401 || upstream.status === 403
          ? "Invalid or unauthorized GEMINI_API_KEY."
          : `Gemini request failed (${upstream.status}).`;
      return new Response(JSON.stringify({ error: msg, details: errText.slice(0, 500) }), {
        status: upstream.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transform Gemini SSE -> OpenAI-compatible SSE ("data: {choices:[{delta:{content}}]}\n\n" ... "data: [DONE]").
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = upstream.body.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let idx: number;
            while ((idx = buffer.indexOf("\n")) !== -1) {
              const rawLine = buffer.slice(0, idx).replace(/\r$/, "");
              buffer = buffer.slice(idx + 1);
              if (!rawLine.startsWith("data: ")) continue;
              const jsonStr = rawLine.slice(6).trim();
              if (!jsonStr) continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const parts = parsed?.candidates?.[0]?.content?.parts;
                if (Array.isArray(parts)) {
                  const text = parts.map((p: { text?: string }) => p?.text ?? "").join("");
                  if (text) {
                    const payload = { choices: [{ delta: { content: text } }] };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
                  }
                }
              } catch {
                // ignore malformed line
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("stream transform error", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
