"use client"

import { useSyncExternalStore } from "react"

import {
  getLastReading,
  getSavedVerses,
  isVerseSaved,
  setLastReading,
  toggleSaved,
  type LastReading,
} from "@/lib/storage"
import type { SavedVerse } from "@/lib/types"

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

export function useSavedVerses() {
  return useSyncExternalStore(
    subscribe,
    getSavedVerses,
    () => [] as SavedVerse[]
  )
}

export function useSaved(ref: string) {
  const saved = useSavedVerses()
  return saved.some((item) => item.ref === ref)
}

export function saveVerse(verse: SavedVerse) {
  const nowSaved = toggleSaved(verse)
  emit()
  return nowSaved
}

export function verseIsSaved(ref: string) {
  return isVerseSaved(ref)
}

export function useLastReading() {
  return useSyncExternalStore(
    subscribe,
    getLastReading,
    () => null as LastReading | null
  )
}

export function rememberReading(book: string, chapter: number) {
  setLastReading(book, chapter)
  emit()
}
