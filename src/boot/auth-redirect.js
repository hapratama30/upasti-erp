// src/boot/auth-redirect.js
import { boot } from 'quasar/wrappers'
import { supabase } from 'src/lib/supabaseClient'

// Ambil token dari query atau hash (#access_token=... atau #/access_token=...)
function grabTokens() {
  let accessToken = null
  let refreshToken = null

  // 1) ?access_token=...
  if (window.location.search && window.location.search.includes('access_token')) {
    const q = new URLSearchParams(window.location.search)
    accessToken = q.get('access_token')
    refreshToken = q.get('refresh_token')
  }

  // 2) #access_token=... atau #/access_token=...
  if (!accessToken && window.location.hash && window.location.hash.includes('access_token')) {
    const raw = window.location.hash.replace(/^#\/?/, '') // buang "#", lalu optional "/"
    const h = new URLSearchParams(raw)
    accessToken = h.get('access_token')
    refreshToken = h.get('refresh_token')
  }

  return { accessToken, refreshToken }
}

// Hard redirect supaya tidak tergantung timing router
function hardRedirectToSetPassword(tokens) {
  if (!tokens.accessToken) return
  const url = `/auth/set-password?access_token=${encodeURIComponent(tokens.accessToken)}${
    tokens.refreshToken ? `&refresh_token=${encodeURIComponent(tokens.refreshToken)}` : ''
  }`

  // langsung ganti lokasi (tidak lewat router)
  window.location.replace(url)
}

export default boot(() => {
  // 1) Saat pertama kali load dari email
  const initial = grabTokens()
  if (initial.accessToken) {
    hardRedirectToSetPassword(initial)
    return // hentikan eksekusi boot selanjutnya
  }

  // 2) Jika hash berubah (beberapa flow mengubah hash setelah load)
  window.addEventListener('hashchange', () => {
    const t = grabTokens()
    if (t.accessToken) {
      hardRedirectToSetPassword(t)
    }
  })

  // 3) Listen event dari Supabase (tetap ada seperti kode kamu)
  supabase.auth.onAuthStateChange((event, session) => {
    if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
      const t = grabTokens()
      if (t.accessToken) {
        hardRedirectToSetPassword(t)
      }
    }
  })
})
