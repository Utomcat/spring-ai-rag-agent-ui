<template>
  <div>
    <div class="page-title">入库任务</div>
    <el-card class="box" shadow="hover" style="height: 91vh;">
      <div class="toolbar">
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px;" @clear="load">
          <el-option label="等待中" value="PENDING" />
          <el-option label="运行中" value="RUNNING" />
          <el-option label="成功" value="SUCCESS" />
          <el-option label="失败" value="FAIL" />
        </el-select>
        <el-button type="primary" @click="() => { page = 1; load() }">查询</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe width="100%" style="height: 81vh;">
        <el-table-column prop="jobId" label="ID" v-if="false" />
        <el-table-column prop="batchId" label="批次ID" show-overflow-tooltip />
        <el-table-column prop="documentTitle" label="文档标题" show-overflow-tooltip />
        <el-table-column prop="jobType" label="类型" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度">
          <template #default="{ row }">
            <el-progress :percentage="row.progress || 0" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column prop="vectorCount" label="向量块" />
        <el-table-column label="创建时间">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="warning" :disabled="row.status !== 'FAIL'" @click="retry(row)">重试</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pg"
        v-model:page-size="size"
        v-model:current-page="page"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        @current-change="load"
        @size-change="sizeChange"
      />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { fetchIngestJobPage, retryIngestJob } from '../../api/document'
import { formatDateTime } from '../../utils/date'
import { IngestJob } from '../../data/document/IngestJob'

const loading = ref(false)
const list = ref<IngestJob[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const statusFilter = ref('')

function statusTagType(status: string) {
  const map: Record<string, string> = { PENDING: 'info', RUNNING: 'warning', SUCCESS: 'success', FAIL: 'danger' }
  return map[status] || 'info'
}

const load = async () => {
  loading.value = true
  try {
    const res = await fetchIngestJobPage({
      page: Number(page.value),
      size: Number(size.value),
      condition: { status: statusFilter.value || undefined }
    })
    list.value = res.data
    total.value = Number(res['total']) || 0
  } finally {
    loading.value = false
  }
}

const retry = async (row: IngestJob) => {
  await ElMessageBox.confirm(`确定重试任务 #${row.jobId}？`, '提示')
  await retryIngestJob(Number(row.jobId))
  ElMessage.success('已提交重试')
  await load()
}

const sizeChange = (val: number) => { size.value = Number(val); load() }
onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.box { border-radius: 16px; }
.pg { margin-top: 16px; justify-content: flex-end; }
</style>
