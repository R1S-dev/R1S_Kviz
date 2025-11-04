import { useState } from 'react'
import Start from './screens/Start'
import Kviz from './games/Kviz'

export type Page = 'start' | 'kviz'

export type Settings = {
  perQuestionMs: number
  totalQuestions: number
  categoryId: string | null
}

export default function App() {
  const [page, setPage] = useState<Page>('start')
  const [settings, setSettings] = useState<Settings>({
    perQuestionMs: 10_000,
    totalQuestions: 10,
    categoryId: null,
  })

  return (
    <div className="min-h-screen">
      <div className="container-page">
        {page === 'start' && (
          <Start
            settings={settings}
            onChangeSettings={setSettings}
            go={() => setPage('kviz')}
          />
        )}
        {page === 'kviz' && (
          <Kviz
            back={() => setPage('start')}
            settings={settings}
          />
        )}
      </div>
    </div>
  )
}
