// src/boot/auth-redirect.js
import { boot } from 'quasar/wrappers'

// Deteksi ada token di URL
function hasAnyToken() {
  const s = window.location.search || ''
  const h = window.location.hash || ''
  return /(access_token|refresh_token|token_hash|type|code)=/.test(s + h)
}

export default boot(() => {
  const path = window.location.pathname

  // JANGAN redirect kalau sudah di /auth/callback atau /auth/set-password
  if (path.startsWith('/auth/callback') || path.startsWith('/auth/set-password')) return

  // Kalau ada token di query/hash, lempar SEKALI ke /auth/callback
  if (hasAnyToken()) {
    const payload = window.location.search
      ? window.location.search
      : '?' + (window.location.hash || '').replace(/^#\/?/, '')
    window.location.replace('/auth/callback' + payload)
  }
})
