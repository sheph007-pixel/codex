import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

// Use Anthropic by default, fall back to OpenAI if no Anthropic key
function getModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic("claude-sonnet-4-20250514");
  }
  return openai("gpt-4o-mini");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, contact, activities, company } = body;

    if (action === "summarize") {
      const activityList =
        activities
          ?.slice(0, 20)
          .map(
            (a: { type: string; title: string; occurred_at: string }) =>
              `- [${a.type}] ${a.title} (${new Date(a.occurred_at).toLocaleDateString()})`
          )
          .join("\n") || "No activities recorded.";

      const { text } = await generateText({
        model: getModel(),
        system:
          "You are a CRM assistant. Provide concise, actionable summaries of contact relationships. Focus on engagement level, recent activity patterns, and suggested next steps. Keep it under 100 words.",
        prompt: `Summarize this contact relationship:

Contact: ${contact.name || contact.email}
Email: ${contact.email}
Company: ${contact.company?.company_name || contact.company?.domain || "Unknown"}
Type: ${contact.company?.company_type || "Unknown"}
Emails sent: ${contact.sent_count}, received: ${contact.received_count}
Last active: ${contact.last_activity_date || "Unknown"}

Recent activities:
${activityList}`,
      });

      return NextResponse.json({ summary: text });
    }

    if (action === "enrich") {
      const { text } = await generateText({
        model: getModel(),
        system:
          "You are a lead enrichment assistant. Given a company domain and any known info, suggest likely industry, company size category, and relevant notes. Return as JSON with keys: industry, size, notes. Be concise.",
        prompt: `Enrich this lead:
Domain: ${company?.domain}
Company name: ${company?.company_name || "Unknown"}
Known type: ${company?.company_type || "Unknown"}`,
      });

      try {
        const enrichment = JSON.parse(text);
        return NextResponse.json({ enrichment });
      } catch {
        return NextResponse.json({ enrichment: { notes: text } });
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
