// src/boot/auth-redirect.js
import { boot } from 'quasar/wrappers'

function hasAnyTokenInUrl() {
  const s = window.location.search
  const h = window.location.hash
  return (
    (s &&
      (s.includes('access_token=') ||
        s.includes('refresh_token=') ||
        s.includes('token_hash=') ||
        s.includes('code='))) ||
    (h &&
      (h.includes('access_token=') ||
        h.includes('refresh_token=') ||
        h.includes('token_hash=') ||
        h.includes('code=')))
  )
}

// eslint-disable-next-line no-unused-vars
export default boot(({ router }) => {
  if (hasAnyTokenInUrl()) {
    // Bawa SEMUA query/hash apa adanya supaya bisa diparse di callback
    const raw = window.location.search
      ? window.location.search
      : '?' + window.location.hash.replace(/^#\/?/, '')
    // Hard redirect (biar tidak kalah timing)
    window.location.replace('/auth/callback' + raw)
  }
})
