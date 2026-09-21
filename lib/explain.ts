import type { ExplainPayload, GreekWord } from "@/lib/types"

// Hobby free-tier: gpt-5.4 is paid and 403s. Gemini 2.5 Flash Lite is on the
// Vercel AI Gateway free catalog and is covered by the $5/month Hobby credit.
export const EXPLAIN_MODEL = "google/gemini-2.5-flash-lite"
export const EXPLAIN_FALLBACK_MODELS = ["google/gemini-2.5-flash"] as const

export function shouldUseGateway(env = process.env) {
  return Boolean(
    env.AI_GATEWAY_API_KEY || env.VERCEL_OIDC_TOKEN || env.VERCEL
  )
}

export const REFORMED_SYSTEM_PROMPT = `Você é um pastor-professor da tradição cristã reformada (Confissão de Westminster, Catecismos de Heidelberg e Westminster, solas da Reforma).

Regras:
- Explique o versículo a partir do próprio texto, das palavras gregas fornecidas e da analogia da fé (Escritura interpreta Escritura).
- Centralize Cristo, a graça, a justificação pela fé e a soberania de Deus quando o texto o permitir — sem forçar um tema que não está ali.
- Não invente fatos históricos, variantes ou sentidos lexicais. Se houver incerteza, diga.
- Não use o texto para ódio, espetáculo ou polêmica vazia.
- Não contradiga o evangelho apostólico nem trate Cristo como mero exemplo moral.
- Responda em português brasileiro, em prosa clara, para um cristão leigo inteligente.
- Estruture sempre assim, com títulos curtos:
  1. Contexto
  2. O texto e as palavras
  3. Cristo e o evangelho
  4. Para crer e viver
- Seja fiel, caloroso e breve (250 a 450 palavras).`

export function buildExplainPrompt(payload: ExplainPayload) {
  const words = payload.words
    .map((word) => {
      const bits = [
        word.surface,
        word.lemma && `lema ${word.lemma}`,
        word.gloss && `“${word.gloss}”`,
        word.pos,
        word.morph,
        word.strongs,
      ].filter(Boolean)
      return `- ${bits.join(" · ")}`
    })
    .join("\n")

  const focus = payload.focus
    ? `Palavra em foco: ${formatWord(payload.focus)}`
    : "Nenhuma palavra isolada: explique o versículo inteiro."

  return `Referência: ${payload.ref}

Texto em português (Bíblia Livre):
${payload.pt}

Palavras do grego (SBLGNT / MACULA):
${words || "(sem tokens gregos neste versículo)"}

${focus}`
}

export function localExplain(payload: ExplainPayload) {
  const focus = payload.focus
  const strongWords = payload.words.filter((word) =>
    ["substantivo", "verbo", "adjetivo"].includes(word.pos)
  )
  const highlights = (focus ? [focus, ...strongWords] : strongWords)
    .filter(
      (word, index, list) =>
        list.findIndex((item) => item.lemma === word.lemma) === index
    )
    .slice(0, 5)

  const wordLines = highlights
    .map((word) => `**${word.surface}** (${word.lemma})${word.strongs ? ` · ${word.strongs}` : ""}: ${word.gloss}${word.morph ? ` — ${word.morph}` : ""}.`)
    .join("\n")

  return `### Contexto
${payload.ref} fala ao povo de Deus na linguagem da aliança: não como conselho genérico, mas como Palavra que cria e julga. Leia o capítulo inteiro; um versículo isolado nunca é o evangelho completo.

### O texto e as palavras
${payload.pt}

${wordLines || "As palavras originais deste versículo convidam a um estudo mais demorado no capítulo."}

${
  focus
    ? `A palavra em destaque, **${focus.surface}**, traz o sentido de “${focus.gloss}”. Isso não é um truque etimológico: o sentido se firma no uso desta passagem e no restante das Escrituras.`
    : "Toque uma palavra grega no versículo para aprofundar o lema, a morfologia e o Strong."
}

### Cristo e o evangelho
Na linha reformada, toda a Escritura testemunha de Cristo: da lei que expõe o pecador à graça que justifica o ímpio pela fé, sem obras. O que este texto exige, Cristo cumpriu; o que este texto promete, Cristo garante; o que este texto manda, o Espírito escreve no coração regenerado.

### Para crer e viver
Receba o texto de joelhos, não como ferramenta de autoajuda. Peça ao Espírito entendimento. Volte ao capítulo, ore com as próprias palavras da passagem e obedeça no lugar concreto em que você está — família, igreja e vocação.

_Leitura local — o modelo de linguagem não respondeu desta vez. O esboço segue a mesma linha reformada._`
}

function formatWord(word: GreekWord) {
  return `${word.surface} (lema ${word.lemma}${word.strongs ? `, ${word.strongs}` : ""}): “${word.gloss}”`
}
