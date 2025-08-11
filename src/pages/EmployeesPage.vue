<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5">Manajemen Data Karyawan</div>
      <q-space />
      <q-btn
        v-if="hasPermission('employees.create')"
        color="primary"
        label="Tambah Karyawan"
        icon="add"
        @click="openAddDialog"
      />
    </div>

    <q-card>
      <q-card-section>
        <q-table
          title="Daftar Karyawan"
          :rows="employees"
          :columns="filteredColumns"
          row-key="id"
          :loading="loading"
          no-data-label="Tidak ada data karyawan."
          @row-click="viewEmployeeDetails"
          class="cursor-pointer"
        >
          <template v-slot:body-cell-photo="props">
            <q-td :props="props">
              <q-avatar v-if="props.row.photo_url">
                <img :src="props.row.photo_url" />
              </q-avatar>
              <q-avatar v-else icon="person" color="grey-5" text-color="white" />
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="props.row.is_active_dynamic ? 'green' : 'red'">
                {{ props.row.is_active_dynamic ? 'Aktif' : 'Tidak Aktif' }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" @click.stop>
              <q-btn flat dense icon="more_vert">
                <q-menu>
                  <q-list style="min-width: 100px">
                    <q-item
                      v-if="hasPermission('employees.edit')"
                      clickable
                      v-close-popup
                      @click="editEmployee(props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon name="edit" />
                      </q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item
                      v-if="!props.row.user_id && hasPermission('employees.invite')"
                      clickable
                      v-close-popup
                      @click="inviteExistingEmployee(props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon name="mail" color="blue" />
                      </q-item-section>
                      <q-item-section>Undang</q-item-section>
                    </q-item>
                    <q-item
                      v-if="props.row.user_id && hasPermission('employees.edit')"
                      clickable
                      v-close-popup
                      @click="resetPassword(props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon name="lock_reset" color="warning" />
                      </q-item-section>
                      <q-item-section>Reset Password</q-item-section>
                    </q-item>
                    <q-item
                      v-if="hasPermission('employees.delete')"
                      clickable
                      v-close-popup
                      @click="deleteEmployee(props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon name="delete" color="red" />
                      </q-item-section>
                      <q-item-section>Hapus</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showAddEditDialog" persistent>
      <q-card style="width: 700px; max-width: 80vw">
        <q-form @submit="saveEmployee">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">{{ isEditMode ? 'Edit Karyawan' : 'Tambah Karyawan Baru' }}</div>
          </q-card-section>

          <q-card-section class="q-gutter-md">
            <q-input filled v-model="form.name" label="Nama Lengkap" />
            <q-input filled v-model="form.nik" label="NIK" />
            <q-select
              filled
              v-model="form.gender_id"
              :options="genders"
              label="Jenis Kelamin"
              emit-value
              map-options
            />
            <q-input filled v-model="form.address" label="Alamat" />
            <q-select
              filled
              v-model="form.division_id"
              :options="divisions"
              label="Divisi"
              emit-value
              map-options
            />
            <q-select
              filled
              v-model="form.level_id"
              :options="levels"
              label="Status Karyawan"
              emit-value
              map-options
            />
            <q-select
              filled
              v-model="form.position_id"
              :options="positions"
              label="Jabatan"
              emit-value
              map-options
            />
            <q-input filled v-model="form.salary" label="Gaji" type="number" />
            <q-input filled v-model="form.email" type="email" label="Email" />
            <q-input filled v-model="form.phone_number" label="Nomor Telepon" />
            <q-input
              filled
              v-model="form.join_date"
              label="Tanggal Bergabung"
              mask="date"
              :rules="['date']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="form.join_date" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              filled
              v-model="form.end_date"
              label="Tanggal Akhir"
              mask="date"
              :rules="['date']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="form.end_date" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-uploader
              label="Unggah Foto Karyawan"
              accept=".jpg, .jpeg, .png"
              max-files="1"
              ref="uploaderRef"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Batal" color="grey" @click="resetForm" />
            <q-btn flat label="Simpan" color="primary" type="submit" :loading="formLoading" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDetailDialog">
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="bg-primary text-white row items-center no-wrap">
          <div class="text-h6">Detail Karyawan</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>

        <q-card-section v-if="selectedEmployee" class="q-pa-lg">
          <div class="text-center q-mb-md">
            <q-img
              v-if="selectedEmployee.photo_url"
              :src="selectedEmployee.photo_url"
              :ratio="1"
              width="150px"
              class="q-mx-auto"
            />
            <q-avatar
              v-else
              icon="person"
              size="150px"
              color="grey-5"
              text-color="white"
              class="q-mx-auto"
            />
            <div class="text-caption q-mt-sm">FOTO</div>
          </div>

          <q-list class="q-gutter-y-md">
            <div class="row">
              <div class="col-4 text-weight-medium">NIK</div>
              <div class="col-8 text-grey-8">{{ selectedEmployee.nik }}</div>
            </div>
            <q-separator />

            <div class="row">
              <div class="col-4 text-weight-medium">EMAIL</div>
              <div class="col-8 text-grey-8">{{ selectedEmployee.email }}</div>
            </div>
            <q-separator />

            <div class="row">
              <div class="col-4 text-weight-medium">Nomor Telepon</div>
              <div class="col-8 text-grey-8">{{ selectedEmployee.phone_number }}</div>
            </div>
            <q-separator />

            <div class="row">
              <div class="col-4 text-weight-medium">Jenis Kelamin</div>
              <div class="col-8 text-grey-8">{{ selectedEmployee.gender_name }}</div>
            </div>
            <q-separator />

            <div class="row">
              <div class="col-4 text-weight-medium">Divisi</div>
              <div class="col-8 text-grey-8">{{ selectedEmployee.division_name }}</div>
            </div>
            <q-separator />

            <div class="row">
              <div class="col-4 text-weight-medium">Jabatan</div>
              <div class="col-8 text-grey-8">{{ selectedEmployee.position_name }}</div>
            </div>
            <q-separator />

            <div class="row">
              <div class="col-4 text-weight-medium">Status Karyawan</div>
              <div class="col-8 text-grey-8">{{ selectedEmployee.level_name }}</div>
            </div>
            <q-separator />

            <div class="row">
              <div class="col-4 text-weight-medium">Gaji</div>
              <div class="col-8 text-grey-8">
                Rp {{ selectedEmployee.salary?.toLocaleString('id-ID') }}
              </div>
            </div>
            <q-separator />

            <div class="row">
              <div class="col-4 text-weight-medium">Alamat</div>
              <div class="col-8 text-grey-8">{{ selectedEmployee.address }}</div>
            </div>
            <q-separator />

            <div class="row">
              <div class="col-4 text-weight-medium">Tanggal Bergabung</div>
              <div class="col-8 text-grey-8">{{ selectedEmployee.join_date }}</div>
            </div>
            <q-separator />

            <div class="row">
              <div class="col-4 text-weight-medium">Tanggal Akhir</div>
              <div class="col-8 text-grey-8">{{ selectedEmployee.end_date ?? '-' }}</div>
            </div>
            <q-separator />

            <div class="row">
              <div class="col-4 text-weight-medium">Status Karyawan</div>
              <div class="col-8 text-grey-8">
                <q-badge :color="selectedEmployee.is_active_dynamic ? 'green' : 'red'">
                  {{ selectedEmployee.is_active_dynamic ? 'Aktif' : 'Tidak Aktif' }}
                </q-badge>
              </div>
            </div>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from 'src/lib/supabaseClient'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const employees = ref([])
const loading = ref(true)
const showAddEditDialog = ref(false)
const showDetailDialog = ref(false)
const selectedEmployee = ref(null)
const formLoading = ref(false)

const isEditMode = ref(false)
const editedEmployeeId = ref(null)

const genders = ref([])
const divisions = ref([])
const levels = ref([])
const positions = ref([])
const uploaderRef = ref(null)
const photoUrl = ref('')

const form = ref({
  name: '',
  nik: '',
  gender_id: '',
  address: '',
  division_id: '',
  level_id: '',
  position_id: '',
  salary: null,
  email: '',
  phone_number: '',
  join_date: '',
  end_date: null,
  photo_url: '',
  is_active: true,
  user_id: null,
})

// ----- RBAC Logic Start -----
const userPermissions = ref([])

// Helper untuk mengecek izin
const hasPermission = (permission) => {
  return userPermissions.value.includes(permission)
}

const allColumns = [
  { name: 'no', label: 'NO', field: 'index', align: 'left' },
  { name: 'photo', label: 'FOTO', field: 'photo_url', align: 'left' },
  { name: 'nik', label: 'NIK', field: 'nik', align: 'left' },
  { name: 'name', label: 'NAMA', field: 'name', align: 'left', sortable: true },
  { name: 'gender', label: 'JENIS KELAMIN', field: 'gender_name', align: 'left' },
  { name: 'address', label: 'ALAMAT', field: 'address', align: 'left' },
  { name: 'division', label: 'DIVISI', field: 'division_name', align: 'left' },
  { name: 'position', label: 'JABATAN', field: 'position_name', align: 'left' },
  { name: 'level', label: 'STATUS KEPEGAWAIAN', field: 'level_name', align: 'left' },
  { name: 'salary', label: 'SALARY', field: 'salary', align: 'left' },
  { name: 'phone_number', label: 'PHONE NUMBER', field: 'phone_number', align: 'left' },
  { name: 'join_date', label: 'JOIN DATE', field: 'join_date', align: 'left' },
  { name: 'end_date', label: 'AKHIR', field: 'end_date', align: 'left' },
  { name: 'status', label: 'STATUS AKTIF', field: 'is_active_dynamic', align: 'center' },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'center' },
]

