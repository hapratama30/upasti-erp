// src/boot/auth-redirect.js
import { boot } from 'quasar/wrappers'
import { supabase } from 'src/lib/supabaseClient'

// eslint-disable-next-line no-unused-vars
export default boot(({ router }) => {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
      if (window.location.hash.includes('access_token')) {
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  })
})
