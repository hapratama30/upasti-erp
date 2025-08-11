<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5">Manajemen Kategori & Jabatan</div>
    </div>

    <q-card>
      <q-card-section>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="genders" label="Jenis Kelamin" />
          <q-tab name="divisions" label="Divisi" />
          <q-tab name="positions" label="Jabatan & Izin" />
          <q-tab name="levels" label="Status Kepegawaian" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="genders">
            <div class="row items-center q-mb-md">
              <div class="text-h6">Manajemen Jenis Kelamin</div>
              <q-space />
              <q-btn
                color="primary"
                label="Tambah"
                icon="add"
                @click="openCategoryDialog('genders')"
              />
            </div>
            <q-table
              title="Daftar Jenis Kelamin"
              :rows="genders"
              :columns="categoryTableColumns"
              row-key="value"
              class="q-mt-md"
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat dense icon="edit" @click="editCategory(props.row, 'genders')" />
                  <q-btn flat dense icon="delete" @click="deleteCategory(props.row, 'genders')" />
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <q-tab-panel name="divisions">
            <div class="row items-center q-mb-md">
              <div class="text-h6">Manajemen Divisi</div>
              <q-space />
              <q-btn
                color="primary"
                label="Tambah"
                icon="add"
                @click="openCategoryDialog('divisions')"
              />
            </div>
            <q-table
              title="Daftar Divisi"
              :rows="divisions"
              :columns="categoryTableColumns"
              row-key="value"
              class="q-mt-md"
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat dense icon="edit" @click="editCategory(props.row, 'divisions')" />
                  <q-btn flat dense icon="delete" @click="deleteCategory(props.row, 'divisions')" />
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <q-tab-panel name="positions">
            <div class="row items-center q-mb-md">
              <div class="text-h6">Manajemen Jabatan & Izin</div>
              <q-space />
              <q-btn
                color="primary"
                label="Tambah Jabatan"
                icon="add"
                @click="openPositionDialog"
              />
            </div>
            <q-table
              title="Daftar Jabatan"
              :rows="positions"
              :columns="positionTableColumns"
              row-key="value"
              class="q-mt-md"
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat dense icon="edit" @click="editPosition(props.row)" />
                  <q-btn flat dense icon="delete" @click="deletePosition(props.row)" />
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <q-tab-panel name="levels">
            <div class="row items-center q-mb-md">
              <div class="text-h6">Manajemen Status Kepegawaian</div>
              <q-space />
              <q-btn
                color="primary"
                label="Tambah"
                icon="add"
                @click="openCategoryDialog('levels')"
              />
            </div>
            <q-table
              title="Daftar Status Kepegawaian"
              :rows="levels"
              :columns="categoryTableColumns"
              row-key="value"
              class="q-mt-md"
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat dense icon="edit" @click="editCategory(props.row, 'levels')" />
                  <q-btn flat dense icon="delete" @click="deleteCategory(props.row, 'levels')" />
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showCategoryDialog" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-form @submit="saveCategory">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">
              {{
                isEditMode
                  ? `Edit ${getCategoryName(currentTable)}`
                  : `Tambah ${getCategoryName(currentTable)}`
              }}
            </div>
          </q-card-section>
          <q-card-section class="q-gutter-md">
            <q-input
              filled
              v-model="categoryForm.name"
              :label="`Nama ${getCategoryName(currentTable)}`"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Batal" color="grey" @click="resetCategoryForm" />
            <q-btn flat label="Simpan" color="primary" type="submit" :loading="formLoading" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showPositionDialog" persistent>
      <q-card style="width: 700px; max-width: 80vw">
        <q-form @submit="savePosition">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">
              {{ isEditMode ? 'Edit Jabatan & Izin' : 'Tambah Jabatan Baru' }}
            </div>
          </q-card-section>

          <q-card-section class="q-gutter-md">
            <q-input filled v-model="positionForm.name" label="Nama Jabatan" />
            <q-separator />

            <div class="text-subtitle1 q-mt-md">Atur Izin Modul</div>
            <div class="q-pa-md">
              <q-table
                flat
                hide-header
                :rows="modulesWithPermissions"
                :columns="permissionColumns"
                row-key="id"
                title="Daftar Modul"
              >
                <template v-slot:body-cell-module_name="props">
                  <q-td :props="props" class="text-weight-medium">
                    {{ props.row.name }}
                  </q-td>
                </template>

                <template v-slot:body-cell-can_view="props">
                  <q-td :props="props">
                    <q-toggle
                      :key="`can-view-${props.row.id}`"
                      v-model="props.row.can_view"
                      :true-value="true"
                      :false-value="false"
                      color="green"
                    />
                    Lihat
                  </q-td>
                </template>

                <template v-slot:body-cell-can_edit="props">
                  <q-td :props="props">
                    <q-toggle
                      :key="`can-edit-${props.row.id}`"
                      v-model="props.row.can_edit"
                      :true-value="true"
                      :false-value="false"
                      color="orange"
                    />
                    Edit
                  </q-td>
                </template>
              </q-table>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Batal" color="grey" @click="resetPositionForm" />
            <q-btn flat label="Simpan" color="primary" type="submit" :loading="formLoading" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'src/lib/supabaseClient'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
