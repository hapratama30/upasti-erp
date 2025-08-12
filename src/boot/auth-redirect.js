// src/boot/auth-redirect.js
import { boot } from 'quasar/wrappers'
import { supabase } from 'src/lib/supabaseClient'

export default boot(({ router }) => {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
      if (window.location.hash.includes('access_token')) {
        // Bersihkan hash dari URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        // Hapus hash dari URL
        window.history.replaceState({}, document.title, window.location.pathname)

        // Redirect ke halaman set-password sambil membawa token
        if (accessToken) {
          router.replace({
            path: '/auth/set-password',
            query: {
              access_token: accessToken,
              refresh_token: refreshToken,
            },
          })
        }
      }
    }
  })

  // Jika user buka link langsung dari email, arahkan ke set-password
  if (window.location.search.includes('access_token')) {
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get('access_token')
    const refreshToken = urlParams.get('refresh_token')

    router.replace({
      path: '/auth/set-password',
      query: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    })
  }
})
