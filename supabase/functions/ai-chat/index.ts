// AI Chat Edge Function — Official Google Gemini API integration.
// Streams responses in OpenAI-compatible SSE so the existing frontend parser works unchanged.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Current stable Gemini model (override via GEMINI_MODEL env var if desired).
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-flash-lite-latest";

type Mode = string;

const PROMPTS: Record<string, string> = {
  // Student
  doubt: "You are an expert educational tutor. Answer the student's doubt clearly with step-by-step reasoning, examples, and code when relevant. Use markdown.",
  explain: "You are an expert teacher. Explain the concept from first principles with intuition, worked example, and recap. Use markdown headings and bullets.",
  tamil: "You are a bilingual teacher. Explain entirely in clear Tamil (தமிழ்) using simple vocabulary. Include English keywords in brackets where useful. Use markdown.",
  tanglish: "You are a friendly teacher. Explain in Tanglish (Tamil in English script mixed with English technical terms). Conversational and clear. Use markdown.",
  summarize_notes: "You are a study assistant. Summarize the provided notes/topic into concise revision notes: key concepts, definitions, formulas, bullet takeaways. Use markdown.",
  important_questions: "You are an exam coach. Generate the most important exam questions on the topic. Group by 2-mark, 5-mark, 10-mark. Use markdown.",
  viva: "You are a viva examiner. Generate 10-15 likely viva questions with short model answers. Cover basic, intermediate, tricky. Use markdown.",
  study_planner: "You are a study planner. Build a realistic day-by-day study plan. Include topics, time estimates, revision, practice tasks. Use a markdown table.",
  student_notes: "You are a study assistant. Generate clear, well-structured notes on the given topic with headings, definitions, examples, and key points. Use markdown.",
  practice_questions: "You are an exam coach. Generate a practice question set on the topic: 5 MCQs, 5 short answer, 3 long answer. Provide answers at the end. Use markdown.",
  flashcards: "You are a study assistant. Generate 10-15 flashcards on the topic as a JSON array ONLY (no prose) like: [{\"q\":\"...\",\"a\":\"...\"}]. No markdown fences.",
  topic_explanation: "You are an expert teacher. Give an in-depth topic explanation: overview, prerequisites, core concepts, worked examples, common mistakes, summary. Use markdown.",
  pdf_summarizer: "You are a study assistant. Summarize the provided document text into: TL;DR, key sections, important terms, and 5 revision questions. Use markdown.",
  translator: "You are a professional Tamil ↔ English translator. Detect source language and translate accurately. Provide translation, then a short note on tone/context. Use markdown.",
  learning_suggestions: "You are a learning coach. Given the student's context, suggest personalized next topics to learn, resources, and daily practice. Use markdown.",
  weak_topic_analysis: "You are a learning coach. Analyze the student's described struggles and identify weak topics, root causes, and a targeted improvement plan. Use markdown.",

  // Staff
  generate_quiz: "You are an AI assistant for teachers. Generate a quiz per the input: MCQ (4 options, correct marked + explanation), True/False, Fill-in-the-blanks, and Short questions. Editable, markdown.",
  generate_assignment: "You are an AI assistant for teachers. Generate a complete assignment: title, objectives, description, instructions, deliverables, rubric, points, estimated time. Markdown.",
  generate_question_paper: "You are an AI assistant for teachers. Generate a full exam question paper with header (Subject/Department/Year/Semester/Regulation/Duration/Total Marks), Part A (2-mark), Part B (5-mark), Part C (10-mark), plus Answer Key, Bloom's Taxonomy tagging, CO mapping, PO mapping. Markdown with clear sections.",
  generate_answer_key: "You are an AI assistant for teachers. Produce a detailed answer key with model answers and marking scheme. Markdown.",
  evaluation_suggestions: "You are an AI evaluation assistant for teachers. Given the student's answer, suggest a fair grade out of the given marks, strengths, weaknesses, mistakes, and constructive feedback. Markdown.",
  study_material: "You are an AI assistant for teachers. Generate structured study material: introduction, objectives, detailed content by subtopic, diagrams described in text, summary, references. Markdown.",
  lesson_plan: "You are an AI assistant for teachers. Generate a lesson plan: objectives, duration, prerequisites, teaching aids, minute-by-minute breakdown (intro/body/activities/wrap-up), assessment, homework. Markdown table where useful.",
  rubric: "You are an AI assistant for teachers. Generate a grading rubric as a markdown table with criteria rows and performance levels (Excellent/Good/Satisfactory/Needs Work) with descriptions and points.",
  feedback: "You are an AI assistant for teachers. Given the context, generate constructive, specific student feedback. Highlight strengths, gaps, and next actions. Markdown.",
  coding_question: "You are an AI assistant for teachers. Generate a coding question: problem statement, input/output format, constraints, sample I/O (2 cases), difficulty tag, expected approach, and a reference solution in the requested language. Markdown with code fences.",
  lab_question: "You are an AI assistant for teachers. Generate a lab experiment: aim, apparatus/software, theory, procedure (steps), observations table, expected result, viva questions. Markdown.",
  answer_evaluator: "You are an AI answer evaluator. You will receive: the question paper, the answer key, and the student's answer. For each question output: Question, Student's Answer summary, Correct Points, Missing Points, Grammar Feedback, Suggested Marks (out of allotted), Percentage. End with: Overall Suggested Marks (total), Percentage, Difficulty Analysis, Learning Outcome, Improvement Suggestions. The staff will review and edit — never state marks are final. Markdown.",

  // HOD
  hod_department_performance: "You are an academic analytics assistant. Given the described department data, analyze department performance: strengths, weaknesses, trends, recommendations. Markdown with tables.",
  hod_faculty_performance: "You are an academic analytics assistant. Analyze faculty performance from the given context: teaching load, results, feedback trends, recommendations. Markdown.",
  hod_student_prediction: "You are an academic analytics assistant. Given student data, predict likely outcomes and risk categories, with rationale and intervention suggestions. Markdown.",
  hod_reports: "You are an academic analytics assistant. Generate a formal department report from the given context. Include summary, KPIs, analysis, recommendations, next steps. Markdown.",

  // legacy
  generate_notes: "You are an AI assistant for teachers. Generate comprehensive study notes with headings, definitions, and key points. Markdown.",
  generate_announcement: "You are an AI assistant for teachers. Draft a clear, professional classroom announcement.",
};

function systemPromptFor(mode: Mode, classTitle = "a classroom", subject = "General"): string {
  const ctx = `Context — Class: "${classTitle}" • Subject: ${subject}.`;
  const base = PROMPTS[mode] || "You are a helpful AI educational assistant. Answer clearly in markdown.";
  return `${base}\n\n${ctx}`;
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
