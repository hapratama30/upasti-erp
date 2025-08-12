// src/boot/auth-redirect.js
import { boot } from 'quasar/wrappers'
import { supabase } from 'src/lib/supabaseClient'

function extractTokensFromLocation() {
  // Bisa jadi: "#access_token=..." ATAU "#/access_token=..." ATAU "?access_token=..."
  let accessToken = null
  let refreshToken = null

  // 1) Cek QUERY (?access_token=...)
  if (window.location.search && window.location.search.includes('access_token')) {
    const sp = new URLSearchParams(window.location.search)
    accessToken = sp.get('access_token')
    refreshToken = sp.get('refresh_token')
  }

  // 2) Cek HASH (#access_token=... atau #/access_token=...)
  if (!accessToken && window.location.hash && window.location.hash.includes('access_token')) {
    // Hilangkan "#", lalu jika ada leading "/" hilangkan juga
    const raw = window.location.hash.replace(/^#\/?/, '')
    // Sekarang raw akan berbentuk "access_token=...&refresh_token=..."
    const sp = new URLSearchParams(raw)
    accessToken = sp.get('access_token')
    refreshToken = sp.get('refresh_token')
  }

  return { accessToken, refreshToken }
}

export default boot(({ router }) => {
  // 0) Jika user membuka link dari email langsung, arahkan segera
  const initialTokens = extractTokensFromLocation()
  if (initialTokens.accessToken) {
    // Bersihkan query/hash agar rapi
    window.history.replaceState({}, document.title, window.location.pathname)
    router.replace({
      path: '/auth/set-password',
      query: {
        access_token: initialTokens.accessToken,
        refresh_token: initialTokens.refreshToken || '',
      },
    })
  }

  // 1) Tetap listen perubahan sesi dari Supabase (seperti di kode asli kamu)
  supabase.auth.onAuthStateChange((event, session) => {
    if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
      const { accessToken, refreshToken } = extractTokensFromLocation()
      if (accessToken) {
        // Bersihkan URL
        window.history.replaceState({}, document.title, window.location.pathname)
        // Redirect ke halaman set password
        router.replace({
          path: '/auth/set-password',
          query: {
            access_token: accessToken,
            refresh_token: refreshToken || '',
          },
        })
      }
    }
  })
})
