import { useMemo, useState } from 'react'
import {
  Settings as SettingsIcon,
  Minus,
  Plus,
  Atom,
  FlaskConical,
  Brain,
  BookOpenCheck,
  Globe,
  Target
} from 'lucide-react'
import type { Settings } from '../App'
import { clsx } from 'clsx'

type Category = {
  id: string
  title: string
  icon: JSX.Element
  gradientFrom: string
  gradientTo: string
}

const CATEGORIES: Category[] = [
  { id: 'fizika',      title: 'Физика',               icon: <Atom size={24} />,          gradientFrom: 'from-brand-600', gradientTo: 'to-accent-500' },
  { id: 'hemija',      title: 'Хемија',               icon: <FlaskConical size={24} />,  gradientFrom: 'from-[#6C8BFF]',  gradientTo: 'to-[#2BD9C5]'   },
  { id: 'psihologija', title: 'Психологија',          icon: <Brain size={24} />,         gradientFrom: 'from-[#8AB8FF]',  gradientTo: 'to-[#73F0DD]'   },
  { id: 'latinske',    title: 'Латинске изреке',      icon: <BookOpenCheck size={24} />, gradientFrom: 'from-[#47E4D0]',  gradientTo: 'to-[#4B8CFF]'   },
  { id: 'opsta',       title: 'Општа информисаност',  icon: <Globe size={24} />,         gradientFrom: 'from-[#4B8CFF]',  gradientTo: 'to-[#F59E0B]'   },
  { id: 'koznazna',    title: 'Ко зна зна',           icon: <Target size={24} />,        gradientFrom: 'from-[#2BD9C5]',  gradientTo: 'to-[#EF4444]'   },
]

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
  const secs = Math.round(settings.perQuestionMs / 1000)

  const setSecs = (v: number) => {
    const clamped = Math.max(3, Math.min(90, Math.round(v)))
    onChangeSettings({ ...settings, perQuestionMs: clamped * 1000 })
  }
  const setTotal = (n: number) => {
    const clamped = Math.max(5, Math.min(20, Math.round(n)))
    onChangeSettings({ ...settings, totalQuestions: clamped })
  }
  const pickCategoryAndStart = (id: string) => {
    onChangeSettings({ ...settings, categoryId: id })
    go()
  }

  useMemo(() => settings.categoryId, [settings.categoryId]) // keep behavior consistent

  return (
    <div className="max-w-md mx-auto">
      {/* LISTA KARTICA — jedna po redu, veći naslov i ikonica; bez tačkice/selekcije */}
      <section className="card anim-fade">
        <div className="grid grid-cols-1 gap-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => pickCategoryAndStart(c.id)}
              className={clsx(
                'cat-card group text-left rounded-2xl p-5 border transition relative overflow-hidden',
                'border-surface-stroke hover:bg-surface-elev active:scale-[.995]'
              )}
            >
              {/* tanka gradient traka gore */}
              <div className={clsx('absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r', c.gradientFrom, c.gradientTo)} />
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'inline-flex items-center justify-center rounded-2xl p-2.5 text-white bg-gradient-to-br shadow-soft',
                  c.gradientFrom, c.gradientTo
                )}>
                  {c.icon}
                </div>
                <div className="font-extrabold text-xl tracking-tight">{c.title}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* PODEŠAVANJA DOLE — bez Start dugmeta i bez “odabrano” teksta */}
      <section className="card-hero text-center anim-fade mt-4">
        <button
          className="btn-secondary w-full justify-center mb-3"
          onClick={() => setOpen(o=>!o)}
        >
          <SettingsIcon size={18} />
          <span>Подешавања</span>
        </button>

        {open && (
          <div className="card mb-1 text-left anim-fade">
            <div className="mb-3">
              <div className="h3 mb-1">Време по питању</div>
              <div className="text-ink-subtle text-sm mb-2">3–90 s</div>
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
              <div className="text-ink-subtle text-sm mb-2">5–20</div>
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

        <div className="text-ink-faint text-xs">
          Tapni на категорију изнад да започнеш квиз.
        </div>
      </section>

      <div className="mt-4 text-center text-ink-faint text-xs">
        Верзија 0.6 · 100% офлајн
      </div>
    </div>
  )
}
