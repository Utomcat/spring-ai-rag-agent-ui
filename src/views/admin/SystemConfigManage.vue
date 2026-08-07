<template>
  <div>
    <div class="page-title">系统配置</div>
    <el-card class="box" shadow="hover" style="height: 91vh;">
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="搜索配置键/说明" clearable style="width: 8vw;" @clear="load" />
        <el-button type="primary" @click="() => { page = 1; load() }">查询</el-button>
        <el-button type="success" icon="Plus" @click="openCreate">新增配置</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe width="100%" style="height: 81vh;">
        <el-table-column prop="id" label="ID" v-if="false" />
        <el-table-column prop="configGroup" label="分组" />
        <el-table-column prop="configKey" label="配置键" show-overflow-tooltip />
        <el-table-column prop="configValue" label="配置值" show-overflow-tooltip />
        <el-table-column prop="valueType" label="值类型" />
        <el-table-column prop="description" label="说明" show-overflow-tooltip />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">{{ row.status === 1 ? '启用' : '停用' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pg" v-model:page-size="size" v-model:current-page="page" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total" background @current-change="load" @size-change="sizeChange" />
    </el-card>
    <el-dialog v-model="dlg" title="系统配置" width="520px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="分组"><el-input v-model="form.configGroup" /></el-form-item>
        <el-form-item label="配置键"><el-input v-model="form.configKey" /></el-form-item>
        <el-form-item label="配置值"><el-input v-model="form.configValue" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="值类型">
          <el-select v-model="form.valueType">
            <el-option label="STRING" value="STRING" /><el-option label="NUMBER" value="NUMBER" /><el-option label="BOOLEAN" value="BOOLEAN" /><el-option label="JSON" value="JSON" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明"><el-input v-model="form.description" /></el-form-item>
        <el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { fetchSystemConfigPage, saveSystemConfig, deleteSystemConfig } from '../../api/systemConfig'
import { SystemConfig } from '../../data/systemConfig/SystemConfig'

const loading = ref(false)
const list = ref<SystemConfig[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const keyword = ref('')
const dlg = ref(false)
const form = ref<SystemConfig>({})

const load = async () => {
  loading.value = true
  try {
    const res = await fetchSystemConfigPage({ page: page.value, size: size.value, condition: { keyword: keyword.value } })
    list.value = res.data; total.value = Number(res['total']) || 0
  } finally { loading.value = false }
}
function openCreate() { form.value = { configGroup: 'DEFAULT', valueType: 'STRING', status: 1 }; dlg.value = true }
function openEdit(row: SystemConfig) { form.value = { ...row }; dlg.value = true }
const save = async () => { await saveSystemConfig(form.value); dlg.value = false; await load() }
const del = async (row: SystemConfig) => { await ElMessageBox.confirm(`确定删除配置「${row.configKey}」？`, '提示'); await deleteSystemConfig(Number(row.id)); await load() }
const sizeChange = (val: number) => { size.value = Number(val); load() }
onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.box { border-radius: 16px; }
.pg { margin-top: 16px; justify-content: flex-end; }
</style>
