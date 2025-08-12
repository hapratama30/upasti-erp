<template>
  <q-page class="flex flex-center">
    <div class="column items-center">
      <q-spinner size="40px" />
      <div class="q-mt-md text-subtitle2">Memverifikasi tautan...</div>
      <div v-if="errorMsg" class="q-mt-sm text-negative">{{ errorMsg }}</div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'src/lib/supabaseClient'

const router = useRouter()
const errorMsg = ref('')

function parseAll() {
  const query = new URLSearchParams(window.location.search)
  // Juga coba baca dari hash kalau ada
  if (
    !query.has('access_token') &&
    !query.has('token_hash') &&
    !query.has('code') &&
    window.location.hash
  ) {
    const h = new URLSearchParams(window.location.hash.replace(/^#\/?/, ''))
    for (const [k, v] of h.entries()) query.set(k, v)
  }
  return query
}

onMounted(async () => {
  try {
    const qs = parseAll()

    const access_token = qs.get('access_token')
    const refresh_token = qs.get('refresh_token')
    const token_hash = qs.get('token_hash')
    const type = qs.get('type') || 'invite' // default-kan ke invite untuk kasus undangan
    const code = qs.get('code')

    let ok = false

    // 1) Paling langsung: punya access_token & refresh_token → setSession
    if (access_token && refresh_token) {
      const { data, error } = await supabase.auth.setSession({ access_token, refresh_token })
      if (error) throw error
      ok = !!data.session
    }

    // 2) Link undangan/reset/konfirmasi pakai token_hash + type
    if (!ok && token_hash) {
      const { data, error } = await supabase.auth.verifyOtp({ token_hash, type })
      if (error) throw error
      ok = !!data.session
    }

    // 3) Beberapa flow (OAuth PKCE/magiclink) pakai code
    if (!ok && code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
      ok = !!data.session
    }

    if (!ok) {
      throw new Error('Token tidak valid atau sudah kadaluarsa.')
    }

    // Beres → ke set password
    router.replace('/auth/set-password')
  } catch (e) {
    console.error(e)
    errorMsg.value = e.message || 'Gagal memverifikasi tautan.'
  } finally {
    // Rapikan URL (hapus query/hash)
    window.history.replaceState({}, document.title, window.location.pathname)
  }
})
</script>