// eslint-disable-next-line no-unused-vars
const router = useRouter()

const tab = ref('genders')
const showCategoryDialog = ref(false)
const showPositionDialog = ref(false)
const isEditMode = ref(false)
const formLoading = ref(false)
const currentTable = ref('genders')

const genders = ref([])
const divisions = ref([])
const positions = ref([])
const levels = ref([])
const modules = ref([])

const modulesWithPermissions = ref([])

const categoryForm = ref({
  id: null,
  name: '',
})

const positionForm = ref({
  id: null,
  name: '',
})

const categoryTableColumns = [
  { name: 'label', label: 'Nama Kategori', field: 'name', align: 'left' },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'center' },
]

const positionTableColumns = [
  { name: 'name', label: 'NAMA JABATAN', field: 'name', align: 'left', sortable: true },
  { name: 'actions', label: 'AKSI', field: 'actions', align: 'center' },
]

const permissionColumns = [
  { name: 'module_name', label: 'MODUL', field: 'name', align: 'left' },
  { name: 'can_view', label: 'LIHAT', field: 'can_view', align: 'center' },
  { name: 'can_edit', label: 'EDIT', field: 'can_edit', align: 'center' },
]

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
  if (build) q = q.order('name', { ascending: true })
  return q
}

async function tenantInsert(table, rows) {
  const list = Array.isArray(rows) ? rows : [rows]
  const payload = list.map((r) => ({
    ...r,
    company_id: r?.company_id ?? activeCompanyId.value,
  }))
  return supabase.from(table).insert(payload)
}

onMounted(async () => {
  await fetchActiveCompanyId()
  await getModules()
  await getCategoryData()
})

async function getCategoryData() {
  await getGenders()
  await getDivisions()
  await getPositions()
  await getLevels()
}

async function getGenders() {
  const { data, error } = await tenantSelect('genders', 'id, name')
  if (!error) {
    genders.value = (data || []).map((item) => ({
      label: item.name,
      value: item.id,
      name: item.name,
    }))
  }
}

async function getDivisions() {
  const { data, error } = await tenantSelect('divisions', 'id, name')
  if (!error) {
    divisions.value = (data || []).map((item) => ({
      label: item.name,
      value: item.id,
      name: item.name,
    }))
  }
}

async function getPositions() {
  const { data, error } = await tenantSelect('positions', 'id, name')
  if (!error) {
    positions.value = (data || []).map((item) => ({
      label: item.name,
      value: item.id,
      name: item.name,
    }))
  }
}

async function getLevels() {
  const { data, error } = await tenantSelect('levels', 'id, name')
  if (!error) {
    levels.value = (data || []).map((item) => ({
      label: item.name,
      value: item.id,
      name: item.name,
    }))
  }
}

// ----- JABATAN & IZIN -----
async function getModules() {
  const { data, error } = await supabase.from('modules').select('*')
  if (!error) {
    modules.value = data || []
  }
}

async function getPermissionsForPosition(positionId) {
  const { data, error } = await supabase
    .from('position_permissions')
    .select('module_id, can_view, can_edit')
    .eq('position_id', positionId)

  if (!error) return data || []
  return []
}

function openPositionDialog() {
  resetPositionForm()
  isEditMode.value = false
  // default: semua izin OFF
  modulesWithPermissions.value = (modules.value || []).map((m) => ({
    ...m,
    can_view: false,
    can_edit: false,
  }))
  showPositionDialog.value = true
}

async function editPosition(position) {
  resetPositionForm()
  isEditMode.value = true
  // posisi.id disimpan di value
  positionForm.value = { ...position, id: position.value }

  const existingPermissions = await getPermissionsForPosition(position.value)

  // Penting: samakan tipe id saat mencocokkan (hindari mismatch number/string/uuid)
  modulesWithPermissions.value = (modules.value || []).map((m) => {
    const permission = existingPermissions.find((p) => String(p.module_id) === String(m.id))
    return {
      ...m,
      can_view: Boolean(permission?.can_view),
      can_edit: Boolean(permission?.can_edit),
    }
  })

  showPositionDialog.value = true
}

