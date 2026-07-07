import { useState } from 'react'

const PRICE = '$12.00'

/**
 * The "Upgrade to Pro" checkout. A promo-code ($0) checkout that unlocks unlimited
 * queries + the full graph — the visible payment moment for the demo.
 */
export default function UpgradeModal({ onClose, onUpgrade }) {
  const [promo, setPromo] = useState('ENJOY0707')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const applied = promo.trim().toUpperCase() === 'ENJOY0707'
  const total = applied ? '$0.00' : PRICE

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const res = await onUpgrade(promo.trim())
    setBusy(false)
    if (!res?.ok) setError(res?.error ?? 'Checkout failed. Please try again.')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
        <h2 className="modal__title">Upgrade to Atlas Pro</h2>
        <p className="modal__sub">Unlimited questions and the full company graph.</p>

        <div className="modal__line">
          <span>Atlas Pro — monthly</span>
          <span>{PRICE}</span>
        </div>

        <form className="modal__form" onSubmit={submit}>
          <label className="modal__label">
            Promo code
            <input
              className="modal__input"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="ENJOY0707"
            />
          </label>
          {applied && <p className="modal__applied">✓ ENJOY0707 applied — 100% off</p>}

          <div className="modal__total">
            <span>Total due today</span>
            <strong>{total}</strong>
          </div>

          {error && <p className="modal__error">⚠ {error}</p>}

          <button className="modal__pay" type="submit" disabled={busy}>
            {busy ? 'Processing…' : `Complete purchase · ${total}`}
          </button>
          <p className="modal__secure">🔒 Secured by Butterbase · Stripe</p>
        </form>
      </div>
    </div>
  )
}
