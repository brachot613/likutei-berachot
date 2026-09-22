import catalog from '@/data/brachot.json'

export type BrachaRecord = {
  id: string
  title: string
  category: string
  keywords: string[]
  hebrew: string
  phonetic: string
  translation: string
  emoji?: string
  when?: string
  buttonLabel?: string
}

export type Blessing = {
  id: string
  emoji: string
  buttonLabel: string
  name: string
  hebrew: string
  phonetic: string
  meaning: string
  when: string
  keywords: string[]
  category: string
}

const records = catalog as BrachaRecord[]

export const BLESSINGS: Blessing[] = records.map((b) => ({
  id: b.id,
  emoji: b.emoji ?? '✨',
  buttonLabel: b.buttonLabel ?? b.title,
  name: b.title,
  hebrew: b.hebrew,
  phonetic: b.phonetic,
  meaning: b.translation,
  when: b.when ?? b.category,
  keywords: b.keywords,
  category: b.category,
}))

export const BLESSING_IDS = BLESSINGS.map((b) => b.id)

export function getBlessing(id: string): Blessing | undefined {
  return BLESSINGS.find((b) => b.id === id)
}

/** A gyakori helyzetek gombjai (a felhasználó által kért sorrendben). */
export const QUICK_BLESSINGS = [
  'hamoci',
  'eec',
  'gefen',
  'sehakol',
  'haderech',
  'modeani',
  'sehecheyanu',
  'maasze',
  'aszerjacar',
  'hagomel',
]

/** Rövid katalógus az intent-matching promptjához. */
export function getIntentCatalog(): { id: string; description: string }[] {
  return records.map((b) => ({
    id: b.id,
    description: `${b.title} [${b.category}] — ${b.when ?? b.translation}. Kulcsszavak: ${b.keywords.slice(0, 12).join(', ')}`,
  }))
}