async function savePosition() {
  formLoading.value = true
  if (!positionForm.value.name) {
    $q.notify({ type: 'negative', message: 'Nama jabatan tidak boleh kosong.' })
    formLoading.value = false
    return
  }

  const payload = {
    name: positionForm.value.name,
    company_id: activeCompanyId.value,
  }
  let positionId = positionForm.value.id

  try {
    if (isEditMode.value) {
      const { error } = await supabase
        .from('positions')
        .update(payload)
        .eq('id', positionForm.value.id)
        .eq('company_id', activeCompanyId.value)
      if (error) throw error
    } else {
      // FIX KRUSIAL: Supabase insert tidak mengembalikan data tanpa .select()
      const { data, error } = await supabase.from('positions').insert(payload).select('id').single()
      if (error) throw error
      positionId = data.id
    }

    // susun payload izin dari state UI
    const permissionsPayload = (modulesWithPermissions.value || [])
      .filter((m) => m.can_view || m.can_edit)
      .map((m) => ({
        position_id: positionId,
        module_id: m.id,
        can_view: !!m.can_view,
        can_edit: !!m.can_edit,
      }))

    // clear dulu supaya idempotent
    const { error: deleteError } = await supabase
      .from('position_permissions')
      .delete()
      .eq('position_id', positionId)
    if (deleteError) throw deleteError

    if (permissionsPayload.length > 0) {
      const { error: insertError } = await supabase
        .from('position_permissions')
        .insert(permissionsPayload)
      if (insertError) throw insertError
    }

    $q.notify({ type: 'positive', message: 'Jabatan berhasil disimpan.' })
    resetPositionForm()
    await getPositions()
  } catch (err) {
    console.error('Error saat menyimpan jabatan:', err)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan jabatan: ' + err.message })
  } finally {
    formLoading.value = false
  }
}

async function deletePosition(position) {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus jabatan "${position.name}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const { count: employeeCount, error: employeeError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('position_id', position.value)
      if (employeeError) throw employeeError

      if (employeeCount > 0) {
        throw new Error(
          'Ada karyawan yang masih terhubung dengan jabatan ini. Mohon ubah jabatan tersebut terlebih dahulu.',
        )
      }

      const { error: permissionsError } = await supabase
        .from('position_permissions')
        .delete()
        .eq('position_id', position.value)
      if (permissionsError) throw permissionsError

      const { error: positionError } = await supabase
        .from('positions')
        .delete()
        .eq('id', position.value)
        .eq('company_id', activeCompanyId.value)
      if (positionError) throw positionError

      $q.notify({ type: 'positive', message: 'Jabatan berhasil dihapus.' })
      await getPositions()
    } catch (err) {
      console.error('Error saat menghapus jabatan:', err)
      $q.notify({ type: 'negative', message: 'Gagal menghapus jabatan: ' + err.message })
    }
  })
}

const resetPositionForm = () => {
  positionForm.value = { id: null, name: '' }
  showPositionDialog.value = false
  isEditMode.value = false
  modulesWithPermissions.value = []
}
// ----- AKHIR JABATAN & IZIN -----

function getCategoryName(table) {
  switch (table) {
    case 'genders':
      return 'Jenis Kelamin'
    case 'divisions':
      return 'Divisi'
    case 'positions':
      return 'Jabatan'
    case 'levels':
      return 'Status Kepegawaian'
    default:
      return 'Kategori'
  }
}

function openCategoryDialog(table) {
  if (table === 'positions') {
    openPositionDialog()
  } else {
    resetCategoryForm()
    isEditMode.value = false
    currentTable.value = table
    showCategoryDialog.value = true
  }
}

function editCategory(row, table) {
  if (table === 'positions') {
    editPosition(row)
  } else {
    isEditMode.value = true
    currentTable.value = table
    categoryForm.value = { ...row, id: row.value }
    showCategoryDialog.value = true
  }
}

async function saveCategory() {
  formLoading.value = true
  if (!categoryForm.value.name) {
    $q.notify({ type: 'negative', message: 'Nama tidak boleh kosong.' })
    formLoading.value = false
    return
  }

  const payload = {
    name: categoryForm.value.name,
    company_id: activeCompanyId.value,
  }

  try {
    if (isEditMode.value) {
      const { error } = await supabase
        .from(currentTable.value)
        .update(payload)
        .eq('id', categoryForm.value.id)
        .eq('company_id', activeCompanyId.value)
      if (error) throw error
    } else {
      const { error } = await tenantInsert(currentTable.value, payload)
      if (error) throw error
    }

    $q.notify({ type: 'positive', message: 'Kategori berhasil disimpan.' })
    resetCategoryForm()
    await getCategoryData()
  } catch (err) {
    console.error('Error saat menyimpan kategori:', err)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan kategori: ' + err.message })
  } finally {
    formLoading.value = false
  }
}

async function deleteCategory(row, table) {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus kategori "${row.label}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', row.value)
        .eq('company_id', activeCompanyId.value)
      if (error) throw error

      $q.notify({ type: 'positive', message: 'Kategori berhasil dihapus.' })
      await getCategoryData()
    } catch (err) {
      console.error('Error saat menghapus kategori:', err)
      $q.notify({ type: 'negative', message: 'Gagal menghapus kategori: ' + err.message })
    }
  })
}

function resetCategoryForm() {
  categoryForm.value = { id: null, name: '' }
  showCategoryDialog.value = false
}
</script>