// Kolom yang ditampilkan disesuaikan dengan izin
const filteredColumns = computed(() => {
  if (hasPermission('employees.edit') || hasPermission('employees.delete')) {
    return allColumns
  }
  return allColumns.filter((col) => col.name !== 'actions')
})

async function fetchUserPermissions() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) throw userError

    const user = userData.user

    // ----- BAGIAN INI YANG DIPERBAIKI -----
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('position_id')
      .eq('user_id', user.id)
      .single()

    if (employeeError && employeeError.code === 'PGRST116') {
      console.warn('Pengguna tidak terhubung ke entri karyawan. Akses dibatasi.')
      userPermissions.value = []
      $q.notify({
        type: 'negative',
        message: 'Akun Anda tidak terdaftar sebagai karyawan. Akses ditolak.',
      })
      return
    } else if (employeeError) {
      throw employeeError
    }

    const positionId = employeeData.position_id

    // ... (Sisa kode untuk mengambil permissions tidak berubah) ...
    const { data: permissions, error: permissionsError } = await supabase
      .from('position_permissions')
      .select('module_id, can_view, can_edit')
      .eq('position_id', positionId)

    if (permissionsError) throw permissionsError

    const permissionList = []
    if (permissions) {
      for (const p of permissions) {
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .select('name')
          .eq('id', p.module_id)
          .single()

        if (!moduleError && moduleData) {
          const moduleName = moduleData.name
          if (p.can_view) permissionList.push(`${moduleName}.view`)
          if (p.can_edit) {
            permissionList.push(
              `${moduleName}.create`,
              `${moduleName}.edit`,
              `${moduleName}.delete`,
            )
            if (moduleName === 'employees') {
              permissionList.push('employees.invite')
            }
          }
        }
      }
    }

    userPermissions.value = permissionList
    console.log('User Permissions:', userPermissions.value)
  } catch (error) {
    console.error('Error fetching user permissions:', error.message)
    $q.notify({
      type: 'negative',
      message: 'Gagal mengambil izin pengguna. Akses dibatasi.',
    })
  }
}
// ----- RBAC Logic End -----

