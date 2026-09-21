import { gateway, streamText } from "ai"

import {
  EXPLAIN_FALLBACK_MODELS,
  EXPLAIN_MODEL,
  REFORMED_SYSTEM_PROMPT,
  buildExplainPrompt,
  localExplain,
  shouldUseGateway,
} from "@/lib/explain"
import type { ExplainPayload } from "@/lib/types"

export const maxDuration = 60

const PLAIN = { headers: { "Content-Type": "text/plain; charset=utf-8" } }

export async function POST(request: Request) {
  const payload = (await request.json()) as ExplainPayload
  if (!payload?.ref || !payload?.pt) {
    return Response.json(
      { error: "Versículo inválido." },
      { status: 400 }
    )
  }

  if (!shouldUseGateway()) {
    return new Response(localExplain(payload), PLAIN)
  }

  try {
    const result = streamText({
      model: gateway(EXPLAIN_MODEL),
      system: REFORMED_SYSTEM_PROMPT,
      prompt: buildExplainPrompt(payload),
      maxOutputTokens: 900,
      providerOptions: {
        gateway: {
          models: [...EXPLAIN_FALLBACK_MODELS],
        },
      },
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let sent = false
        try {
          for await (const chunk of result.textStream) {
            if (!chunk) continue
            sent = true
            controller.enqueue(encoder.encode(chunk))
          }
        } catch {
          // Gateway 402/403/429 land here; keep a Reformed outline.
        }
        if (!sent) {
          controller.enqueue(encoder.encode(localExplain(payload)))
        }
        controller.close()
      },
    })

    return new Response(stream, PLAIN)
  } catch {
    return new Response(localExplain(payload), PLAIN)
  }
}
