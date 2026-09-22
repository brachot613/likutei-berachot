'use client'

import { useEffect, useState } from 'react'
import { Volume2, Square } from 'lucide-react'
import type { Blessing } from '@/lib/blessings'
import { canSpeak, speakPhonetic, stopSpeaking } from '@/lib/speak'

export function BlessingResult({ blessing }: { blessing: Blessing }) {
  const [speaking, setSpeaking] = useState(false)

  // Új áldásnál mindig állítsuk le a korábbi felolvasást.
  useEffect(() => {
    stopSpeaking()
    setSpeaking(false)
    return () => stopSpeaking()
  }, [blessing.id])

  const handlePlay = () => {
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    setSpeaking(true)
    speakPhonetic(blessing.phonetic, () => setSpeaking(false))
  }

  return (
    <section
      aria-live="polite"
      className="rounded-3xl border-2 border-accent/40 bg-card p-6 shadow-2xl sm:p-8"
    >
      <h2 className="flex items-center justify-center gap-3 text-center text-3xl font-extrabold leading-tight text-accent sm:text-4xl md:text-5xl">
        <span aria-hidden="true">✨</span>
        <span>{blessing.name}</span>
        <span aria-hidden="true">✨</span>
      </h2>

      <div className="mt-8 space-y-8">
        <div>
          <p className="text-lg font-bold uppercase tracking-wide text-muted-foreground">
            Héberül
          </p>
          <p
            dir="rtl"
            lang="he"
            className="mt-2 text-right text-3xl leading-relaxed sm:text-4xl md:text-5xl"
          >
            {blessing.hebrew}
          </p>
        </div>

        <div>
          <p className="text-lg font-bold uppercase tracking-wide text-muted-foreground">
            Magyar kiejtés
          </p>
          <p className="mt-2 text-3xl font-extrabold leading-snug sm:text-4xl md:text-5xl">
            {'"'}
            {blessing.phonetic}
            {'"'}
          </p>
        </div>

        <div>
          <p className="text-lg font-bold uppercase tracking-wide text-muted-foreground">
            Mit jelent?
          </p>
          <p className="mt-2 text-2xl leading-relaxed sm:text-3xl">
            {blessing.meaning}
          </p>
        </div>

        <p className="text-xl leading-relaxed text-muted-foreground">
          <span className="font-bold">Mikor mondjuk? </span>
          {blessing.when}
        </p>
      </div>

      {canSpeak() && (
        <button
          type="button"
          onClick={handlePlay}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-accent px-6 py-6 text-2xl font-extrabold text-accent-foreground transition-transform active:scale-[0.98] sm:text-3xl"
        >
          {speaking ? (
            <>
              <Square className="size-8 fill-current" aria-hidden="true" />
              Leállítás
            </>
          ) : (
            <>
              <Volume2 className="size-8" aria-hidden="true" />
              🔊 Áldás lejátszása
            </>
          )}
        </button>
      )}
    </section>
  )
}
