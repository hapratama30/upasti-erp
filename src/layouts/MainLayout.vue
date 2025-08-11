<template>
  <q-layout view="lHh Lpr lff">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <q-icon name="business_center" />
          </q-avatar>
          Upasti-ERP
        </q-toolbar-title>

        <q-space />

        <q-btn flat label="Login" to="/login" />
        <q-btn
          color="white"
          text-color="primary"
          label="Daftar Gratis"
          to="/register"
          class="q-ml-sm"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
// Layout ini khusus untuk halaman publik (sebelum login)
</script>
