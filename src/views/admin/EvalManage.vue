<template>
  <div class="page-wrapper">
    <div class="page-title">评估体系</div>
    <el-card class="box" shadow="hover" style="display: flex; flex-direction: column; overflow: hidden;">
      <el-tabs v-model="activeTab" class="eval-tabs" style="flex: 1; min-height: 0; display: flex; flex-direction: column;">
        <el-tab-pane label="数据集" name="dataset" style="flex: 1; min-height: 0; display: flex; flex-direction: column; height: 100%;">
          <div class="toolbar" style="flex-shrink: 0;">
            <el-button type="success" icon="Plus" @click="openDatasetDlg">新增条目</el-button>
          </div>
          <el-table :data="datasets" v-loading="loading" stripe width="100%" style="flex: 1; min-height: 0;">
            <el-table-column prop="id" label="ID" v-if="false" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="question" label="问题" show-overflow-tooltip />
            <el-table-column prop="difficulty" label="难度" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">{{ row.status === 1 ? '启用' : '停用' }}</template>
            </el-table-column>
            <el-table-column label="操作" width="240">
              <template #default="{ row }"><el-button link type="danger" @click="delDataset(row)">删除</el-button></template>
            </el-table-column>
          </el-table>
          <el-pagination class="pg" v-model:page-size="dsSize" v-model:current-page="dsPage" :page-sizes="[10,20,50,100]" layout="total, sizes, prev, pager, next, jumper" :total="dsTotal" background @current-change="loadDatasets" @size-change="loadDatasets" style="flex-shrink: 0;" />
        </el-tab-pane>
        <el-tab-pane label="评估任务" name="task" style="flex: 1; min-height: 0; display: flex; flex-direction: column; height: 100%;">
          <div class="toolbar" style="flex-shrink: 0;">
            <el-button type="success" icon="Plus" @click="openTaskDlg">创建任务</el-button>
          </div>
          <el-table :data="tasks" v-loading="loading" stripe width="100%" style="flex: 1; min-height: 0;">
            <el-table-column prop="id" label="ID" v-if="false" />
            <el-table-column prop="taskName" label="任务名称" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }"><el-tag :type="row.status==='COMPLETED'?'success':row.status==='FAILED'?'danger':row.status==='RUNNING'?'warning':'info'" size="small">{{ row.status }}</el-tag></template>
            </el-table-column>
            <el-table-column label="进度">
              <template #default="{ row }">{{ row.completedCount || 0 }}/{{ row.totalCount || 0 }}</template>
            </el-table-column>
            <el-table-column label="创建时间"><template #default="{ row }">{{ formatDateTime(row.createTime) }}</template></el-table-column>
            <el-table-column label="操作" width="240">
              <template #default="{ row }">
                <el-button link type="primary" @click="viewMetrics(row)">指标</el-button>
                <el-button link type="danger" @click="delTask(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination class="pg" v-model:page-size="tkSize" v-model:current-page="tkPage" :page-sizes="[10,20,50,100]" layout="total, sizes, prev, pager, next, jumper" :total="tkTotal" background @current-change="loadTasks" @size-change="loadTasks" style="flex-shrink: 0;" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog v-model="dsDlg" title="数据集条目" width="520px" destroy-on-close>
      <el-form :model="dsForm" label-width="100px">
        <el-form-item label="名称"><el-input v-model="dsForm.name" /></el-form-item>
        <el-form-item label="问题"><el-input v-model="dsForm.question" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="标准答案"><el-input v-model="dsForm.expectedAnswer" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="期望文档ID"><el-input v-model="dsForm.expectedDocIds" placeholder="JSON数组" /></el-form-item>
        <el-form-item label="难度"><el-select v-model="dsForm.difficulty"><el-option label="简单" value="EASY" /><el-option label="普通" value="NORMAL" /><el-option label="困难" value="HARD" /></el-select></el-form-item>
        <el-form-item label="标签"><el-input v-model="dsForm.tags" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dsDlg=false">取消</el-button><el-button type="primary" @click="saveDs">保存</el-button></template>
    </el-dialog>
    <el-dialog v-model="tkDlg" title="创建评估任务" width="420px" destroy-on-close>
      <el-form :model="tkForm" label-width="100px">
        <el-form-item label="任务名称"><el-input v-model="tkForm.taskName" /></el-form-item>
        <el-form-item label="数据集ID"><el-input-number v-model="tkForm.datasetId" :min="0" /><span style="margin-left:8px;color:#94a3b8;">0=全量</span></el-form-item>
      </el-form>
      <template #footer><el-button @click="tkDlg=false">取消</el-button><el-button type="primary" @click="saveTask">创建</el-button></template>
    </el-dialog>
    <el-dialog v-model="metricsDlg" title="评估指标" width="500px">
      <pre style="white-space:pre-wrap;font-size:13px;">{{ metricsData }}</pre>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { fetchDatasetPage, saveDataset, deleteDataset, fetchTaskPage, createTask, deleteTask, fetchMetrics } from '../../api/eval'
