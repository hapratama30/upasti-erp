import { defineStore } from 'pinia'

export const useModuleStore = defineStore('moduleStore', {
  state: () => ({
    searchQuery: '',
    modules: [
      { name: 'Data Karyawan', icon: 'people', route: '/dashboard/employees' },
      { name: 'Absensi', icon: 'fingerprint', route: '/dashboard/attendance' },
      { name: 'Penggajian', icon: 'paid', route: '/dashboard/payroll' },
      { name: 'POS', icon: 'point_of_sale', route: '/dashboard/pos' },
      { name: 'Keuangan', icon: 'account_balance', route: '/dashboard/finance' },
      { name: 'Laporan', icon: 'bar_chart', route: '/dashboard/reports' },
      { name: 'Pengaturan Perusahaan', icon: 'business', route: '/dashboard/settings' },
      // Tambahkan modul lain di sini
    ],
  }),
  getters: {
    filteredModules: (state) => {
      if (!state.searchQuery) {
        return state.modules
      }
      return state.modules.filter((module) =>
        module.name.toLowerCase().includes(state.searchQuery.toLowerCase()),
      )
    },
  },
  actions: {
    setSearchQuery(query) {
      this.searchQuery = query
    },
  },
})
