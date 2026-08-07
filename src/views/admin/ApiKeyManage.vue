<template>
  <div class="page-wrapper">
    <div class="page-title">API 密钥管理</div>
    <el-card class="box" shadow="hover" style="display: flex; flex-direction: column; overflow: hidden;">
      <div class="toolbar" style="flex-shrink: 0;">
        <el-button type="success" icon="Plus" @click="openCreate">创建密钥</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe width="100%" style="flex: 1; min-height: 0;">
        <el-table-column prop="id" label="ID" v-if="false" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="keyPrefix" label="密钥前缀" />
        <el-table-column prop="scopes" label="权限范围" show-overflow-tooltip />
        <el-table-column prop="rateLimitQps" label="QPS限制" />
        <el-table-column prop="dailyQuota" label="日配额" />
        <el-table-column label="最后使用">
          <template #default="{ row }">{{ formatDateTime(row.lastUsedTime) || '从未' }}</template>
        </el-table-column>
        <el-table-column label="过期时间">
          <template #default="{ row }">{{ formatDateTime(row.expireTime) || '永不过期' }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="warning" @click="toggleStatus(row)">{{ row.status === 1 ? '停用' : '启用' }}</el-button>
            <el-button link type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pg" v-model:page-size="size" v-model:current-page="page" :page-sizes="[10,20,50,100]" layout="total, sizes, prev, pager, next, jumper" :total="total" background @current-change="load" @size-change="sizeChange" style="flex-shrink: 0; justify-content: flex-end;" />
    </el-card>
    <el-dialog v-model="dlg" title="创建 API 密钥" width="480px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称"><el-input v-model="form.name" placeholder="如：生产环境密钥" /></el-form-item>
        <el-form-item label="权限范围"><el-input v-model="form.scopes" placeholder="如：read,write" /></el-form-item>
        <el-form-item label="QPS限制"><el-input-number v-model="form.rateLimitQps" :min="0" /></el-form-item>
        <el-form-item label="日配额"><el-input-number v-model="form.dailyQuota" :min="0" /></el-form-item>
        <el-form-item label="过期时间"><el-date-picker v-model="form.expireTime" type="datetime" placeholder="留空=永不过期" style="width:100%;" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="save">创建</el-button></template>
    </el-dialog>
    <el-dialog v-model="plainKeyDlg" title="密钥已创建" width="520px">
      <el-alert type="warning" :closable="false" show-icon style="margin-bottom:16px;">
        请立即复制以下密钥，关闭后将无法再次查看！
      </el-alert>
      <el-input v-model="plainKey" readonly>
        <template #append>
          <el-button @click="copyKey">复制</el-button>
        </template>
      </el-input>
      <template #footer><el-button type="primary" @click="plainKeyDlg=false">我已复制</el-button></template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { createApiKey, fetchApiKeys, toggleApiKeyStatus, deleteApiKey } from '../../api/apiKey'
import { formatDateTime } from '../../utils/date'
import { ApiKey } from '../../data/platform/ApiKey'

const loading = ref(false)
const list = ref<ApiKey[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const dlg = ref(false)
const form = ref<Record<string, any>>({})
const plainKeyDlg = ref(false)
const plainKey = ref('')

const load = async () => {
  loading.value = true
  try {
    const r = await fetchApiKeys({ page: page.value, size: size.value })
    list.value = r.data || []
    total.value = r['total'] || 0
    page.value = r['page'] || 1
    size.value = r['size'] || 10
  } finally { loading.value = false }
}

const sizeChange = () => {
  page.value = 1
  load()
}

function openCreate() {
  form.value = { name: '', scopes: '', rateLimitQps: 0, dailyQuota: 0 }
  dlg.value = true
}

const save = async () => {
  const res = await createApiKey(form.value)
  dlg.value = false
  if (res.data?.plainKey) {
    plainKey.value = res.data.plainKey
    plainKeyDlg.value = true
  }
  await load()
}

const toggleStatus = async (r: ApiKey) => {
  const newStatus = r.status === 1 ? 0 : 1
  await toggleApiKeyStatus(Number(r.id), newStatus)
  await load()
}

const del = async (r: ApiKey) => {
  await ElMessageBox.confirm('确定删除此密钥？删除后不可恢复。', '警告')
  await deleteApiKey(Number(r.id))
  await load()
}

function copyKey() {
  navigator.clipboard.writeText(plainKey.value)
  ElMessage.success('已复制到剪贴板')
}

onMounted(load)
</script>

<style scoped>
.page-wrapper { display: flex; flex-direction: column; height: 100%; }
.page-title { font-size: 20px; font-weight: bold; margin-bottom: 16px; flex-shrink: 0; }
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; }
.box { border-radius: 16px; flex: 1; min-height: 0; }
.box :deep(.el-card__body) { display: flex; flex-direction: column; height: 100%; padding: 20px; box-sizing: border-box; }
</style>
