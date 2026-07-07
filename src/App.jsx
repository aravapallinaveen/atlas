import { useState, useCallback } from 'react'
import QuestionChips from './components/QuestionChips'
import FreeTextBox from './components/FreeTextBox'
import AnswerPane from './components/AnswerPane'
import GraphPane from './components/GraphPane'
import LoginScreen from './components/LoginScreen'
import { useAuth } from './auth/useAuth'
import { runGraphQuery, askAgent, saveAnswer } from './api/backend'
import { SAMPLE_SUBGRAPH } from './data/graph'

export default function App() {
  const { user, loading: authLoading, error: authError, setError: setAuthError, signIn, signUp, signOut } = useAuth()

  const [activeId, setActiveId] = useState(null)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [answer, setAnswer] = useState(null)
  const [subgraph, setSubgraph] = useState(SAMPLE_SUBGRAPH)
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

    // 1) Graph query. If this fails, clear the graph so it can't misrepresent the
    //    failed query, and stop.
    let rows
    try {
      setStage('querying')
      const res = await runGraphQuery(hero.id)
      rows = res.rows
      setSubgraph(res.subgraph)
    } catch (e) {
      setSubgraph({ nodes: [], links: [], highlightNodes: [], highlightLinks: [] })
      setError(e?.message ?? 'Could not run the graph query.')
      setLoading(false)
      setStage(null)
      return
    }

    // 2) Reasoning. If this fails, keep the (valid) graph and just show the error.
    try {
      setStage('thinking')
      const { answer: text } = await askAgent(hero.question, rows)
      setAnswer(text)
    } catch (e) {
      setError(e?.message ?? 'Could not generate an answer.')
    } finally {
      setLoading(false)
      setStage(null)
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (!answer) return
    try {
      await saveAnswer({ question: activeQuestion, answer, queryId: activeId })
      setSaved(true)
    } catch (e) {
      setError(e?.message ?? 'Could not save answer.')
    }
  }, [activeQuestion, answer, activeId])

  if (authLoading) {
    return (
      <div className="splash">
        <span className="brand__logo">▲</span> Atlas
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onSignIn={signIn} onSignUp={signUp} error={authError} clearError={() => setAuthError(null)} />
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand__logo">▲</span>
          <span className="brand__name">Atlas</span>
        </div>
        <span className="brand__tagline">Ask your company graph</span>
        <div className="app-header__user">
          <span className="app-header__email">{user.email}</span>
          <button type="button" className="signout-btn" onClick={signOut}>
            Sign out
          </button>
        </div>
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
