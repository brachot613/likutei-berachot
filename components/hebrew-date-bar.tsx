'use client'

import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { getHebrewToday, type HebrewToday } from '@/lib/hebrew-calendar'

export function HebrewDateBar() {
  // A dátumot csak kliensen számítjuk, hogy elkerüljük a hidratálási eltérést.
  const [today, setToday] = useState<HebrewToday | null>(null)

  useEffect(() => {
    setToday(getHebrewToday())
  }, [])

  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-accent/40 bg-accent/10 px-5 py-4 text-center">
      <CalendarDays className="size-7 shrink-0 text-accent" aria-hidden="true" />
      <p className="text-xl font-extrabold leading-tight text-foreground sm:text-2xl">
        {today ? today.label : 'Zsidó naptár betöltése…'}
      </p>
    </div>
  )
}
