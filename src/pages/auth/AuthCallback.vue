<template>
  <q-page class="flex flex-center">
    <div class="column items-center">
      <q-spinner size="40px" />
      <div class="q-mt-md text-subtitle2">Memverifikasi tautan...</div>
      <div v-if="err" class="q-mt-sm text-negative">{{ err }}</div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'src/lib/supabaseClient'

const router = useRouter()
const err = ref('')

function mixParams() {
  const q = new URLSearchParams(window.location.search)
  if (window.location.hash && (!q.size || !q.get('access_token'))) {
    const h = new URLSearchParams(window.location.hash.replace(/^#\/?/, ''))
    for (const [k, v] of h.entries()) if (!q.has(k)) q.set(k, v)
  }
  return q
}

onMounted(async () => {
  try {
    const p = mixParams()

    const access_token = p.get('access_token')
    const refresh_token = p.get('refresh_token')
    const token_hash = p.get('token_hash')
    const type = p.get('type') || 'invite'
    const code = p.get('code')

    let ok = false

    if (access_token && refresh_token) {
      const { data, error } = await supabase.auth.setSession({ access_token, refresh_token })
      if (error) throw error
      ok = !!data.session
    }

    if (!ok && token_hash) {
      const { data, error } = await supabase.auth.verifyOtp({ token_hash, type })
      if (error) throw error
      ok = !!data.session
    }

    if (!ok && code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
      ok = !!data.session
    }

    if (!ok) {
      throw new Error('Tautan undangan tidak valid / sudah kedaluwarsa.')
    }

    // sukses → ke set password
    router.replace('/auth/set-password')
  } catch (e) {
    console.error(e)
    err.value = e.message || 'Gagal memverifikasi tautan.'
  } finally {
    window.history.replaceState({}, document.title, window.location.pathname)
  }
})
</script>
