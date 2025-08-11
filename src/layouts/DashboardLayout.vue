<template>
  <q-layout view="lHh Lpr lff">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>Menu Utama</q-toolbar-title>
        <q-space />
        <q-btn flat label="Logout" @click="onLogout" />
      </q-toolbar>
    </q-header>

    <!-- Sidebar dihapus -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { supabase } from 'src/lib/supabaseClient'

const router = useRouter()

async function onLogout() {
  const { error } = await supabase.auth.signOut()
  if (!error) {
    router.push('/login')
  }
}
</script>
