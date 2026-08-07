<template>
  <div>
    <div class="page-title">租户管理</div>
    <el-card class="box" shadow="hover" style="height: 91vh;">
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="搜索租户名称/编码" clearable style="width: 8vw;" @clear="load" />
        <el-button type="primary" @click="() => { page = 1; load() }">查询</el-button>
        <el-button type="success" icon="Plus" @click="openCreate">新增租户</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe width="100%" style="height: 81vh;">
        <el-table-column prop="id" label="ID" v-if="false" />
        <el-table-column prop="name" label="租户名称" />
        <el-table-column prop="code" label="编码" />
        <el-table-column prop="plan" label="套餐" />
        <el-table-column prop="maxUsers" label="用户上限" />
        <el-table-column prop="maxStorageMb" label="存储(MB)" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">{{ row.status === 1 ? '正常' : '禁用' }}</template>
        </el-table-column>
        <el-table-column label="到期时间">
          <template #default="{ row }">{{ formatDateTime(row.expireTime) || '永不过期' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pg" v-model:page-size="size" v-model:current-page="page" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total" background @current-change="load" @size-change="sizeChange" />
    </el-card>
    <el-dialog v-model="dlg" title="租户信息" width="520px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="租户名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="编码"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="联系人"><el-input v-model="form.contactName" /></el-form-item>
        <el-form-item label="联系邮箱"><el-input v-model="form.contactEmail" /></el-form-item>
        <el-form-item label="套餐">
          <el-select v-model="form.plan">
            <el-option label="免费版" value="FREE" /><el-option label="标准版" value="STANDARD" /><el-option label="企业版" value="ENTERPRISE" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户上限"><el-input-number v-model="form.maxUsers" :min="1" /></el-form-item>
        <el-form-item label="存储(MB)"><el-input-number v-model="form.maxStorageMb" :min="1" /></el-form-item>
        <el-form-item label="每日Token"><el-input-number v-model="form.maxDailyTokens" :min="1" /></el-form-item>
        <el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
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
import { fetchTenantPage, saveTenant, deleteTenant } from '../../api/tenant'
import { formatDateTime } from '../../utils/date'
import { Tenant } from '../../data/tenant/Tenant'

const loading = ref(false)
const list = ref<Tenant[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const keyword = ref('')
const dlg = ref(false)
const form = ref<Tenant>({})

const load = async () => {
  loading.value = true
  try {
    const res = await fetchTenantPage({ page: page.value, size: size.value, condition: { keyword: keyword.value } })
    list.value = res.data; total.value = Number(res['total']) || 0
  } finally { loading.value = false }
}
function openCreate() { form.value = { plan: 'FREE', status: 1, maxUsers: 10, maxStorageMb: 1024, maxDailyTokens: 100000 }; dlg.value = true }
const save = async () => { await saveTenant(form.value); dlg.value = false; await load() }
const del = async (row: Tenant) => { await ElMessageBox.confirm(`确定删除租户「${row.name}」？`, '提示'); await deleteTenant(Number(row.id)); await load() }
const sizeChange = (val: number) => { size.value = Number(val); load() }
onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.box { border-radius: 16px; }
.pg { margin-top: 16px; justify-content: flex-end; }
</style>
