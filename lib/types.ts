export type GreekWord = {
  surface: string
  lemma: string
  pos: string
  morph: string
  gloss: string
  strongs: string
}

export type Verse = {
  n: number
  pt: string
  words: GreekWord[]
}

export type Chapter = {
  n: number
  verses: Verse[]
}

export type Book = {
  slug: string
  name: string
  abbrev: string
  chapters: Chapter[]
}

export type BookMeta = {
  slug: string
  name: string
  abbrev: string
  chapters: number
}

export type ReelCard = {
  id: string
  ref: string
  book: string
  chapter: number
  verse: number
  pt: string
  featured: GreekWord
  words: GreekWord[]
  reflection: string
  curated: boolean
}

export type SavedVerse = {
  ref: string
  book: string
  chapter: number
  verse: number
  pt: string
  surface?: string
  gloss?: string
}

export type ExplainPayload = {
  ref: string
  pt: string
  words: GreekWord[]
  focus?: GreekWord | null
}
