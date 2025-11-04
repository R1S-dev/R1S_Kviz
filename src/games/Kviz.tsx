import { useEffect, useRef, useState, useMemo } from 'react'
import { loadQuestionsJSONL } from '../utils/jsonl'
import type { KvizQ } from '../types'
import { shuffle } from '../utils/arrays'
import { ArrowLeft, Check, X as XIcon, Circle } from 'lucide-react'
import type { Settings } from '../App'

type QState = 'idle' | 'correct' | 'wrong' | 'skipped'

const CATEGORY_LABELS: Record<string, string> = {
  fizika: 'Физика',
  hemija: 'Хемија',
  psihologija: 'Психологија',
  latinske: 'Латинске изреке',
  opsta: 'Општа информисаност',
  koznazna: 'Ко зна зна',
}

// Mapiranje kategorije na fajl (JSONL u /public)
const CATEGORY_FILES: Record<string, string> = {
  fizika: '/questions-fizika.jsonl',
  hemija: '/questions-hemija.jsonl',
  psihologija: '/questions-psihologija.jsonl',
  latinske: '/questions-latinske.jsonl',
  opsta: '/questions-opsta.jsonl',
  koznazna: '/questions.jsonl', // postojeći
}

export default function Kviz({
  back,
  settings,
}: {
  back: () => void
  settings: Settings
}) {
  const [qs, setQs] = useState<KvizQ[]>([])
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const [states, setStates] = useState<QState[]>(
    Array.from({ length: settings.totalQuestions }, () => 'idle')
  )

  // anim faze
  const [phaseOut, setPhaseOut] = useState(false)

  const [startAt, setStartAt] = useState<number>(Date.now())
  const [now, setNow] = useState<number>(Date.now())
  const raf = useRef<number | null>(null)
  const lockNextRef = useRef(false)

  const PER_QUESTION_MS = settings.perQuestionMs
  const categoryId = settings.categoryId ?? 'koznazna'
  const categoryPath = CATEGORY_FILES[categoryId] ?? CATEGORY_FILES['koznazna']

  useEffect(() => {
    (async () => {
      // Fallback sample (ako fajl ne postoji)
      const sample: KvizQ[] = [
        {"id":"1","pitanje":"Главни град Канаде је:","odgovori":["Отава","Торонто","Ванкувер","Монтреал"],"tacan":0},
        {"id":"2","pitanje":"Колико има секунди у једном дану?","odgovori":["86400","3600","43200","90000"],"tacan":0},
        {"id":"3","pitanje":"Симбол за натријум је:","odgovori":["Na","N","Ni","K"],"tacan":0}
      ]
      try {
        const all = await loadQuestionsJSONL(categoryPath)
        const take = shuffle(all).slice(0, settings.totalQuestions)
        setQs(take.length ? take : shuffle(sample).slice(0, settings.totalQuestions))
      } catch {
        setQs(shuffle(sample).slice(0, settings.totalQuestions))
      }
    })()
  }, [settings.totalQuestions, categoryPath])

  useEffect(() => {
    setStartAt(Date.now())
    setNow(Date.now())
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [idx])

  function tick() {
    setNow(Date.now())
    raf.current = requestAnimationFrame(tick)
  }

  const q = qs[idx]
  const elapsed = Math.max(0, now - startAt)
  const pctElapsed = Math.max(0, Math.min(1, elapsed / PER_QUESTION_MS))
  const barWidth = `${pctElapsed * 100}%`
  const timeUp = elapsed >= PER_QUESTION_MS
  const remainingMs = Math.max(0, PER_QUESTION_MS - elapsed)

  useEffect(() => {
    if (!q) return
    if (timeUp && picked == null) {
      markAndNext('skipped')
    }
  }, [timeUp, q, picked])

  function vibrate(pattern: number | number[]) {
    try { if ('vibrate' in navigator) (navigator as any).vibrate(pattern) } catch {}
  }

  function markAndNext(state: QState) {
    setStates(prev => { const n=prev.slice(); n[idx]=state; return n })
    setPhaseOut(true)
    const NEXT_DELAY = 180
    setTimeout(() => {
      if (idx >= settings.totalQuestions - 1) {
        setDone(true)
        if (raf.current) cancelAnimationFrame(raf.current)
        return
      }
      setPicked(null)
      setIdx(i=>i+1)
      setPhaseOut(false)
    }, NEXT_DELAY)
  }

  function choose(i:number) {
    if (picked!=null || !q || lockNextRef.current) return
    setPicked(i)
    const ok = i===q.tacan
    ok ? vibrate(25) : vibrate([30, 40, 30])
    lockNextRef.current = true
    setTimeout(()=>{
      lockNextRef.current = false
      markAndNext(ok ? 'correct' : 'wrong')
    }, 850)
  }

  const categoryTitle = useMemo(
    () => CATEGORY_LABELS[categoryId] ?? 'Квиз',
    [categoryId]
  )

  // === LOADING STATE — sada sa BACK dugmetom u headeru ===
  if (!q && !done) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col gap-3 relative">
        <div className="flex items-center justify-between">
          <button className="btn-secondary px-3 py-2 rounded-full" onClick={back} aria-label="Назад">
            <ArrowLeft size={22} />
          </button>
          <div className="w-8" aria-hidden />
        </div>

        <div className="card">
          <div className="w-full h-[4px] rounded-full bg-surface-elev border border-surface-stroke overflow-hidden">
            <div className="h-full bar bar-normal animate-pulse" style={{ width: '35%' }} />
          </div>
        </div>

        <div className="card card-question flex-1 overflow-hidden flex items-center justify-center">
          <div className="text-ink-subtle">Учитавање питања…</div>
        </div>

        {/* Spacer da se ne sakrije ispod potencijalnog sheet-a (u loadingu nema sheet-a, ali vizuelno balansira) */}
        <div className="h-[24px]" aria-hidden />
      </div>
    )
  }

  if (done) {
    const correctCount = states.filter(s => s === 'correct').length
    const perfect = correctCount === states.length
    return (
      <div className="max-w-md mx-auto space-y-4 min-h-screen flex flex-col relative">
        {perfect && <Confetti />}

        <div className="flex items-center justify-between">
          <button className="btn-secondary px-3 py-2 rounded-full" onClick={back} aria-label="Назад">
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center justify-end gap-3">
            {states.map((st, i) => {
              if (st === 'correct') return <Check key={i} size={22} className="text-success" />
              if (st === 'wrong')   return <XIcon key={i} size={22} className="text-danger" />
              const cls = st === 'skipped' ? 'text-ink-subtle opacity-80' : 'text-ink-subtle opacity-40'
              return <Circle key={i} size={16} className={cls} />
            })}
          </div>
        </div>

        <div className="card-hero anim-fade mt-1">
          <div className="h2 mb-1">Резултат — {categoryTitle}</div>
          <div className="text-ink-subtle mb-4">Тачних одговора: <b>{correctCount}</b> / {states.length}</div>
          <div className="flex gap-2 justify-end">
            <button className="btn" onClick={back}>Избор категорије</button>
          </div>
        </div>
      </div>
    )
  }

  const isCorrect = (i: number) => picked != null && i === q.tacan
  const isWrong   = (i: number) => picked != null && i === picked && i !== q.tacan

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col gap-3 relative">
      {/* Header: back (levo) + kružići (desno) */}
      <div className="flex items-center justify-between">
        <button className="btn-secondary px-3 py-2 rounded-full" onClick={back} aria-label="Назад">
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center justify-end gap-3">
          {states.map((st, i) => {
            if (st === 'correct') return <Check key={i} size={20} className="text-success" />
            if (st === 'wrong')   return <XIcon key={i} size={20} className="text-danger" />
            const cls = st === 'skipped' ? 'text-ink-subtle opacity-80' : 'text-ink-subtle opacity-40'
            return <Circle key={i} size={16} className={cls} />
          })}
        </div>
      </div>

      {/* Category badge */}
      <div className="text-ink-subtle text-xs -mb-2 px-1">Категорија: <span className="text-ink">{categoryTitle}</span></div>

      {/* Progress bar */}
      <div className="card anim-fade">
        <div className="w-full h-[4px] rounded-full bg-surface-elev border border-surface-stroke overflow-hidden">
          <div
            className={
              "h-full transition-[width] duration-100 ease-linear bar " +
              (remainingMs <= 3000 ? "bar-critical" : "bar-normal")
            }
            style={{ width: barWidth }}
          />
        </div>
      </div>

      {/* Pitanje kartica */}
      <div
        key={idx}
        className={
          "card card-question flex-1 overflow-auto mb-3 " +
          (phaseOut ? "anim-fade-out" : "anim-fade")
        }
      >
        <div className="text-center">
          <div className="text-2xl font-extrabold mb-1 anim-rise">
            <span className="question-title-gradient">{q?.pitanje}</span>
          </div>
        </div>
      </div>

      {/* Spacer iznad sheet-a */}
      <div className="h-[256px] shrink-0" aria-hidden />

      {/* Bottom sheet (glass) */}
      <div className={"bottom-sheet " + (phaseOut ? "anim-slide-down" : "anim-slide-up")}>
        <div className="sheet-container">
          <div className="card-sheet glass">
            <div className="sheet-handle" aria-hidden />
            <div className="grid grid-cols-1 gap-3 mt-2">
              {q?.odgovori.map((o, i) => {
                const correct = isCorrect(i)
                const wrong = isWrong(i)
                return (
                  <button
                    key={i}
                    className={
                      "btn btn-ans w-full text-left justify-start " +
                      (correct ? "pulse-correct !bg-green-600" : wrong ? "shake-wrong !bg-red-600" : "")
                    }
                    onClick={() => choose(i)}
                    disabled={picked!=null || lockNextRef.current}
                  >
                    {o}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Confetti() {
  const COUNT = 36
  return (
    <div className="confetti-overlay pointer-events-none">
      {Array.from({ length: COUNT }).map((_, i) => (
        <span key={i} className={`confetti confetti-${(i % 6) + 1}`} />
      ))}
    </div>
  )
}
