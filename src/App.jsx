import { useState, useCallback } from 'react'
import QuestionChips from './components/QuestionChips'
import FreeTextBox from './components/FreeTextBox'
import AnswerPane from './components/AnswerPane'
import GraphPane from './components/GraphPane'
import { runGraphQuery, askAgent, saveAnswer } from './api/backend'
import { SAMPLE_SUBGRAPH } from './data/graph'

export default function App() {
  const [activeId, setActiveId] = useState(null)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [answer, setAnswer] = useState(null)
  const [subgraph, setSubgraph] = useState(SAMPLE_SUBGRAPH) // fake initial view proves rendering path
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState(null) // 'querying' | 'thinking'
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  const handleAsk = useCallback(async (hero) => {
    setActiveId(hero.id)
    setActiveQuestion(hero.question)
    setAnswer(null)
    setError(null)
    setSaved(false)
    setLoading(true)
    try {
      // 1) chip -> runGraphQuery(id) -> render the returned subgraph immediately
      setStage('querying')
      const { rows, subgraph: sg } = await runGraphQuery(hero.id)
      setSubgraph(sg)

      // 2) answer pane -> askAgent(question, rows) -> show the answer text
      setStage('thinking')
      const { answer: text } = await askAgent(hero.question, rows)
      setAnswer(text)
    } catch (e) {
      // Don't leave the graph showing a stale subgraph that misrepresents the
      // failed query — clear it so the panes stay consistent with the error.
      setSubgraph({ nodes: [], links: [], highlightNodes: [], highlightLinks: [] })
      setError(e?.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
      setStage(null)
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (!answer) return
    try {
      await saveAnswer({ question: activeQuestion, answer })
      setSaved(true)
    } catch (e) {
      setError(e?.message ?? 'Could not save answer.')
    }
  }, [activeQuestion, answer])

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand__logo">▲</span>
          <span className="brand__name">Atlas</span>
        </div>
        <span className="brand__tagline">Ask your company graph</span>
      </header>

      <main className="panes">
        <section className="pane pane--left">
          <QuestionChips activeId={activeId} onAsk={handleAsk} disabled={loading} />
          <FreeTextBox />
          <AnswerPane
            activeQuestion={activeQuestion}
            answer={answer}
            loading={loading}
            stage={stage}
            error={error}
            onSave={handleSave}
            saved={saved}
          />
        </section>

        <section className="pane pane--right">
          <GraphPane subgraph={subgraph} loading={loading && stage === 'querying'} />
        </section>
      </main>
    </div>
  )
}
