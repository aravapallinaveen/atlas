import { useState, useCallback, useEffect, useMemo } from 'react'
import QuestionChips from './components/QuestionChips'
import FreeTextBox from './components/FreeTextBox'
import AnswerPane from './components/AnswerPane'
import GraphPane from './components/GraphPane'
import LoginScreen from './components/LoginScreen'
import UpgradeModal from './components/UpgradeModal'
import { useAuth } from './auth/useAuth'
import { runGraphQuery, askAgent, saveAnswer, getEntitlement, upgradeToPro } from './api/backend'
import { SAMPLE_SUBGRAPH } from './data/graph'

const FREE_LIMIT = 5

// Free tier sees a partial graph — only the answer's highlighted core.
function partialize(sg) {
  const hi = new Set(sg?.highlightNodes ?? [])
  if (hi.size === 0) return sg
  const nodes = (sg.nodes ?? []).filter((n) => hi.has(n.id))
  const links = (sg.links ?? []).filter((l) => hi.has(l.source) && hi.has(l.target))
  return { ...sg, nodes, links }
}

export default function App() {
  const { user, loading: authLoading, error: authError, setError: setAuthError, signIn, signUp, signOut } = useAuth()

  const [activeId, setActiveId] = useState(null)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [answer, setAnswer] = useState(null)
  const [subgraph, setSubgraph] = useState(SAMPLE_SUBGRAPH)
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState(null)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  // Entitlement / payment
  const [plan, setPlan] = useState(null) // 'free' | 'pro'
  const [queryCount, setQueryCount] = useState(0)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const isFree = plan === 'free'
  const capReached = isFree && queryCount >= FREE_LIMIT

  // Load the user's plan + usage after login.
  useEffect(() => {
    if (!user) {
      setPlan(null)
      setQueryCount(0)
      return
    }
    getEntitlement()
      .then((e) => {
        setPlan(e?.plan ?? 'free')
        setQueryCount(e?.queriesUsed ?? 0)
      })
      .catch(() => setPlan('free'))
  }, [user])

  const handleAsk = useCallback(
    async (hero) => {
      if (isFree && queryCount >= FREE_LIMIT) {
        setShowUpgrade(true)
        return
      }
      setActiveId(hero.id)
      setActiveQuestion(hero.question)
      setAnswer(null)
      setError(null)
      setSaved(false)
      setLoading(true)

      let rows
      try {
        setStage('querying')
        const res = await runGraphQuery(hero.id)
        rows = res.rows
        setSubgraph(res.subgraph)
        setQueryCount((c) => c + 1) // server bumped queries_used
      } catch (e) {
        setSubgraph({ nodes: [], links: [], highlightNodes: [], highlightLinks: [] })
        setError(e?.message ?? 'Could not run the graph query.')
        setLoading(false)
        setStage(null)
        return
      }

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
    },
    [isFree, queryCount],
  )

  const handleSave = useCallback(async () => {
    if (!answer) return
    try {
      await saveAnswer({ question: activeQuestion, answer, queryId: activeId })
      setSaved(true)
    } catch (e) {
      setError(e?.message ?? 'Could not save answer.')
    }
  }, [activeQuestion, answer, activeId])

  const handleUpgrade = useCallback(async (promo) => {
    const res = await upgradeToPro(promo)
    if (res?.ok) {
      setPlan('pro')
      setShowUpgrade(false)
    }
    return res
  }, [])

  // Free users get the partial graph (highlighted core only); Pro sees everything.
  const shownSubgraph = useMemo(
    () => (isFree && activeId ? partialize(subgraph) : subgraph),
    [isFree, activeId, subgraph],
  )

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
          {plan === 'pro' ? (
            <span className="plan-badge plan-badge--pro">★ Pro</span>
          ) : (
            <>
              <span className="plan-badge">Free · {Math.min(queryCount, FREE_LIMIT)}/{FREE_LIMIT}</span>
              <button type="button" className="upgrade-btn" onClick={() => setShowUpgrade(true)}>
                Upgrade to Pro
              </button>
            </>
          )}
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
          {capReached && (
            <div className="cap-banner">
              You've used all {FREE_LIMIT} free questions.{' '}
              <button type="button" className="cap-banner__link" onClick={() => setShowUpgrade(true)}>
                Upgrade to Pro
              </button>{' '}
              for unlimited.
            </div>
          )}
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
          <GraphPane subgraph={shownSubgraph} loading={loading && stage === 'querying'} partial={isFree && !!activeId} />
        </section>
      </main>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} onUpgrade={handleUpgrade} />}
    </div>
  )
}
