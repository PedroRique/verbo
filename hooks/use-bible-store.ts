"use client"

import { useSyncExternalStore } from "react"

import type { LastReading } from "@/lib/storage"
import type { SavedVerse } from "@/lib/types"

const SAVED_KEY = "verbo:salvos"
const LAST_KEY = "verbo:ultimo"
const EMPTY_SAVED: SavedVerse[] = []

let savedCache: SavedVerse[] = EMPTY_SAVED
let savedRaw: string | null = null
let lastCache: LastReading | null = null
let lastRaw: string | null = null

function subscribe(listener: () => void) {
  window.addEventListener("verbo-storage", listener)
  window.addEventListener("storage", listener)
  return () => {
    window.removeEventListener("verbo-storage", listener)
    window.removeEventListener("storage", listener)
  }
}

function emit() {
  window.dispatchEvent(new Event("verbo-storage"))
}

function readSaved(): SavedVerse[] {
  if (typeof window === "undefined") return EMPTY_SAVED
  const raw = window.localStorage.getItem(SAVED_KEY)
  if (raw === savedRaw) return savedCache
  savedRaw = raw
  if (!raw) {
    savedCache = EMPTY_SAVED
    return savedCache
  }
  try {
    savedCache = JSON.parse(raw) as SavedVerse[]
  } catch {
    savedCache = EMPTY_SAVED
  }
  return savedCache
}

function writeSaved(next: SavedVerse[]) {
  savedCache = next.length ? next : EMPTY_SAVED
  savedRaw = JSON.stringify(savedCache)
  window.localStorage.setItem(SAVED_KEY, savedRaw)
  emit()
}

function readLast(): LastReading | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(LAST_KEY)
  if (raw === lastRaw) return lastCache
  lastRaw = raw
  if (!raw) {
    lastCache = null
    return lastCache
  }
  try {
    lastCache = JSON.parse(raw) as LastReading
  } catch {
    lastCache = null
  }
  return lastCache
}

function writeLast(next: LastReading) {
  lastCache = next
  lastRaw = JSON.stringify(next)
  window.localStorage.setItem(LAST_KEY, lastRaw)
  emit()
}

export function useSavedVerses() {
  return useSyncExternalStore(subscribe, readSaved, () => EMPTY_SAVED)
}

export function useSaved(ref: string) {
  const saved = useSavedVerses()
  return saved.some((item) => item.ref === ref)
}

export function saveVerse(verse: SavedVerse) {
  const current = readSaved()
  const exists = current.some((item) => item.ref === verse.ref)
  writeSaved(
    exists ? current.filter((item) => item.ref !== verse.ref) : [verse, ...current]
  )
  return !exists
}

export function useLastReading() {
  return useSyncExternalStore(subscribe, readLast, () => null)
}

export function rememberReading(book: string, chapter: number) {
  const current = readLast()
  if (current?.book === book && current.chapter === chapter) return
  writeLast({ book, chapter })
}
