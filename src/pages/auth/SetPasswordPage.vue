<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card style="min-width: 360px; max-width: 420px">
      <q-card-section>
        <div class="text-h6">Setel Kata Sandi</div>
        <div class="text-caption text-grey-7">Buat kata sandi untuk akun Anda.</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="password"
            type="password"
            label="Kata sandi baru"
            :rules="[(v) => !!v || 'Wajib diisi', (v) => v.length >= 8 || 'Minimal 8 karakter']"
          />
          <q-input
            v-model="confirm"
            type="password"
            label="Ulangi kata sandi"
            :rules="[(v) => v === password || 'Harus sama']"
          />
          <q-btn
            type="submit"
            color="primary"
            :loading="loading"
            label="Simpan"
            class="full-width"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { supabase } from 'src/lib/supabaseClient'

const router = useRouter()
const password = ref('')
const confirm = ref('')
const loading = ref(false)

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    // Kalau user buka langsung tanpa session, kembalikan ke callback agar memproses token
    const s = window.location.search || ''
    const h = window.location.hash || ''
    if (/(access_token|token_hash|code)=/.test(s + h)) {
      const payload = s ? s : '?' + h.replace(/^#\/?/, '')
      window.location.replace('/auth/callback' + payload)
    }
  }
})

async function onSubmit() {
  try {
    loading.value = true
    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) throw error
    Notify.create({ type: 'positive', message: 'Kata sandi berhasil diset.' })
    router.replace('/dashboard')
  } catch (e) {
    Notify.create({ type: 'negative', message: e.message || 'Gagal menyimpan kata sandi.' })
  } finally {
    loading.value = false
  }
}
</script>
