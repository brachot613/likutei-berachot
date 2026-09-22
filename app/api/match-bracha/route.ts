import { matchBrachaIntent } from '@/lib/intent-match'

export const maxDuration = 30

export async function POST(req: Request) {
  let transcript = ''
  try {
    const body = await req.json()
    transcript =
      typeof body?.transcript === 'string'
        ? body.transcript
        : typeof body?.text === 'string'
          ? body.text
          : ''
  } catch {
    // ignore malformed JSON
  }

  transcript = transcript.trim()
  if (!transcript) {
    return Response.json({ error: 'empty', id: null }, { status: 400 })
  }

  try {
    const id = await matchBrachaIntent(transcript)
    return Response.json({ id, transcript })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'match_failed'
    if (message === 'missing_openai_key') {
      return Response.json(
        { error: 'missing_openai_key', id: null },
        { status: 503 },
      )
    }
    console.error('[match-bracha]', error)
    return Response.json({ error: 'match_failed', id: null }, { status: 502 })
  }
}
