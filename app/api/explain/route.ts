import { streamText } from "ai"

import {
  REFORMED_SYSTEM_PROMPT,
  buildExplainPrompt,
  localExplain,
} from "@/lib/explain"
import type { ExplainPayload } from "@/lib/types"

export const maxDuration = 60

export async function POST(request: Request) {
  const payload = (await request.json()) as ExplainPayload
  if (!payload?.ref || !payload?.pt) {
    return Response.json(
      { error: "Versículo inválido." },
      { status: 400 }
    )
  }

  const hasModelKey = Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN
  )

  if (!hasModelKey) {
    return new Response(localExplain(payload), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }

  try {
    const result = streamText({
      model: "openai/gpt-5.4",
      system: REFORMED_SYSTEM_PROMPT,
      prompt: buildExplainPrompt(payload),
    })
    return result.toTextStreamResponse()
  } catch {
    return new Response(localExplain(payload), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }
}
