import { useState } from 'react'
import { Trophy, Settings as SettingsIcon, Minus, Plus } from 'lucide-react'
import type { Settings } from '../App'

export default function Start({
  go,
  settings,
  onChangeSettings,
}: {
  go: () => void
  settings: Settings
  onChangeSettings: (s: Settings) => void
}) {
  const [open, setOpen] = useState(false)

  const setSecs = (secs: number) => {
    const clamped = Math.max(3, Math.min(90, Math.round(secs)))
    onChangeSettings({ ...settings, perQuestionMs: clamped * 1000 })
  }

  const setTotal = (n: number) => {
    const clamped = Math.max(5, Math.min(20, Math.round(n)))
    onChangeSettings({ ...settings, totalQuestions: clamped })
  }

  const secs = Math.round(settings.perQuestionMs / 1000)

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-5 justify-center anim-fade">
        <h1 className="h1">Квиз</h1>
      </div>

      <section className="card-hero text-center anim-fade">
        <div className="mb-4 flex items-center justify-center">
          <Trophy className="opacity-90" />
        </div>
        <p className="text-ink-subtle mb-4">
          Офлајн квиз — {settings.totalQuestions} питања, {secs} секунди по питању.
        </p>

        {/* Settings toggle */}
        <button
          className="btn-secondary w-full justify-center mb-3"
          onClick={() => setOpen(o=>!o)}
        >
          <SettingsIcon size={18} />
          <span>Подешавања</span>
        </button>

        {open && (
          <div className="card mb-3 text-left anim-fade">
            <div className="mb-3">
              <div className="h3 mb-1">Време по питању</div>
              <div className="text-ink-subtle text-sm mb-2">Подеси трајање (3–90s)</div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary px-3 py-2" onClick={()=>setSecs(secs-1)} aria-label="Мање">
                  <Minus size={16}/>
                </button>
                <input
                  type="range"
                  min={3}
                  max={90}
                  value={secs}
                  onChange={e=>setSecs(Number(e.target.value))}
                  className="w-full"
                />
                <button className="btn-secondary px-3 py-2" onClick={()=>setSecs(secs+1)} aria-label="Више">
                  <Plus size={16}/>
                </button>
                <div className="w-14 text-right tabular-nums">{secs}s</div>
              </div>
            </div>

            <div className="mt-3">
              <div className="h3 mb-1">Број питања</div>
              <div className="text-ink-subtle text-sm mb-2">Опсег 5–20</div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary px-3 py-2" onClick={()=>setTotal(settings.totalQuestions-1)} aria-label="Мање">
                  <Minus size={16}/>
                </button>
                <input
                  type="range"
                  min={5}
                  max={20}
                  value={settings.totalQuestions}
                  onChange={e=>setTotal(Number(e.target.value))}
                  className="w-full"
                />
                <button className="btn-secondary px-3 py-2" onClick={()=>setTotal(settings.totalQuestions+1)} aria-label="Више">
                  <Plus size={16}/>
                </button>
                <div className="w-14 text-right tabular-nums">{settings.totalQuestions}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button className="btn btn-lg" onClick={go}>Старт</button>
        </div>
      </section>

      <div className="mt-5 text-center text-ink-faint text-xs">
        Верзија 0.2 · 100% офлајн
      </div>
    </div>
  )
}
