<template>
  <q-page padding class="flex flex-center">
    <q-card style="width: 400px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6 text-center">Login ke Upasti-ERP</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit">
          <q-input filled v-model="email" type="email" label="Email" class="q-mb-md" required />
          <q-input
            filled
            v-model="password"
            type="password"
            label="Password"
            class="q-mb-md"
            required
          />
          <q-btn
            label="Login"
            type="submit"
            color="primary"
            class="full-width"
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section v-if="errorMessage" class="text-negative text-center">
        {{ errorMessage }}
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { proxy } = getCurrentInstance()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function onSubmit() {
  loading.value = true
  errorMessage.value = ''

  // eslint-disable-next-line no-unused-vars
  const { data, error } = await proxy.$supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMessage.value = error.message
  } else {
    // Redirect ke halaman dashboard setelah login berhasil
    router.push('/dashboard')
  }

  loading.value = false
}
</script>
