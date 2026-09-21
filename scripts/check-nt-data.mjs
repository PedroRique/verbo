import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const book = JSON.parse(gunzipSync(readFileSync("data/nt/joao.json.gz")).toString("utf8"));
const v1 = book.chapters[0].verses[0];
if (book.slug !== "joao") throw new Error("slug");
if (!v1.pt.includes("Verbo") && !v1.pt.includes("verbo") && v1.pt.length < 20) {
  throw new Error(`versículo 1 curto demais: ${v1.pt}`);
}
if (!v1.words?.length || !v1.words[0].lemma) throw new Error("grego ausente");
const reels = JSON.parse(gunzipSync(readFileSync("data/reels.json.gz")).toString("utf8"));
if (!Array.isArray(reels) || reels.length < 20) throw new Error("reels");
console.log(`ok João ${book.chapters.length} caps, ${v1.words.length} palavras no 1:1, ${reels.length} reels`);
