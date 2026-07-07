/**
 * Free-text question box. Visible but intentionally inert for Phase 1 — open
 * text-to-Cypher stays off by default (a Phase 3 stretch behind a flag).
 */
export default function FreeTextBox() {
  return (
    <form className="freetext" onSubmit={(e) => e.preventDefault()} aria-disabled="true">
      <input
        className="freetext__input"
        type="text"
        placeholder="Ask anything about the company graph…"
        disabled
      />
      <button className="freetext__btn" type="submit" disabled>
        Ask
      </button>
      <p className="freetext__note">
        Open questions are coming soon — pick a suggested question above for now.
      </p>
    </form>
  )
}
