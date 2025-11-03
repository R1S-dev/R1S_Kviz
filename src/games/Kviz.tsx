import { useEffect, useRef, useState } from 'react'
import { loadQuestionsJSONL } from '../utils/jsonl'
import type { KvizQ } from '../types'
import { shuffle } from '../utils/arrays'
import { ArrowLeft, Check, X as XIcon, Circle } from 'lucide-react'
import type { Settings } from '../App'

type QState = 'idle' | 'correct' | 'wrong' | 'skipped'

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

  // animacija za smooth prelaz pitanja
  const [phaseOut, setPhaseOut] = useState(false)

  const [startAt, setStartAt] = useState<number>(Date.now())
  const [now, setNow] = useState<number>(Date.now())
  const raf = useRef<number | null>(null)
  const lockNextRef = useRef(false)

  const PER_QUESTION_MS = settings.perQuestionMs

  useEffect(() => {
    (async () => {
      const sample = [
        {"id":"1","pitanje":"КОЈИ ЈЕ ГЛАВНИ ГРАД ФРАНЦУСКЕ?","odgovori":["Париз","Марсеј","Лион","Ница"],"tacan":0},
        {"id":"2","pitanje":"КОЈА РЕКА ПРОТИЧЕ КРОЗ БЕОГРАД?","odgovori":["Дунав","Сава","Морава","Тиса"],"tacan":1},
        {"id":"3","pitanje":"КОЈИ ЕЛЕМЕНТ ИМА ХЕМИЈСКИ СИМБОЛ O?","odgovori":["Кисеоник","Злато","Сребро","Гвожђе"],"tacan":0}
      ]
      try {
        const all = await loadQuestionsJSONL('/questions.jsonl')
        const pick = shuffle(all).slice(0, settings.totalQuestions)
        setQs(pick.length ? pick : shuffle(sample).concat(sample).slice(0, settings.totalQuestions))
      } catch {
        setQs(shuffle(sample).concat(sample).slice(0, settings.totalQuestions))
      }
    })()
  }, [settings.totalQuestions])

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
  const pctElapsed = Math.max(0, Math.min(1, elapsed / PER_QUESTION_MS)) // 0 → 1
  const barWidth = `${pctElapsed * 100}%`
  const timeUp = elapsed >= PER_QUESTION_MS
  const remainingMs = Math.max(0, PER_QUESTION_MS - elapsed)
  const isCritical = remainingMs <= 3000 // poslednje 3 sekunde

  useEffect(() => {
    if (!q) return
    if (timeUp && picked == null) {
      // lagani izlaz pa sledeće pitanje
      markAndNext('skipped')
    }
  }, [timeUp, q, picked])

  function vibrate(pattern: number | number[]) {
    try {
      if ('vibrate' in navigator) (navigator as any).vibrate(pattern)
    } catch {}
  }

  function markAndNext(state: QState) {
    setStates(prev => { const n=prev.slice(); n[idx]=state; return n })

    // mali fade-out pre promene indeksa
    setPhaseOut(true)
    const NEXT_DELAY = 180 // ms
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

    // haptic
    ok ? vibrate(25) : vibrate([30, 40, 30])

    lockNextRef.current = true
    setTimeout(()=>{
      lockNextRef.current = false
      markAndNext(ok ? 'correct' : 'wrong')
    }, 850)
  }

  if (!q && !done) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center items-center">
        <div className="card">Учитавање питања…</div>
      </div>
    )
  }

  if (done) {
    const correctCount = states.filter(s => s === 'correct').length
    const perfect = correctCount === states.length

    return (
      <div className="max-w-md mx-auto space-y-4 min-h-screen flex flex-col relative">
        {/* konfete ako je sve tačno */}
        {perfect && <Confetti />}

        {/* Header: back (levo) + kružići (desno) */}
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
          <div className="h2 mb-2">Резултат</div>
          <div className="text-ink-subtle mb-4">
            Тачних одговора: <b>{correctCount}</b> / {states.length}
          </div>
          <div className="flex gap-2 justify-end">
            <button className="btn" onClick={back}>Почетак</button>
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

      {/* Progress bar */}
      <div className="card anim-fade">
        <div className="w-full h-[4px] rounded-full bg-surface-elev border border-surface-stroke overflow-hidden">
          <div
            className={
              "h-full transition-[width] duration-100 ease-linear bar " +
              (isCritical ? "bar-critical" : "bar-normal")
            }
            style={{ width: barWidth }}
          />
        </div>
      </div>

      {/* Pitanje — sa “breathing room” do sheet-a */}
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

      {/* Spacer da border ostane vidljiv iznad sheet-a */}
      <div className="h-[256px] shrink-0" aria-hidden />

      {/* Bottom sheet sa odgovorima — glass blur + animacije */}
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

/** Jednostavne CSS-konfete: 36 “trakica” koje nežno padnu pri savršenom rezultatu */
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
