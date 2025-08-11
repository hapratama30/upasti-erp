<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated>
      <q-toolbar>
        <!-- Tombol Baris Tiga (Hamburger) di kiri -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Toggle Sidebar"
          @click="leftDrawerOpen = !leftDrawerOpen"
          class="q-mr-sm"
        />

        <q-toolbar-title>Manajemen Karyawan</q-toolbar-title>

        <q-space />
        <!-- (Opsional) tempatkan aksi lain di kanan bila perlu -->
      </q-toolbar>
    </q-header>

    <!-- Sidebar -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="240">
      <q-list padding>
        <q-item
          clickable
          v-ripple
          :active="route.path === '/dashboard/employees'"
          @click="go('/dashboard/employees')"
        >
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Data Karyawan</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="route.path === '/dashboard/employees/categories'"
          @click="go('/dashboard/employees/categories')"
        >
          <q-item-section avatar>
            <q-icon name="category" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Manajemen Kategori</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Tambahan menu lain tinggal duplikasi blok q-item di atas -->
      </q-list>
    </q-drawer>

    <!-- Konten Halaman -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// default: buka di desktop, tutup di mobile
const leftDrawerOpen = ref(true)

onMounted(() => {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    leftDrawerOpen.value = false
  }
})

function go(path) {
  if (route.path !== path) {
    router.push(path)
  }
  // auto-tutup di layar kecil setelah navigasi
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    leftDrawerOpen.value = false
  }
}
</script>