import { formatDateTime } from '../../utils/date'
import { EvalDataset } from '../../data/eval/EvalDataset'
import { EvalTask } from '../../data/eval/EvalTask'

const activeTab = ref('dataset')
const loading = ref(false)
const datasets = ref<EvalDataset[]>([])
const dsTotal = ref(0); const dsPage = ref(1); const dsSize = ref(10)
const dsDlg = ref(false); const dsForm = ref<EvalDataset>({})
const tasks = ref<EvalTask[]>([])
const tkTotal = ref(0); const tkPage = ref(1); const tkSize = ref(10)
const tkDlg = ref(false); const tkForm = ref<EvalTask>({})
const metricsDlg = ref(false); const metricsData = ref('')

const loadDatasets = async () => { loading.value = true; try { const r = await fetchDatasetPage({ page: dsPage.value, size: dsSize.value, condition: {} }); datasets.value = r.data?.records || r.data || []; dsTotal.value = Number(r.data?.total || r['total'] || 0) } finally { loading.value = false } }
const openDatasetDlg = () => { dsForm.value = { difficulty: 'NORMAL', status: 1 }; dsDlg.value = true }
const saveDs = async () => { await saveDataset(dsForm.value); dsDlg.value = false; await loadDatasets() }
const delDataset = async (r: EvalDataset) => { await ElMessageBox.confirm('确定删除？', '提示'); await deleteDataset(Number(r.id)); await loadDatasets() }

const loadTasks = async () => { loading.value = true; try { const r = await fetchTaskPage({ page: tkPage.value, size: tkSize.value, condition: {} }); tasks.value = r.data?.records || r.data || []; tkTotal.value = Number(r.data?.total || r['total'] || 0) } finally { loading.value = false } }
const openTaskDlg = () => { tkForm.value = { taskName: '', datasetId: 0 }; tkDlg.value = true }
const saveTask = async () => { await createTask(tkForm.value); tkDlg.value = false; await loadTasks() }
const delTask = async (r: EvalTask) => { await ElMessageBox.confirm('确定删除？', '提示'); await deleteTask(Number(r.id)); await loadTasks() }
const viewMetrics = async (r: EvalTask) => { const res = await fetchMetrics(Number(r.id)); metricsData.value = JSON.stringify(res.data, null, 2); metricsDlg.value = true }

watch(activeTab, (v) => { if (v === 'dataset') loadDatasets(); else loadTasks() })
onMounted(loadDatasets)
</script>

<style scoped>
.page-wrapper { display: flex; flex-direction: column; height: 100%; }
.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  flex-shrink: 0;
}
.box { margin-bottom: 0; border-radius: 16px; flex: 1; min-height: 0; }
.box :deep(.el-card__body) { display: flex; flex-direction: column; height: 100%; padding: 20px; box-sizing: border-box; }
.eval-tabs :deep(.el-tabs__content) { overflow: visible; }
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.pg { justify-content: flex-end; }
</style>
