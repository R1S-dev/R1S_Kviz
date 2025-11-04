import type { KvizQ } from '../types'

export async function loadQuestionsJSONL(path = '/questions.jsonl'): Promise<KvizQ[]> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Не могу да учитам ${path}`)
  const text = await res.text()
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const out: KvizQ[] = []
  for (const line of lines) {
    try {
      const obj = JSON.parse(line)
      if (obj && obj.id && Array.isArray(obj.odgovori) && typeof obj.tacan === 'number') {
        // dozvoli opciono "kategorija"; ako nema, tretiraj kao 'koznazna'
        const rec: KvizQ = {
          id: String(obj.id),
          pitanje: String(obj.pitanje ?? ''),
          odgovori: obj.odgovori as string[],
          tacan: Number(obj.tacan),
          kategorija: obj.kategorija ? String(obj.kategorija) : 'koznazna',
        }
        out.push(rec)
      }
    } catch {}
  }
  return out
}
