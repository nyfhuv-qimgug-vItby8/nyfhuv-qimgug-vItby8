import OpenAI from "openai";
import { z } from "zod";
import { REFLECTION_SYSTEM_PROMPT } from "./prompt";
import type { ReflectionSummary } from "../types/domain";

const reflectionSchema = z.object({
  wins: z.array(z.string()),
  bottlenecks: z.array(z.string()),
  micro_actions: z.array(z.string()),
  tomorrow_one_thing: z.string(),
  risk_alerts: z.array(z.string()),
  focus_conditions: z.array(z.string())
});

export async function analyzeReflection(payload: object): Promise<ReflectionSummary> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  const response = await client.responses.create({
    model,
    input: [
      { role: "system", content: REFLECTION_SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(payload) }
    ]
  });

  const text = response.output_text;
  const parsed = reflectionSchema.safeParse(JSON.parse(text));
  if (!parsed.success) throw new Error("Invalid reflection schema from model");
  return parsed.data;
}
