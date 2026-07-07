import { HERO_QUESTIONS } from '../data/heroQueries'

/**
 * The three clickable hero-question chips. Each chip carries its hero object
 * (including the queryId) up to the parent via onAsk.
 */
export default function QuestionChips({ activeId, onAsk, disabled }) {
  return (
    <div className="chips" role="group" aria-label="Suggested questions">
      {HERO_QUESTIONS.map((hero) => (
        <button
          key={hero.id}
          type="button"
          className={`chip${activeId === hero.id ? ' chip--active' : ''}`}
          onClick={() => onAsk(hero)}
          disabled={disabled}
        >
          <span className="chip__tag">{hero.tag}</span>
          <span className="chip__text">{hero.chip}</span>
        </button>
      ))}
    </div>
  )
}
