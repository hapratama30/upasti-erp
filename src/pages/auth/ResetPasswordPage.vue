<template>
  <q-page class="flex flex-center">
    <q-card style="width: 400px">
      <q-card-section>
        <div class="text-h6 text-center">Reset Password</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="resetPassword">
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
            label="Ubah Password"
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

async function resetPassword() {
  loading.value = true
  try {
    // eslint-disable-next-line no-unused-vars
    const { data, error } = await supabase.auth.updateUser({
      password: password.value,
    })

    if (error) throw error

    $q.notify({
      type: 'positive',
      message: 'Password berhasil diubah. Silakan login.',
    })
    router.push('/login') // Arahkan ke halaman login setelah berhasil
  } catch (error) {
    console.error('Error saat mereset password:', error.message)
    $q.notify({
      type: 'negative',
      message: 'Gagal mereset password: ' + error.message,
    })
  } finally {
    loading.value = false
  }
}
</script>
