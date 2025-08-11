<template>
  <q-page padding class="flex flex-center">
    <div class="column items-center" style="max-width: 900px; width: 100%">
      <div class="q-pa-md q-gutter-md" style="width: 100%">
        <q-input filled v-model="searchQuery" placeholder="Cari aplikasi..." dense>
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="row q-gutter-md justify-center" style="width: 100%">
        <q-card
          v-for="module in filteredModules"
          :key="module.name"
          class="my-card q-pa-sm text-center"
          @click="goToRoute(module.route)"
        >
          <q-card-section>
            <q-icon :name="module.icon" size="4rem" color="primary" />
            <div class="text-subtitle1 q-mt-sm">{{ module.name }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const modules = ref([
  { name: 'Data Karyawan', icon: 'people', route: '/dashboard/employees' },
  { name: 'Absensi', icon: 'fingerprint', route: '/dashboard/attendance' },
  { name: 'Penggajian', icon: 'paid', route: '/dashboard/payroll' },
  { name: 'POS', icon: 'point_of_sale', route: '/dashboard/pos' },
  { name: 'Keuangan', icon: 'account_balance', route: '/dashboard/finance' },
  { name: 'Laporan', icon: 'bar_chart', route: '/dashboard/reports' },
  { name: 'Pengaturan Perusahaan', icon: 'business', route: '/dashboard/settings' },
])

const filteredModules = computed(() => {
  if (!searchQuery.value) {
    return modules.value
  }
  return modules.value.filter((module) =>
    module.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const goToRoute = (route) => {
  if (route) {
    router.push(route)
  }
}
</script>

<style scoped>
.my-card {
  width: 120px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease-in-out;
}
.my-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
