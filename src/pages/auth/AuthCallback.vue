<template>
  <q-page class="flex flex-center">
    <div class="column items-center">
      <q-spinner size="40px" v-if="!done && !err" />
      <div class="q-mt-md text-subtitle2" v-if="!done && !err">Memverifikasi tautan...</div>

      <div v-if="err" class="q-pa-md" style="max-width: 680px">
        <div class="text-h6 text-negative q-mb-sm">Link tidak valid</div>
        <div class="q-mb-md">{{ err }}</div>
        <q-card flat bordered class="q-pa-md bg-grey-2">
          <div class="text-caption text-grey-8">Detail yang kami terima:</div>
          <pre class="q-mt-sm" style="white-space: pre-wrap; word-break: break-word">{{
            debug
          }}</pre>
        </q-card>
        <q-btn
          class="q-mt-md"
          color="primary"
          label="Kembali ke Beranda"
          @click="$router.replace('/')"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'src/lib/supabaseClient'

const router = useRouter()
const err = ref('')
const done = ref(false)
const debug = ref('')

function collectParams() {
  const q = new URLSearchParams(window.location.search)
  if (window.location.hash) {
    const h = new URLSearchParams(window.location.hash.replace(/^#\/?/, ''))
    for (const [k, v] of h.entries()) if (!q.has(k)) q.set(k, v)
  }
  return q
}

onMounted(async () => {
  try {
    const p = collectParams()
    const at = p.get('access_token')
    const rt = p.get('refresh_token')
    const th = p.get('token_hash')
    const type = p.get('type') || 'invite'
    const code = p.get('code')

    // simpan debug
    debug.value = JSON.stringify(
      {
        pathname: window.location.pathname,
        query: Object.fromEntries(p.entries()),
        hint: 'access_token length=' + (at ? at.length : 0),
      },
      null,
      2,
    )

    let ok = false

    // 1) JWT access+refresh
    if (at && rt && at.length > 100 && rt.length > 50) {
      const { data, error } = await supabase.auth.setSession({
        access_token: at,
        refresh_token: rt,
      })
      if (error) throw error
      ok = !!data.session
    }

    // 2) token_hash + type (invite/recovery)
    if (!ok && th) {
      const { data, error } = await supabase.auth.verifyOtp({ token_hash: th, type })
      if (error) throw error
      ok = !!data.session
    }

    // 3) PKCE / code exchange
    if (!ok && code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
      ok = !!data.session
    }

    if (!ok) {
      // beri pesan jelas kalau tokennya pendek seperti "447249"
      if (at && at.length < 40) {
        throw new Error(
          'Parameter "access_token" tidak valid (terlalu pendek). ' +
            'Undangan harus berformat token_hash&type=invite ATAU access_token+refresh_token (JWT). ' +
            'Perbaiki edge function/redirectTo agar menghasilkan tautan resmi.',
        )
      }
      throw new Error('Token tidak valid atau sudah kedaluwarsa.')
    }

    done.value = true
    router.replace('/auth/set-password')
  } catch (e) {
    err.value = e?.message || 'Gagal memverifikasi tautan.'
  } finally {
    // hapus query/hash agar bersih
    window.history.replaceState({}, document.title, window.location.pathname)
  }
})
</script>
