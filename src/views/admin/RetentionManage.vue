<template>
  <div>
    <div class="page-title">数据保留策略</div>
    <el-card class="box" shadow="hover" style="height: 91vh;">
      <div class="toolbar">
        <el-button type="success" icon="Plus" @click="openCreate">新增策略</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe width="100%" style="height: 81vh;">
        <el-table-column prop="id" label="ID" v-if="false" />
        <el-table-column prop="tableName" label="目标表" />
        <el-table-column prop="retentionDays" label="保留天数" />
        <el-table-column prop="archiveEnabled" label="归档">
          <template #default="{ row }">{{ row.archiveEnabled === 1 ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column label="上次清理">
          <template #default="{ row }">{{ formatDateTime(row.lastCleanupTime) || '未执行' }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">{{ row.status === 1 ? '启用' : '停用' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="warning" @click="cleanup(row)">手动清理</el-button>
            <el-button link type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pg" v-model:page-size="size" v-model:current-page="page" :page-sizes="[10,20,50,100]" layout="total, sizes, prev, pager, next, jumper" :total="total" background @current-change="load" @size-change="sizeChange" style="flex-shrink: 0;" />
    </el-card>
    <el-dialog v-model="dlg" title="数据保留策略" width="420px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="目标表名"><el-input v-model="form.tableName" placeholder="如 t_chat_message" /></el-form-item>
        <el-form-item label="保留天数"><el-input-number v-model="form.retentionDays" :min="1" /></el-form-item>
        <el-form-item label="先归档"><el-switch v-model="form.archiveEnabled" :active-value="1" :inactive-value="0" /></el-form-item>
        <el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { fetchRetentionPolicyPage, saveRetentionPolicy, deleteRetentionPolicy, triggerCleanup } from '../../api/retention'
import { formatDateTime } from '../../utils/date'
import { DataRetentionPolicy } from '../../data/retention/DataRetentionPolicy'

const loading = ref(false); const list = ref<DataRetentionPolicy[]>([]); const total = ref(0); const page = ref(1); const size = ref(10)
const dlg = ref(false); const form = ref<DataRetentionPolicy>({})

const load = async () => { loading.value=true; try { const r=await fetchRetentionPolicyPage({page:page.value,size:size.value,condition:{}}); list.value=r.data; total.value=Number(r['total'])||0 } finally {loading.value=false} }
function openCreate() { form.value={retentionDays:90,archiveEnabled:0,status:1}; dlg.value=true }
const save = async () => { await saveRetentionPolicy(form.value); dlg.value=false; await load() }
const del = async (r:DataRetentionPolicy) => { await ElMessageBox.confirm('确定删除？','提示'); await deleteRetentionPolicy(Number(r.id)); await load() }
const cleanup = async (r:DataRetentionPolicy) => { await ElMessageBox.confirm(`确定手动清理「${r.tableName}」？`,'提示'); const res=await triggerCleanup(Number(r.id)); ElMessage.success(res.data||'清理完成'); await load() }
const sizeChange = (v:number) => { size.value=Number(v); load() }
onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; }
.box { border-radius: 16px; }
.pg { margin-top: 16px; justify-content: flex-end; }
</style>
