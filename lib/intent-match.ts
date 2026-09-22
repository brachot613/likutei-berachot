import OpenAI from 'openai'
import { BLESSING_IDS, getIntentCatalog } from '@/lib/blessings'

const MODEL = 'gpt-4o-mini'

function buildSystemPrompt(): string {
  const catalog = getIntentCatalog()
    .map((item) => `- ${item.id}: ${item.description}`)
    .join('\n')

  return `Te egy magyar zsidó áldás-osztályozó vagy (intent matching).
A felhasználó (gyakran idős ember) élőszóban vagy írásban elmondja, mit lát, mit eszik, mit iszik, vagy milyen élethelyzetben van.
A szöveg lehet töltelékes, tájszavas, félbehagyott vagy szinonimákkal teli (pl. „piálok”, „vonatozom”, „felkeltem”). Ezeket hagyd figyelmen kívül, és keresd a LÉNYEGET.

Feladat:
- Válaszd ki PONTOSAN EGY áldás-azonosítót az alábbi listából, amely a helyzethez a legjobban illik.
- Ha semelyik nem illik értelmesen, add vissza null-t.
- Ne találj ki új ID-t. Ne magyarázz. Ne írj héber szöveget.

Válaszformátum: egyetlen JSON objektum: {"id":"<azonosító vagy null>"}

Elérhető áldások:
${catalog}`
}

function parseMatchedId(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed || trimmed === 'null') return null

  try {
    const parsed = JSON.parse(trimmed) as { id?: unknown }
    if (parsed.id === null || parsed.id === 'null' || parsed.id === '') return null
    if (typeof parsed.id === 'string' && BLESSING_IDS.includes(parsed.id)) {
      return parsed.id
    }
  } catch {
    const fallback = trimmed.replace(/^["'\s]+|["'\s]+$/g, '')
    if (BLESSING_IDS.includes(fallback)) return fallback
  }

  return null
}

export async function matchBrachaIntent(transcript: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    const error = new Error('missing_openai_key')
    error.name = 'ConfigError'
    throw error
  }

  const client = new OpenAI({ apiKey })
  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      {
        role: 'user',
        content: `A felhasználó ezt mondta: "${transcript}"\n\nMelyik áldás illik a helyzethez? Válaszolj JSON-ben: {"id":"..."} vagy {"id":null}.`,
      },
    ],
  })

  const content = completion.choices[0]?.message?.content ?? ''
  return parseMatchedId(content)
}
