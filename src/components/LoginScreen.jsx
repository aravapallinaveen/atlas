import { useState } from 'react'

/**
 * Email/password login gate. The whole app sits behind this — nothing loads until
 * the user is authenticated (Butterbase Auth).
 */
export default function LoginScreen({ onSignIn, onSignUp, error, clearError }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    const fn = mode === 'signin' ? onSignIn : onSignUp
    await fn(email.trim(), password)
    setBusy(false)
  }

  const swap = () => {
    clearError?.()
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
  }

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__brand">
          <span className="brand__logo">▲</span> Atlas
        </div>
        <p className="login__tagline">Ask your company graph</p>

        <form className="login__form" onSubmit={submit}>
          <label className="login__field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </label>
          <label className="login__field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {mode === 'signup' && (
              <span className="login__hint">
                8+ characters with an uppercase letter, a number, and a special character.
              </span>
            )}
          </label>

          {error && <p className="login__error">⚠ {error}</p>}

          <button className="login__submit" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="login__switch">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" className="login__link" onClick={swap}>
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
