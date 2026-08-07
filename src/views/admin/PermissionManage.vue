<template>
  <div>
    <div class="page-title">知识库权限</div>
    <el-card class="box" shadow="hover" style="height: 91vh;">
      <div class="toolbar">
        <el-button type="success" icon="Plus" @click="openGrant">新增授权</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe width="100%" style="height: 81vh;">
        <el-table-column prop="id" label="ID" v-if="false" />
        <el-table-column prop="categoryId" label="分类ID" />
        <el-table-column prop="targetType" label="对象类型" />
        <el-table-column prop="targetId" label="对象ID" />
        <el-table-column prop="permission" label="权限">
          <template #default="{ row }">
            <el-tag :type="row.permission === 'MANAGE' ? 'danger' : row.permission === 'WRITE' ? 'warning' : 'success'" size="small">{{ row.permission }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="revoke(row)">撤销</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pg" v-model:page-size="size" v-model:current-page="page" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total" background @current-change="load" @size-change="sizeChange" />
    </el-card>
    <el-dialog v-model="dlg" title="新增授权" width="420px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="分类ID"><el-input-number v-model="form.categoryId" :min="1" /></el-form-item>
        <el-form-item label="对象类型">
          <el-select v-model="form.targetType">
            <el-option label="用户" value="USER" /><el-option label="角色" value="ROLE" /><el-option label="所有人" value="ALL" />
          </el-select>
        </el-form-item>
        <el-form-item label="对象ID"><el-input-number v-model="form.targetId" :min="0" /></el-form-item>
        <el-form-item label="权限">
          <el-select v-model="form.permission">
            <el-option label="只读" value="READ" /><el-option label="读写" value="WRITE" /><el-option label="管理" value="MANAGE" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg = false">取消</el-button>
        <el-button type="primary" @click="save">授权</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { fetchPermissionPage, grantPermission, revokePermission } from '../../api/kbPermission'
import { formatDateTime } from '../../utils/date'
import { KbPermission } from '../../data/permission/KbPermission'

const loading = ref(false)
const list = ref<KbPermission[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const dlg = ref(false)
const form = ref<KbPermission>({})

const load = async () => {
  loading.value = true
  try {
    const res = await fetchPermissionPage({ page: page.value, size: size.value, condition: {} })
    list.value = res.data; total.value = Number(res['total']) || 0
  } finally { loading.value = false }
}
function openGrant() { form.value = { targetType: 'USER', permission: 'READ' }; dlg.value = true }
const save = async () => { await grantPermission(form.value); dlg.value = false; await load() }
const revoke = async (row: KbPermission) => { await ElMessageBox.confirm('确定撤销此权限？', '提示'); await revokePermission(Number(row.id)); await load() }
const sizeChange = (val: number) => { size.value = Number(val); load() }
onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; }
.box { border-radius: 16px; }
.pg { margin-top: 16px; justify-content: flex-end; }
</style>
