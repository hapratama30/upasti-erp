import { boot } from 'quasar/wrappers'
import { supabase } from 'src/lib/supabaseClient'

export default boot(({ router }) => {
  router.beforeEach(async (to, from, next) => {
    const hash = window.location.hash || ''

    // Periksa apakah URL sudah memiliki path '/auth/set-password' atau '/auth/reset-password'
    // Jika iya, biarkan saja, jangan redirect lagi.
    if (to.path.startsWith('/auth/set-password') || to.path.startsWith('/auth/reset-password')) {
      return next()
    }

    // Hanya proses jika ada token dari Supabase
    if (!hash || !hash.includes('access_token')) {
      return next()
    }

    const params = new URLSearchParams(hash.substring(1)) // buang '#'
    const type = params.get('type')
    const accessToken = params.get('access_token')

    // Tentukan rute target berdasar type dan pastikan ada access token
    if (accessToken) {
      const target = type === 'recovery' ? '/auth/reset-password' : '/auth/set-password'

      // Arahkan ke rute target, tetap membawa fragmen Supabase
      return next({
        path: target,
        hash: hash,
        replace: true,
      })
    }

    return next()
  })

  // Setelah session terbentuk, bersihkan hash supaya URL rapi
  supabase.auth.onAuthStateChange((event, session) => {
    if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
      if (window.location.hash.includes('access_token')) {
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  })
})
