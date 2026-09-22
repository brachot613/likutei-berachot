'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as any
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export type SpeechStatus = 'idle' | 'listening' | 'unsupported'

export function useSpeechRecognition() {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const onFinalRef = useRef<((text: string) => void) | null>(null)

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null)
    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const start = useCallback((onFinal?: (text: string) => void) => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) return

    recognitionRef.current?.abort()

    const recognition = new Ctor()
    recognition.lang = 'hu-HU'
    recognition.continuous = false
    recognition.interimResults = true
    onFinalRef.current = onFinal ?? null

    setTranscript('')
    setInterim('')

    recognition.onresult = (event: any) => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
        } else {
          interimText += result[0].transcript
        }
      }
      if (interimText) setInterim(interimText)
      if (finalText) {
        setTranscript(finalText)
        setInterim('')
        onFinalRef.current?.(finalText)
      }
    }

    recognition.onerror = () => {
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    setListening(true)
    recognition.start()
  }, [])

  return { supported, listening, transcript, interim, start, stop }
}
