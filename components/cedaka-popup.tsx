'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Heart, CheckCircle2 } from 'lucide-react'
import { saveMemorial, type Memorial } from '@/lib/memorial'

type View = 'donate' | 'memorial-form' | 'thanks'

// A zsidó Cháj (18) hagyomány szerinti összegek: 18 = élet.
const AMOUNTS = [1800, 18000, 36000] as const

// A dupla Cháj (2 × 18 = 36) az emlékfelajánlás fix összege.
const MEMORIAL_AMOUNT = 36000

// Magyar formátum ezres tagolással már 4 számjegytől is (1 800).
const forintFmt = new Intl.NumberFormat('hu-HU', { useGrouping: 'always' })
const formatForint = (n: number) => forintFmt.format(n)

// Elegáns, minimalista Cedáká-doboz (Tzedakah box) Mágén Dáviddal — kóser ikon.
function TzedakahBoxIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Doboz teteje az érmenyílással */}
      <rect x="9" y="13" width="30" height="7" rx="1.5" />
      <line x1="20" y1="16.5" x2="28" y2="16.5" strokeWidth={2.5} />
      {/* Doboz teste */}
      <rect x="11" y="20" width="26" height="21" rx="2" />
      {/* Mágén Dávid a doboz elején */}
      <path d="M24 25.5 L27.6 32 H20.4 Z" strokeWidth={1.6} />
      <path d="M24 35.5 L20.4 29 H27.6 Z" strokeWidth={1.6} />
      {/* Érme a nyílás felett */}
      <circle cx="24" cy="8.5" r="3.5" />
    </svg>
  )
}

export function CedakaPopup({
  onClose,
  onMemorial,
}: {
  onClose: () => void
  onMemorial: (m: Memorial) => void
}) {
  const [view, setView] = useState<View>('donate')
  const [deceased, setDeceased] = useState('')
  const [family, setFamily] = useState('')
  const [thanksText, setThanksText] = useState('Köszönjük a Micvádat!')
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Escape billentyűre zárjunk, és fókuszáljunk a párbeszédpanelre.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    dialogRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleDonate = (amount: number) => {
    // Beta: a fizetés szimulált; éles verzióban itt indul a Cedáká tranzakció.
    setThanksText(`Köszönjük a ${amount.toLocaleString('hu-HU')} Ft Cedákát!`)
    setView('thanks')
  }

  const handleMemorialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!deceased.trim() || !family.trim()) return
    const m = saveMemorial(deceased, family)
    onMemorial(m)
    setThanksText(`Emlékfelajánlás rögzítve: ${m.monthName} hónap végéig él.`)
    setView('thanks')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cedaka-title"
      onMouseDown={(e) => {
        // Csak a háttérre kattintás zár, a panelre nem.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-lg rounded-3xl border-4 border-accent bg-card p-6 shadow-2xl outline-none sm:p-8"
      >
        {/* Pici "Mégse" a sarokban */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Bezárás"
          className="absolute right-3 top-3 flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground/70 transition-colors hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
          Mégse
        </button>

        {view === 'thanks' ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="size-20 text-accent" aria-hidden="true" />
            <p className="text-3xl font-extrabold leading-tight">{thanksText}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-2xl bg-primary px-8 py-4 text-2xl font-extrabold text-primary-foreground active:scale-[0.98]"
            >
              Ámén
            </button>
          </div>
        ) : view === 'memorial-form' ? (
          <form onSubmit={handleMemorialSubmit} className="flex flex-col gap-5">
            <h2
              id="cedaka-title"
              className="text-center text-3xl font-extrabold leading-tight text-accent"
            >
              Emlékfelajánlás
            </h2>
            <p className="text-center text-lg leading-relaxed text-muted-foreground">
              A felirat egy teljes zsidó hónapig lesz látható az áldások alatt.
            </p>
            <div className="flex flex-col gap-2">
              <label htmlFor="deceased" className="text-lg font-bold">
                Elhunyt neve
              </label>
              <input
                id="deceased"
                type="text"
                value={deceased}
                onChange={(e) => setDeceased(e.target.value)}
                placeholder="Pl. Ávráhám ben Jichák"
                required
                className="rounded-2xl border-2 border-border bg-background px-5 py-4 text-2xl focus:border-accent focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="family" className="text-lg font-bold">
                Felajánló családnév
              </label>
              <input
                id="family"
                type="text"
                value={family}
                onChange={(e) => setFamily(e.target.value)}
                placeholder="Pl. Kohn család"
                required
                className="rounded-2xl border-2 border-border bg-background px-5 py-4 text-2xl focus:border-accent focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!deceased.trim() || !family.trim()}
              className="flex items-center justify-center gap-3 rounded-2xl bg-accent px-6 py-5 text-2xl font-extrabold text-accent-foreground active:scale-[0.98] disabled:opacity-50"
            >
              <Heart className="size-7" aria-hidden="true" />
              Felajánlás megerősítése
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <TzedakahBoxIcon className="size-20 animate-bounce text-accent" />
              <h2
                id="cedaka-title"
                className="text-balance text-3xl font-extrabold leading-tight sm:text-4xl"
              >
                Tegyél egy Micvát ma is!
              </h2>
              <p className="text-pretty text-xl leading-relaxed text-muted-foreground">
                Támogasd a rászoruló magyar zsidó időseket egy jelképes Cedákával.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleDonate(amount)}
                  className="rounded-2xl bg-primary px-4 py-6 text-3xl font-extrabold text-primary-foreground transition-transform active:scale-95"
                >
                  {amount.toLocaleString('hu-HU')} Ft
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setView('memorial-form')}
              className="flex items-center justify-center gap-3 rounded-2xl border-4 border-accent bg-accent/15 px-6 py-6 text-2xl font-extrabold text-accent transition-transform active:scale-[0.98]"
            >
              <Heart className="size-8" aria-hidden="true" />
              <span className="flex flex-col items-center leading-tight">
                Emlékfelajánlás (1 zsidó hónapra)
                <span className="text-xl font-black">
                  {MEMORIAL_AMOUNT.toLocaleString('hu-HU')} Ft
                </span>
              </span>
            </button>

            <div className="text-center">
              <p className="text-lg font-bold italic text-muted-foreground">
                „A Cedáká megment a haláltól."
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                (Példabeszédek könyve 10:2)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
