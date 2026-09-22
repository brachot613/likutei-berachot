import { getBlessing } from '@/lib/blessings'
import { matchBrachaIntent } from '@/lib/intent-match'

export const maxDuration = 30

/** Korábbi végpont: ugyanaz az OpenAI intent-matching, teljes áldásobjektummal. */
export async function POST(req: Request) {
  let transcript = ''
  try {
    const body = await req.json()
    transcript = typeof body?.transcript === 'string' ? body.transcript : ''
  } catch {
    // ignore
  }

  transcript = transcript.trim()
  if (!transcript) {
    return Response.json({ error: 'empty' }, { status: 400 })
  }

  try {
    const id = await matchBrachaIntent(transcript)
    const blessing = id ? getBlessing(id) ?? null : null
    return Response.json({ blessing, id, transcript })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'match_failed'
    if (message === 'missing_openai_key') {
      return Response.json(
        { error: 'missing_openai_key', blessing: null, id: null },
        { status: 503 },
      )
    }
    console.error('[find-blessing]', error)
    return Response.json({ blessing: null, id: null, transcript }, { status: 502 })
  }
}
