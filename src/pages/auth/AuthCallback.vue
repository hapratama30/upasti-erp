// src/pages/auth/AuthCallback.vue
<template>
  <q-page class="flex flex-center">
    <div class="text-center">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md">Memproses tautan…</div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'src/lib/supabaseClient'

const router = useRouter()

// Fungsi untuk mem-parse hash URL
function parseHash(hash) {
  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
  return Object.fromEntries(params.entries())
}

onMounted(async () => {
  const { access_token, refresh_token, type } = parseHash(window.location.hash || '')

  if (!access_token || !refresh_token) {
    // Jika tidak ada token, kembali ke halaman login atau beranda
    router.replace('/login')
    return
  }

  // Set sesi Supabase secara manual
  const { error } = await supabase.auth.setSession({ access_token, refresh_token })
  if (error) {
    console.error('Error saat set sesi:', error)
    router.replace('/login')
    return
  }

  // Arahkan ke rute yang sesuai
  if (type === 'recovery' || type === 'invite') {
    router.replace('/auth/set-password')
  } else {
    router.replace('/dashboard')
  }
})
</script>