const activeCompanyId = ref(null)

async function fetchActiveCompanyId() {
  const { data, error } = await supabase.rpc('get_current_company_id')
  if (error || !data) {
    $q.notify({
      type: 'negative',
      message: 'Gagal mendapatkan company ID: ' + (error?.message || 'Data tidak ditemukan.'),
    })
    return
  }
  activeCompanyId.value = data
}

function tenantSelect(table, columns = '*', build) {
  let q = supabase.from(table).select(columns)
  if (activeCompanyId.value) q = q.eq('company_id', activeCompanyId.value)
  if (build) q = build(q)
  return q
}

function tenantInsert(table, rows) {
  const list = Array.isArray(rows) ? rows : [rows]
  const payload = list.map((r) => ({
    ...r,
    company_id: r?.company_id ?? activeCompanyId.value,
  }))
  return supabase.from(table).insert(payload)
}

onMounted(async () => {
  await fetchActiveCompanyId()
  await fetchUserPermissions() // Ambil permissions saat komponen di-mount
  await getEmployees()
  await getGenders()
  await getDivisions()
  await getLevels()
  await getPositions()
})

// eslint-disable-next-line no-unused-vars
function goToDashboard() {
  router.push('/dashboard')
}

async function getEmployees() {
  loading.value = true
  if (!activeCompanyId.value || !hasPermission('employees.view')) {
    loading.value = false
    // Tampilkan pesan jika tidak punya izin
    if (!hasPermission('employees.view')) {
      $q.notify({
        type: 'warning',
        message: 'Anda tidak memiliki izin untuk melihat daftar karyawan.',
      })
    }
    return
  }
  const { data, error } = await tenantSelect(
    'employees',
    '*, gender:gender_id(id, name), division:division_id(id, name), level:level_id(id, name), position:position_id(id, name)',
  ).order('name', { ascending: true })

  if (error) {
    console.error('Error fetching employees:', error.message)
    $q.notify({ type: 'negative', message: 'Gagal mengambil data karyawan.' })
  } else {
    employees.value = (data || []).map((employee, index) => {
      const today = new Date().toISOString().slice(0, 10)
      let isActiveDynamic = true
      if (employee.end_date) {
        isActiveDynamic = employee.end_date > today
      }
      return {
        ...employee,
        index: index + 1,
        gender_name: employee?.gender?.name ?? '-',
        division_name: employee?.division?.name ?? '-',
        position_name: employee?.position?.name ?? '-',
        level_name: employee?.level?.name ?? '-',
        is_active_dynamic: isActiveDynamic,
      }
    })
  }
  loading.value = false
}

