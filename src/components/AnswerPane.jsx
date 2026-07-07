const STAGE_LABEL = {
  querying: 'Running graph query…',
  thinking: 'Atlas is reasoning over the results…',
}

function LoadingLine({ stage }) {
  return (
    <div className="loading">
      <span className="loading__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="loading__label">{STAGE_LABEL[stage] ?? 'Working…'}</span>
    </div>
  )
}

/**
 * The answer / chat pane: shows the active question, a staged loading indicator,
 * the returned answer, and a "Save answer" action (a visible DB write, wired by
 * Person C via saveAnswer()).
 */
export default function AnswerPane({ activeQuestion, answer, loading, stage, error, onSave, saved }) {
  const idle = !activeQuestion && !loading

  return (
    <div className="answer-pane">
      {idle && (
        <div className="answer-empty">
          <h2>Ask your company graph</h2>
          <p>
            Pick a question on the left. Atlas runs a real graph query, lights up the
            matching subgraph, and explains the answer in plain language.
          </p>
        </div>
      )}

      {activeQuestion && (
        <div className="qa">
          <div className="bubble bubble--q">{activeQuestion}</div>

          <div className="bubble bubble--a">
            {loading && <LoadingLine stage={stage} />}
            {!loading && error && <p className="answer-error">⚠ {error}</p>}
            {!loading && !error && answer && <p className="answer-text">{answer}</p>}

            {!loading && !error && answer && (
              <button
                type="button"
                className={`save-btn${saved ? ' save-btn--done' : ''}`}
                onClick={onSave}
                disabled={saved}
              >
                {saved ? '✓ Saved' : 'Save answer'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
