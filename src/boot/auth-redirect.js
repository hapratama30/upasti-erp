// src/boot/auth-redirect.js
import { boot } from 'quasar/wrappers'

function hasAnyToken() {
  const s = window.location.search || ''
  const h = window.location.hash || ''
  return /(access_token|refresh_token|token_hash|type|code)=/.test(s + h)
}

export default boot(() => {
  if (hasAnyToken()) {
    const payload = window.location.search
      ? window.location.search
      : '?' + (window.location.hash || '').replace(/^#\/?/, '')
    window.location.replace('/auth/callback' + payload)
  }
})
