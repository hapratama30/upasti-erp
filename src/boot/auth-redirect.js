// src/boot/auth-redirect.js
import { boot } from 'quasar/wrappers'
import { supabase } from 'src/lib/supabaseClient'

function grabTokens() {
  let accessToken = null
  let refreshToken = null

  // ?access_token=...
  if (window.location.search && window.location.search.includes('access_token')) {
    const q = new URLSearchParams(window.location.search)
    accessToken = q.get('access_token')
    refreshToken = q.get('refresh_token')
  }

  // #access_token=... atau #/access_token=...
  if (!accessToken && window.location.hash && window.location.hash.includes('access_token')) {
    const raw = window.location.hash.replace(/^#\/?/, '')
    const h = new URLSearchParams(raw)
    accessToken = h.get('access_token')
    refreshToken = h.get('refresh_token')
  }

  return { accessToken, refreshToken }
}

function hardRedirectToSetPassword(tokens) {
  if (!tokens.accessToken) return
  const url = `/auth/set-password?access_token=${encodeURIComponent(tokens.accessToken)}${
    tokens.refreshToken ? `&refresh_token=${encodeURIComponent(tokens.refreshToken)}` : ''
  }`
  window.location.replace(url)
}

export default boot(() => {
  const initial = grabTokens()
  if (initial.accessToken) {
    hardRedirectToSetPassword(initial)
    return
  }

  window.addEventListener('hashchange', () => {
    const t = grabTokens()
    if (t.accessToken) hardRedirectToSetPassword(t)
  })

  supabase.auth.onAuthStateChange((event, session) => {
    if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
      const t = grabTokens()
      if (t.accessToken) hardRedirectToSetPassword(t)
    }
  })
})
