'use client'

import { getHebrewToday } from '@/lib/hebrew-calendar'

const STORAGE_KEY = 'aldaskereso.memorial.v1'

export interface Memorial {
  /** Elhunyt neve */
  deceasedName: string
  /** Felajánló családnév */
  familyName: string
  /** Melyik zsidó hónapra szól (év + hónapszám), pl. "5787-7" */
  monthKey: string
  /** Ennek a zsidó hónapnak a magyaros neve, pl. "Tisré" */
  monthName: string
  /** A felirat lejárata (a zsidó hónap végének időbélyege, ms) */
  expiresAtMs: number
}

/** Beolvassa az érvényes emlékfelajánlást, vagy null-t ad, ha lejárt / nincs. */
export function readMemorial(now: Date = new Date()): Memorial | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Memorial
    const today = getHebrewToday(now)
    // Csak akkor él, ha a jelenlegi zsidó hónapra szól és még nem járt le.
    if (parsed.monthKey !== today.monthKey || now.getTime() > parsed.expiresAtMs) {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/** Létrehoz egy emlékfelajánlást a jelenlegi zsidó hónapra és elmenti. */
export function saveMemorial(
  deceasedName: string,
  familyName: string,
  now: Date = new Date(),
): Memorial {
  const today = getHebrewToday(now)
  const memorial: Memorial = {
    deceasedName: deceasedName.trim(),
    familyName: familyName.trim(),
    monthKey: today.monthKey,
    monthName: today.monthName,
    expiresAtMs: today.monthEndMs,
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memorial))
  } catch {
    // Ha nincs localStorage, csak a memóriában él a session erejéig.
  }
  return memorial
}