function openAddDialog() {
  if (!hasPermission('employees.create')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki izin untuk menambah karyawan.',
    })
    return
  }
  resetForm()
  isEditMode.value = false
  showAddEditDialog.value = true
}

function editEmployee(employee) {
  if (!hasPermission('employees.edit')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki izin untuk mengedit karyawan.',
    })
    return
  }
  isEditMode.value = true
  editedEmployeeId.value = employee.id
  form.value = {
    ...employee,
    gender_id: employee.gender?.id ?? employee.gender_id,
    division_id: employee.division?.id ?? employee.division_id,
    position_id: employee.position?.id ?? employee.position_id,
    level_id: employee.level?.id ?? employee.level_id,
  }
  if (form.value.join_date) {
    form.value.join_date = form.value.join_date.split('T')[0].replace(/-/g, '/')
  }
  if (form.value.end_date) {
    form.value.end_date = form.value.end_date.split('T')[0].replace(/-/g, '/')
  }
  photoUrl.value = employee.photo_url || ''
  showAddEditDialog.value = true
}

function viewEmployeeDetails(evt, row) {
  selectedEmployee.value = row
  showDetailDialog.value = true
}

async function uploadPhoto(file) {
  if (!file) return null
  const filePath = `${activeCompanyId.value}/${Date.now()}_${file.name}`
  const { data, error } = await supabase.storage.from('employees').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })

  if (error) {
    console.error('Error saat mengunggah foto:', error)
    throw new Error('Gagal mengunggah foto: ' + error.message)
  }

  const publicUrl = supabase.storage.from('employees').getPublicUrl(data.path)
  return publicUrl.data.publicUrl
}

async function saveEmployee() {
  formLoading.value = true
  if (!activeCompanyId.value) {
    $q.notify({ type: 'negative', message: 'Tenant tidak terdeteksi.' })
    formLoading.value = false
    return
  }

  if (isEditMode.value && !hasPermission('employees.edit')) {
    $q.notify({ type: 'negative', message: 'Anda tidak memiliki izin untuk mengedit karyawan.' })
    formLoading.value = false
    return
  }
  if (!isEditMode.value && !hasPermission('employees.create')) {
    $q.notify({ type: 'negative', message: 'Anda tidak memiliki izin untuk menambah karyawan.' })
    formLoading.value = false
    return
  }

  try {
    const fileToUpload = uploaderRef.value?.files[0]
    if (fileToUpload) {
      photoUrl.value = await uploadPhoto(fileToUpload)
    }

    const payload = {
      name: form.value.name,
      nik: form.value.nik,
      gender_id: form.value.gender_id,
      address: form.value.address,
      division_id: form.value.division_id,
      level_id: form.value.level_id,
      position_id: form.value.position_id,
      salary: form.value.salary,
      email: form.value.email,
      phone_number: form.value.phone_number,
      join_date: form.value.join_date?.replace(/\//g, '-'),
      end_date: form.value.end_date?.replace(/\//g, '-'),
      photo_url: photoUrl.value,
      is_active: form.value.is_active,
      user_id: form.value.user_id,
    }

    if (isEditMode.value) {
      const { error } = await supabase
        .from('employees')
        .update(payload)
        .eq('id', editedEmployeeId.value)
        .eq('company_id', activeCompanyId.value)
      if (error) {
        throw error
      }
    } else {
      const { error } = await tenantInsert('employees', payload)
      if (error) {
        throw error
      }
    }

    $q.notify({
      type: 'positive',
      message: 'Karyawan berhasil disimpan.',
    })
    await getEmployees()
    showAddEditDialog.value = false
  } catch (err) {
    console.error('Error saat menyimpan karyawan:', err)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan karyawan: ' + err.message })
  } finally {
    formLoading.value = false
    if (uploaderRef.value) {
      uploaderRef.value.reset()
    }
    photoUrl.value = ''
  }
}

async function inviteExistingEmployee(employee) {
  if (!hasPermission('employees.invite')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki izin untuk mengundang karyawan.',
    })
    return
  }
  if (!employee.email) {
    $q.notify({ type: 'negative', message: 'Email karyawan tidak ditemukan.' })
    return
  }

  $q.dialog({
    title: 'Kirim Undangan',
    message: `Apakah Anda yakin ingin mengirim undangan ke ${employee.email}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const { data, error } = await supabase.functions.invoke('invite-employee', {
        body: {
          email: employee.email,
          name: employee.name,
          company_id: activeCompanyId.value,
          employee_id: employee.id,
        },
      })

      if (error) throw error

      $q.notify({ type: 'positive', message: 'Undangan berhasil dikirim!' })
      await getEmployees()
    } catch (err) {
      console.error('Error saat mengirim undangan:', err)
      $q.notify({ type: 'negative', message: 'Gagal mengirim undangan: ' + err.message })
    }
  })
}

// ...
async function resetPassword(employee) {
  if (!hasPermission('employees.edit')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki izin untuk mereset password.',
    })
    return
  }
  if (!employee.email) {
    $q.notify({ type: 'negative', message: 'Email karyawan tidak ditemukan.' })
    return
  }

  $q.dialog({
    title: 'Konfirmasi Reset Password',
    message: `Apakah Anda yakin ingin mengirim link reset password ke ${employee.email}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      // Panggil Edge Function 'reset-password' yang sudah di-deploy
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: {
          email: employee.email,
        },
      })

      if (error) {
        throw error
      }
      if (data && data.error) {
        throw new Error(data.error)
      }

      $q.notify({
        type: 'positive',
        message: `Link reset password berhasil dikirim ke ${employee.email}.`,
      })
    } catch (err) {
      console.error('Error saat mengirim link reset password:', err)
      $q.notify({
        type: 'negative',
        message: 'Gagal mengirim link reset password: ' + err.message,
      })
    }
  })
}

