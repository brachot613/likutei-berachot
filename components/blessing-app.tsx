'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, Square, Search, Loader2 } from 'lucide-react'
import {
  BLESSINGS,
  QUICK_BLESSINGS,
  getBlessing,
  type Blessing,
} from '@/lib/blessings'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { BlessingResult } from '@/components/blessing-result'
import { HebrewDateBar } from '@/components/hebrew-date-bar'
import { MemorialBand } from '@/components/memorial-band'
import { CedakaPopup } from '@/components/cedaka-popup'
import { readMemorial, type Memorial } from '@/lib/memorial'

type Status = 'idle' | 'searching' | 'found' | 'notfound'

export function BlessingApp() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [blessing, setBlessing] = useState<Blessing | null>(null)
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [showCedaka, setShowCedaka] = useState(false)
  const { supported, listening, interim, start, stop } = useSpeechRecognition()
  const requestId = useRef(0)
  const cedakaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // A jelenlegi zsidó hónapra szóló emlékfelajánlás beolvasása.
  useEffect(() => {
    setMemorial(readMemorial())
    return () => {
      if (cedakaTimer.current) clearTimeout(cedakaTimer.current)
    }
  }, [])

  // A Cedáká persely felugrik, amikor a felhasználó megtekint egy áldást.
  const scheduleCedaka = useCallback(() => {
    if (cedakaTimer.current) clearTimeout(cedakaTimer.current)
    cedakaTimer.current = setTimeout(() => setShowCedaka(true), 900)
  }, [])

  const findBlessing = useCallback(async (transcript: string) => {
    const query = transcript.trim()
    if (!query) return

    const id = ++requestId.current
    setStatus('searching')
    setBlessing(null)

    try {
      const res = await fetch('/api/match-bracha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: query }),
      })
      const data = await res.json()
      if (id !== requestId.current) return // elavult válasz

      const matched = typeof data?.id === 'string' ? getBlessing(data.id) : undefined
      if (matched) {
        setBlessing(matched)
        setStatus('found')
        scheduleCedaka()
      } else {
        setStatus('notfound')
      }
    } catch {
      if (id !== requestId.current) return
      setStatus('notfound')
    }
  }, [scheduleCedaka])

  const handleMic = () => {
    if (listening) {
      stop()
      return
    }
    setStatus('idle')
    // A nagy mikrofonra kattintva azonnal felugrik a Cedáká persely.
    setShowCedaka(true)
    start((finalText) => {
      setText(finalText)
      findBlessing(finalText)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    findBlessing(text)
  }

  const handleQuick = (id: string) => {
    const b = getBlessing(id)
    if (!b) return
    stop()
    setText(b.buttonLabel)
    // A gyorsgomb azonnal a helyes áldásra ugrik, AI hívás nélkül.
    requestId.current++
    setBlessing(b)
    setStatus('found')
    scheduleCedaka()
  }

  const quickButtons = QUICK_BLESSINGS.map((id) =>
    BLESSINGS.find((b) => b.id === id),
  ).filter((b): b is Blessing => Boolean(b))

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <HebrewDateBar />

      <header className="text-center">
        <h1 className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
          Magyar Zsidó Áldáskereső
        </h1>
        <p className="mt-3 text-pretty text-xl text-muted-foreground sm:text-2xl">
          Mondd el, vagy írd be, mit csinálsz – megkeresem a hozzá tartozó áldást.
        </p>
      </header>

      {/* Beviteli mező */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="helyzet" className="sr-only">
          Mit csinálsz vagy mit látsz?
        </label>
        <input
          id="helyzet"
          type="text"
          value={listening && interim ? interim : text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Pl. bort fogok inni…"
          className="w-full rounded-2xl border-2 border-border bg-card px-6 py-5 text-2xl text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none sm:text-3xl"
        />
        <button
          type="submit"
          disabled={status === 'searching' || !text.trim()}
          className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-5 text-2xl font-extrabold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50 sm:text-3xl"
        >
          <Search className="size-7" aria-hidden="true" />
          Áldás keresése
        </button>
      </form>

      {/* Óriási mikrofon gomb */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleMic}
          aria-pressed={listening}
          aria-label={listening ? 'Felvétel leállítása' : 'Áldás kérése szóban'}
          className={[
            'flex size-48 flex-col items-center justify-center gap-2 rounded-full text-center transition-all active:scale-95 sm:size-56',
            listening
              ? 'bg-destructive text-white shadow-[0_0_0_12px] shadow-destructive/25 animate-pulse'
              : 'bg-accent text-accent-foreground shadow-[0_0_0_10px] shadow-accent/20',
          ].join(' ')}
        >
          {listening ? (
            <Square className="size-16 fill-current" aria-hidden="true" />
          ) : (
            <Mic className="size-16" aria-hidden="true" />
          )}
          <span className="px-4 text-xl font-extrabold leading-tight sm:text-2xl">
            {listening ? 'Hallgatom… (kattints a leállításhoz)' : '🎤 Áldás kérése szóban'}
          </span>
        </button>
        {!supported && (
          <p className="text-center text-lg text-muted-foreground">
            A hangfelismerés ezen a böngészőn nem érhető el – kérlek, írd be a mezőbe.
          </p>
        )}
      </div>

      {/* Eredmény doboz */}
      {status === 'searching' && (
        <div className="flex items-center justify-center gap-3 rounded-3xl border-2 border-border bg-card p-10 text-2xl font-bold text-muted-foreground">
          <Loader2 className="size-8 animate-spin" aria-hidden="true" />
          Keresem az áldást…
        </div>
      )}

      {status === 'found' && blessing && (
        <div className="flex flex-col gap-4">
          <BlessingResult blessing={blessing} />
          {memorial && <MemorialBand memorial={memorial} />}
        </div>
      )}

      {status === 'notfound' && (
        <div className="rounded-3xl border-2 border-border bg-card p-8 text-center text-2xl leading-relaxed text-muted-foreground">
          Nem találtam pontos áldást ehhez. Próbáld meg máshogy megfogalmazni, vagy
          válassz a lenti gombok közül.
        </div>
      )}

      {status === 'idle' && (
        <div className="rounded-3xl border-2 border-dashed border-border bg-card/50 p-8 text-center text-2xl leading-relaxed text-muted-foreground">
          Itt jelenik meg az áldás, nagy, jól olvasható betűkkel.
        </div>
      )}

      {/* Gyakori helyzetek */}
      <section>
        <h2 className="mb-4 text-center text-2xl font-extrabold sm:text-3xl">
          Gyakori helyzetek
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quickButtons.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleQuick(b.id)}
              className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card px-5 py-5 text-left text-xl font-bold transition-colors hover:border-accent active:scale-[0.99] sm:text-2xl"
            >
              <span className="text-4xl" aria-hidden="true">
                {b.emoji}
              </span>
              <span>{b.buttonLabel}</span>
            </button>
          ))}
        </div>
      </section>

      {showCedaka && (
        <CedakaPopup
          onClose={() => setShowCedaka(false)}
          onMemorial={(m) => setMemorial(m)}
        />
      )}
    </div>
  )
}
