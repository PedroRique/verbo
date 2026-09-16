import type { SavedVerse } from "@/lib/types"

const SAVED_KEY = "verbo:salvos"
const LAST_KEY = "verbo:ultimo"

export type LastReading = {
  book: string
  chapter: number
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getSavedVerses(): SavedVerse[] {
  return readJson<SavedVerse[]>(SAVED_KEY, [])
}

export function isVerseSaved(ref: string) {
  return getSavedVerses().some((item) => item.ref === ref)
}

export function toggleSaved(verse: SavedVerse) {
  const current = getSavedVerses()
  const exists = current.some((item) => item.ref === verse.ref)
  const next = exists
    ? current.filter((item) => item.ref !== verse.ref)
    : [verse, ...current]
  writeJson(SAVED_KEY, next)
  return !exists
}

export function getLastReading(): LastReading | null {
  return readJson<LastReading | null>(LAST_KEY, null)
}

export function setLastReading(book: string, chapter: number) {
  writeJson(LAST_KEY, { book, chapter })
}
