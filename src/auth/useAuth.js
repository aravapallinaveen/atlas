import { useState, useEffect, useCallback } from 'react'
import { butterbase } from '../api/butterbase'

/**
 * Email/password auth state for Atlas, backed by Butterbase Auth. The SDK persists
 * the session to localStorage, so getUser() restores it on refresh.
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    butterbase.auth
      .getUser()
      .then(({ data }) => {
        if (alive) setUser(data ?? null)
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    setError(null)
    const { data, error } = await butterbase.auth.signIn({ email, password })
    if (error) {
      setError(error.message ?? 'Sign in failed.')
      return false
    }
    setUser(data?.user ?? null)
    return true
  }, [])

  const signUp = useCallback(async (email, password) => {
    setError(null)
    const res = await butterbase.auth.signUp({ email, password })
    // The SDK surfaces validation failures (e.g. weak password) either as
    // res.error or as res.data.error — check both so they don't fall through.
    const signUpError = res?.error?.message ?? res?.data?.error
    if (signUpError) {
      setError(typeof signUpError === 'string' ? signUpError : 'Sign up failed.')
      return false
    }
    // Establish a session immediately so the user lands straight in the app.
    const { data, error: signInError } = await butterbase.auth.signIn({ email, password })
    if (signInError) {
      setError(signInError.message ?? 'Account created — please sign in.')
      return false
    }
    setUser(data?.user ?? null)
    return true
  }, [])

  const signOut = useCallback(async () => {
    await butterbase.auth.signOut()
    setUser(null)
  }, [])

  return { user, loading, error, setError, signIn, signUp, signOut }
}
