import { HDate } from '@hebcal/core'

/**
 * A @hebcal/core angol hónapneveit magyaros, latin betűs kiejtésre képezzük le.
 * A getMonthName() szökőévben az "Adar I" / "Adar II" alakot adja vissza.
 */
const MONTH_HU: Record<string, string> = {
  Nisan: 'Niszán',
  Iyyar: 'Ijár',
  Sivan: 'Sziván',
  Tamuz: 'Támuz',
  Tammuz: 'Támuz',
  Av: 'Áv',
  "Av'": 'Áv',
  Elul: 'Elul',
  Tishrei: 'Tisré',
  Cheshvan: 'Chesván',
  Kislev: 'Kiszlév',
  Tevet: 'Tévész',
  "Sh'vat": 'Svát',
  Shvat: 'Svát',
  Adar: 'Ádár',
  'Adar I': 'Ádár Risón',
  'Adar II': 'Ádár Séni',
  'Adar 1': 'Ádár Risón',
  'Adar 2': 'Ádár Séni',
}

function huMonth(name: string): string {
  return MONTH_HU[name] ?? name
}

export interface HebrewToday {
  /** Zsidó év, pl. 5787 */
  year: number
  /** Magyaros hónapnév, pl. "Tisré" */
  monthName: string
  /** A hónap napja, pl. 10 */
  day: number
  /** Teljes, kijelzésre kész felirat, pl. "5787. Tisré hónap 10." */
  label: string
  /**
   * Az aktuális zsidó hónap stabil azonosítója (év + hónapszám),
   * pl. "5787-7". Az emlékfelajánlás lejáratához használjuk.
   */
  monthKey: string
  /** A jelenlegi zsidó hónap utolsó napjának végét jelző időbélyeg (ms). */
  monthEndMs: number
}

/** Kiszámítja a mai zsidó dátumot a valós rendszerdátumból. */
export function getHebrewToday(now: Date = new Date()): HebrewToday {
  const h = new HDate(now)
  const year = h.getFullYear()
  const month = h.getMonth()
  const monthName = huMonth(h.getMonthName())
  const day = h.getDate()

  // A zsidó hónap utolsó napja -> ennek a nap végéig él az emlékfelirat.
  const lastDay = h.daysInMonth()
  const lastGreg = new HDate(lastDay, month, year).greg()
  lastGreg.setHours(23, 59, 59, 999)

  return {
    year,
    monthName,
    day,
    label: `${year}. ${monthName} hónap ${day}.`,
    monthKey: `${year}-${month}`,
    monthEndMs: lastGreg.getTime(),
  }
}
