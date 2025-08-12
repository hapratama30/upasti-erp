// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file
import { defineConfig } from '#q-app/wrappers'
import path from 'path'

export default defineConfig((/* ctx */) => {
  return {
    // ... bagian lain dari kode ...
    boot: ['axios', 'supabase', 'auth-redirect'],

    css: ['app.scss'],

    brand: {
      primary: '#FF8800',
      secondary: '#26A69A',
      accent: '#9C27B0',

      dark: '#1d1d1d',
      'dark-page': '#121212',

      positive: '#21BA45',
      negative: '#C10015',
      info: '#31CCEC',
      warning: '#F2C037',
    },

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },
      vueRouterMode: 'history',
      alias: {
        src: path.resolve(__dirname, './src'),
      },
    },

    devServer: {
      open: true,
      // BARIS INI DITAMBAHKAN UNTUK MEMPERBAIKI BLOCKED REQUEST
      allowedHosts: ['63ef2e40fdca.ngrok-free.app'],
    },

    // --- BAGIAN INI SUDAH SAYA PERBARUI ---
    framework: {
      config: {},
      plugins: ['Dialog', 'Notify', 'Loading'],
    },
    // --- AKHIR BAGIAN ---

    // https://v2.quasar.dev/quasar-cli-vite/developing-vuex/configuring-vuex
    // Vuex Store
    store: true,

    // ... bagian lain dari kode ...
  }
})
