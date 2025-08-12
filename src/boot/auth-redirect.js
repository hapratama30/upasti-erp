// src/boot/auth-redirect.js
import { boot } from 'quasar/wrappers'
import { supabase } from 'src/lib/supabaseClient'

export default boot(({ router }) => {
  // Pindai hash URL di setiap navigasi
  router.beforeEach((to, from, next) => {
    const hash = window.location.hash || ''
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const type = params.get('type')
      const target = type === 'recovery' ? '/auth/reset-password' : '/auth/set-password'

      // Lakukan redirect sekali ke target
      return next({ path: target, hash: hash, replace: true })
    }

    next()
  })

  // Hapus token dari URL setelah diproses
  supabase.auth.onAuthStateChange((event, session) => {
    if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
      if (window.location.hash.includes('access_token')) {
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  })
})
