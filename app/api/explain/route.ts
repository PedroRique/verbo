import { createGateway, streamText } from "ai"
import { headers } from "next/headers"

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

const PLAIN = { "Content-Type": "text/plain; charset=utf-8" }

export async function POST(request: Request) {
  const payload = (await request.json()) as ExplainPayload
  if (!payload?.ref || !payload?.pt) {
    return Response.json(
      { error: "Versículo inválido." },
      { status: 400 }
    )
  }

  const apiKey = await gatewayKey()
  if (!shouldUseGateway() && !apiKey) {
    return new Response(localExplain(payload), { headers: PLAIN })
  }

  try {
    const gateway = createGateway(apiKey ? { apiKey } : {})
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
    const iterator = result.fullStream[Symbol.asyncIterator]()
    let first = await iterator.next()
    while (
      !first.done &&
      first.value.type !== "text-delta" &&
      first.value.type !== "error"
    ) {
      first = await iterator.next()
    }

    if (first.done || first.value.type !== "text-delta") {
      const err =
        !first.done && first.value.type === "error"
          ? first.value.error
          : undefined
      console.error("explain gateway", err)
      return fallbackResponse(payload, err)
    }

    const opening = first.value.text
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(opening))
        try {
          while (true) {
            const next = await iterator.next()
            if (next.done) break
            if (next.value.type === "text-delta" && next.value.text) {
              controller.enqueue(encoder.encode(next.value.text))
            }
            if (next.value.type === "error") {
              console.error("explain stream", next.value.error)
              break
            }
          }
        } catch (error) {
          console.error("explain stream", error)
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: { ...PLAIN, "x-explain-source": "gemini" },
    })
  } catch (error) {
    console.error("explain gateway", error)
    return fallbackResponse(payload, error)
  }
}

async function gatewayKey() {
  const requestHeaders = await headers()
  return (
    process.env.AI_GATEWAY_API_KEY ||
    requestHeaders.get("x-vercel-oidc-token") ||
    process.env.VERCEL_OIDC_TOKEN ||
    ""
  )
}

function fallbackResponse(payload: ExplainPayload, error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "")
  const hint = gatewayHint(message)
  const body = hint ? `${hint}\n\n${localExplain(payload)}` : localExplain(payload)
  return new Response(body, {
    headers: {
      ...PLAIN,
      "x-explain-source": "local",
      "x-explain-error": message.replace(/[\r\n]+/g, " ").slice(0, 240),
    },
  })
}

function gatewayHint(message: string) {
  if (/verification|payment method|customer_verification/i.test(message)) {
    return "_A IA grátis da Vercel pede um cartão cadastrado só para liberar os US$ 5/mês do Hobby. Nada é cobrado se você ficar nesse crédito. Abra [AI Gateway](https://vercel.com/ai-gateway)._"
  }
  if (/authentication|OIDC|API key|No authentication/i.test(message)) {
    return "_O AI Gateway ainda não autenticou este deploy. No painel da Vercel: AI Gateway → API Keys, crie uma chave e coloque em `AI_GATEWAY_API_KEY`._"
  }
  if (/restricted|free tier|not available on the free/i.test(message)) {
    return "_Este modelo saiu do catálogo grátis. O app cai no esboço local até o Gateway aceitar o Gemini Flash Lite._"
  }
  return ""
}
