'use client'

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function pickHungarianVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang?.toLowerCase().startsWith('hu')) ??
    voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ??
    voices[0] ??
    null
  )
}

/** A magyar fonetikus átírást olvassa fel, lassan és tisztán az idősek kedvéért. */
export function speakPhonetic(text: string, onEnd?: () => void) {
  if (!canSpeak()) {
    onEnd?.()
    return
  }
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'hu-HU'
  utterance.rate = 0.8
  utterance.pitch = 1
  utterance.volume = 1

  const voice = pickHungarianVoice()
  if (voice) utterance.voice = voice

  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onEnd?.()

  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel()
}
