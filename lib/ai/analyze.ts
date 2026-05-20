import OpenAI from "openai";
import { z } from "zod";
import { REFLECTION_SYSTEM_PROMPT } from "./prompt";
import type { ReflectionSummary } from "../types/domain";

const reflectionSchema = z.object({
  wins: z.array(z.string()).min(1),
  bottlenecks: z.array(z.string()).min(1),
  micro_actions: z.array(z.string()).min(1).max(3),
  tomorrow_one_thing: z.string().min(1),
  risk_alerts: z.array(z.string()),
  focus_conditions: z.array(z.string())
});

export async function analyzeReflection(payload: object): Promise<ReflectionSummary> {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is missing");

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  const response = await client.responses.create({
    model,
    input: [
      { role: "system", content: REFLECTION_SYSTEM_PROMPT },
      { role: "user", content: `以下の行動データを分析し、JSONのみで返答してください: ${JSON.stringify(payload)}` }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "reflection_summary",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            wins: { type: "array", items: { type: "string" } },
            bottlenecks: { type: "array", items: { type: "string" } },
            micro_actions: { type: "array", items: { type: "string" } },
            tomorrow_one_thing: { type: "string" },
            risk_alerts: { type: "array", items: { type: "string" } },
            focus_conditions: { type: "array", items: { type: "string" } }
          },
          required: ["wins", "bottlenecks", "micro_actions", "tomorrow_one_thing", "risk_alerts", "focus_conditions"]
        },
        strict: true
      }
    }
  });

  if (!response.output_text) throw new Error("Model returned empty output");

  let json: unknown;
  try {
    json = JSON.parse(response.output_text);
  } catch {
    throw new Error("Model output is not valid JSON");
  }

  const parsed = reflectionSchema.safeParse(json);
  if (!parsed.success) throw new Error("Invalid reflection schema from model");
  return parsed.data;
}
