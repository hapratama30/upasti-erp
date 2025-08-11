<template>
  <q-page class="flex flex-center">
    <q-card style="width: 400px">
      <q-card-section>
        <div class="text-h6 text-center">Buat Password Baru</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="setPassword">
          <q-input
            v-model="password"
            label="Password Baru"
            type="password"
            filled
            class="q-mb-md"
            :rules="[(val) => !!val || 'Password harus diisi']"
          />
          <q-input
            v-model="confirmPassword"
            label="Konfirmasi Password"
            type="password"
            filled
            class="q-mb-md"
            :rules="[
              (val) => !!val || 'Konfirmasi password harus diisi',
              (val) => val === password || 'Password tidak cocok',
            ]"
          />
          <q-btn
            label="Simpan Password"
            type="submit"
            color="primary"
            class="full-width"
            :loading="loading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'src/lib/supabaseClient'
import { useQuasar } from 'quasar'

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const router = useRouter()
const $q = useQuasar()

async function setPassword() {
  loading.value = true
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Auth session missing!')
    }

    const { error } = await supabase.auth.updateUser({
      password: password.value,
    })

    if (error) throw error

    $q.notify({
      type: 'positive',
      message: 'Password berhasil dibuat. Silakan login.',
    })
    router.push('/login')
  } catch (error) {
    console.error('Error saat membuat password:', error.message)
    $q.notify({
      type: 'negative',
      message: 'Gagal membuat password: ' + error.message,
    })
  } finally {
    loading.value = false
  }
}
</script>
