import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const explain = readFileSync(new URL("../lib/explain.ts", import.meta.url), "utf8")
const route = readFileSync(new URL("../app/api/explain/route.ts", import.meta.url), "utf8")

assert.match(explain, /google\/gemini-2\.5-flash-lite/)
assert.match(explain, /env\.VERCEL/)
assert.doesNotMatch(route, /openai\/gpt-5/)
assert.match(route, /gateway\(EXPLAIN_MODEL\)/)
assert.match(route, /localExplain\(payload\)/)

console.log("explain: Gemini gratuito + fallback local ok")
