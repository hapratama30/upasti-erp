// src/boot/auth-redirect.js
import { boot } from 'quasar/wrappers'

// Jika URL mengandung token (query / hash), lempar semua ke /auth/callback
function hasAnyToken() {
  const s = window.location.search || ''
  const h = window.location.hash || ''
  return (
    s.match(/(access_token|refresh_token|token_hash|type|code)=/) ||
    h.match(/(access_token|refresh_token|token_hash|type|code)=/)
  )
}

export default boot(() => {
  if (hasAnyToken()) {
    const payload = window.location.search
      ? window.location.search
      : '?' + (window.location.hash || '').replace(/^#\/?/, '')
    window.location.replace('/auth/callback' + payload)
  }
})
