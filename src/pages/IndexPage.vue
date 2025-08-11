<template>
  <q-page class="flex flex-center bg-dark text-white">
    <div class="column items-center q-pa-lg">
      <h3 class="text-h3 text-weight-bolder text-center q-mb-md">
        Kelola Bisnis Anda dengan Mudah dan <span class="text-primary">Pasti.</span>
      </h3>
      <p class="text-subtitle1 text-center text-grey-4" style="max-width: 600px">
        Upasti adalah solusi ERP terintegrasi yang memberdayakan bisnis Anda dengan manajemen
        karyawan, absensi, payroll, dan POS dalam satu platform modern.
      </p>
      <q-btn label="Mulai Sekarang" color="primary" size="lg" class="q-mt-md" to="/register" />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Logic can be added later
})
</script>
