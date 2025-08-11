<template>
  <q-page padding class="flex flex-center">
    <q-card style="width: 400px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6 text-center">
          <q-icon name="apartment" size="lg" class="q-mr-sm" />
          Pendaftaran Perusahaan Baru
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit">
          <q-input
            filled
            v-model="companyName"
            label="Nama Perusahaan"
            class="q-mb-md"
            required
            :rules="[(val) => !!val || 'Nama perusahaan wajib diisi']"
          />
          <q-input
            filled
            v-model="userName"
            label="Nama Admin"
            class="q-mb-md"
            required
            :rules="[(val) => !!val || 'Nama admin wajib diisi']"
          />
          <q-input
            filled
            v-model="adminEmail"
            type="email"
            label="Email Admin"
            class="q-mb-md"
            required
            :rules="[
              (val) => !!val || 'Email wajib diisi',
              (val) => /.+@.+\..+/.test(val) || 'Email tidak valid',
            ]"
          />
          <q-input
            filled
            v-model="adminPassword"
            type="password"
            label="Password Admin"
            class="q-mb-md"
            required
            :rules="[(val) => (val && val.length >= 6) || 'Password minimal 6 karakter']"
          />

          <q-btn
            label="Daftar Sekarang"
            type="submit"
            color="primary"
            class="full-width q-mt-md"
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section v-if="successMessage" class="text-positive text-center">
        {{ successMessage }}
      </q-card-section>
      <q-card-section v-if="errorMessage" class="text-negative text-center">
        {{ errorMessage }}
      </q-card-section>

      <q-card-section class="text-center">
        <q-separator class="q-my-md" />
        Sudah punya akun? <q-btn flat dense color="primary" label="Login di sini" to="/login" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { supabase } from 'src/lib/supabaseClient'

const $q = useQuasar()
const router = useRouter()

const companyName = ref('')
const userName = ref('')
const adminEmail = ref('')
const adminPassword = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const EDGE_FUNCTION_NAME = 'register-company'

async function onSubmit() {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
      body: {
        companyName: companyName.value,
        userName: userName.value,
        email: adminEmail.value,
        password: adminPassword.value,
      },
    })

    if (error) throw error

    if (data.message) {
      $q.notify({
        type: 'positive',
        message: 'Pendaftaran berhasil! Mengarahkan ke dashboard.',
      })
      // Perubahan di sini: Arahkan langsung ke dashboard
      router.push('/dashboard')
    } else {
      throw new Error(data.error || 'Terjadi kesalahan saat pendaftaran.')
    }
  } catch (error) {
    console.error('Registration failed:', error.message)
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}
</script>
