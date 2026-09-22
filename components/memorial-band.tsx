'use client'

import { Flame } from 'lucide-react'
import type { Memorial } from '@/lib/memorial'

export function MemorialBand({ memorial }: { memorial: Memorial }) {
  return (
    <div className="rounded-2xl border-2 border-accent/50 bg-accent/10 p-5 text-center sm:p-6">
      <div className="mb-2 flex items-center justify-center gap-2 text-accent">
        <Flame className="size-6" aria-hidden="true" />
        <span className="text-base font-extrabold uppercase tracking-wide">
          Löiluj Nismát
        </span>
        <Flame className="size-6" aria-hidden="true" />
      </div>
      <p className="text-pretty text-lg leading-relaxed text-foreground sm:text-xl">
        Ez az áldás ebben a zsidó hónapban ({memorial.monthName}){' '}
        <span className="font-extrabold text-accent">
          Löiluj nismát {memorial.deceasedName}
        </span>{' '}
        emlékére szól, a {memorial.familyName} felajánlásából.
      </p>
    </div>
  )
}
