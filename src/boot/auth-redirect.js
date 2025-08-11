import { boot } from 'quasar/wrappers'
import { supabase } from 'src/lib/supabaseClient'

export default boot(({ router }) => {
  // Pindai hash URL di setiap navigasi
  router.beforeEach(async (to, from, next) => {
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const type = params.get('type')
      if (type === 'recovery') {
        next('/auth/reset-password' + hash)
      } else {
        next('/auth/set-password' + hash)
      }
    } else {
      next()
    }
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
