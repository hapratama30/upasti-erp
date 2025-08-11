import { boot } from 'quasar/wrappers'
import { createClient } from '@supabase/supabase-js'

// Pastikan URL dan anon key diisi dengan benar
const supabaseUrl = 'https://sghjyipzzixmdifnogam.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaGp5aXB6eml4bWRpZm5vZ2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjUzNjAsImV4cCI6MjA2OTk0MTM2MH0.9Q9ySEHPpLi-CiPwBjQ4LUWVMNxc-RhEIf36UPB0lpY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default boot(({ app }) => {
  // Untuk membuat supabase tersedia di dalam komponen via this.$supabase
  app.config.globalProperties.$supabase = supabase
})

export { supabase }
