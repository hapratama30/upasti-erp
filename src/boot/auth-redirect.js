// src/boot/auth-redirect.js
import { boot } from 'quasar/wrappers'
import { supabase } from 'src/lib/supabaseClient'

function parseTokens() {
  // Bisa datang sebagai ?access_token=... ATAU #access_token=... ATAU #/access_token=...
  let accessToken = null
  let refreshToken = null

  // 1) Query string
  if (window.location.search && window.location.search.includes('access_token')) {
    const sp = new URLSearchParams(window.location.search)
    accessToken = sp.get('access_token')
    refreshToken = sp.get('refresh_token')
  }

  // 2) Hash fragment
  if (!accessToken && window.location.hash && window.location.hash.includes('access_token')) {
    // buang "#" lalu jika ada "/" di depan buang juga
    const raw = window.location.hash.replace(/^#\/?/, '')
    const sp = new URLSearchParams(raw)
    accessToken = sp.get('access_token')
    refreshToken = sp.get('refresh_token')
  }

  return { accessToken, refreshToken }
}

function redirectToSetPassword(router, tokens) {
  if (!tokens.accessToken) return
  // JANGAN bersihkan hash dulu — langsung arahkan ke set-password
  router
    .replace({
      path: '/auth/set-password',
      query: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken || '',
      },
    })
    .finally(() => {
      // Setelah berhasil navigasi, baru rapikan URL
      window.history.replaceState({}, document.title, window.location.pathname)
    })
}

export default boot(({ router }) => {
  // 1) Tangani saat halaman pertama kali dibuka dari email
  const initial = parseTokens()
  if (initial.accessToken) {
    redirectToSetPassword(router, initial)
  }

  // 2) Tangani jika hash berubah (beberapa browser/flow bisa memicu hashchange)
  window.addEventListener('hashchange', () => {
    const tokens = parseTokens()
    if (tokens.accessToken) {
      redirectToSetPassword(router, tokens)
    }
  })

  // 3) Tetap listen event Supabase (kode aslinya), tapi tidak membersihkan hash sebelum redirect
  supabase.auth.onAuthStateChange((event, session) => {
    if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
      const tokens = parseTokens()
      if (tokens.accessToken) {
        redirectToSetPassword(router, tokens)
      }
    }
  })
})