async function deleteEmployee(employee) {
  if (!hasPermission('employees.delete')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki izin untuk menghapus karyawan.',
    })
    return
  }
  $q.dialog({
    title: 'Konfirmasi',
    message: `Apakah Anda yakin ingin menghapus ${employee.name}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      if (employee.photo_url) {
        const photoPath = employee.photo_url.split('/employees/')[1]
        const { error: storageError } = await supabase.storage.from('employees').remove([photoPath])

        if (storageError) {
          throw storageError
        }
      }

      const { error: dbError } = await supabase
        .from('employees')
        .delete()
        .eq('id', employee.id)
        .eq('company_id', activeCompanyId.value)

      if (dbError) {
        throw dbError
      }

      $q.notify({
        type: 'positive',
        message: 'Karyawan berhasil dihapus.',
      })
      await getEmployees()
    } catch (err) {
      console.error('Error saat menghapus karyawan:', err)
      $q.notify({
        type: 'negative',
        message: 'Gagal menghapus karyawan: ' + err.message,
      })
    }
  })
}

const resetForm = () => {
  form.value = {
    name: '',
    nik: '',
    gender_id: '',
    address: '',
    division_id: '',
    level_id: '',
    position_id: '',
    salary: null,
    email: '',
    phone_number: '',
    join_date: '',
    end_date: null,
    photo_url: '',
    is_active: true,
    user_id: null,
  }
  editedEmployeeId.value = null
  showAddEditDialog.value = false
  if (uploaderRef.value) {
    uploaderRef.value.reset()
  }
  photoUrl.value = ''
}

// eslint-disable-next-line no-unused-vars
const handleUpload = () => {}

async function getGenders() {
  const { data, error } = await tenantSelect('genders', 'id, name')
  if (!error) {
    genders.value = (data || []).map((item) => ({ label: item.name, value: item.id }))
  }
}

async function getDivisions() {
  const { data, error } = await tenantSelect('divisions', 'id, name')
  if (!error) {
    divisions.value = (data || []).map((item) => ({ label: item.name, value: item.id }))
  }
}

async function getLevels() {
  const { data, error } = await tenantSelect('levels', 'id, name')
  if (!error) {
    levels.value = (data || []).map((item) => ({ label: item.name, value: item.id }))
  }
}

async function getPositions() {
  const { data, error } = await supabase
    .from('positions')
    .select('id, name')
    .eq('company_id', activeCompanyId.value)
  if (!error) {
    positions.value = (data || []).map((item) => ({
      label: item.name,
      value: item.id,
    }))
  }
}
</script>
