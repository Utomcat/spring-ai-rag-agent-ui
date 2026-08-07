<template>
  <div class="page-wrapper">
    <div class="page-title">Agent 管理</div>
    <el-card class="box" shadow="hover" style="display: flex; flex-direction: column; overflow: hidden;">
      <el-tabs v-model="activeTab" class="agent-tabs" style="flex: 1; min-height: 0; display: flex; flex-direction: column;">
        <el-tab-pane label="执行链路" name="execution" style="flex: 1; min-height: 0; display: flex; flex-direction: column; height: 100%;">
          <div class="toolbar" style="flex-shrink: 0;">
            <el-input v-model="execFilter.agentName" placeholder="Agent名称" clearable style="width: 8vw;" />
            <el-select v-model="execFilter.status" placeholder="状态" clearable style="width: 120px;">
              <el-option label="成功" value="SUCCESS" /><el-option label="失败" value="FAIL" /><el-option label="超时" value="TIMEOUT" />
            </el-select>
            <el-button type="primary" @click="() => { execPage=1; loadExecutions() }">查询</el-button>
          </div>
          <el-table :data="executions" v-loading="loading" stripe width="100%" style="flex: 1; min-height: 0;">
            <el-table-column prop="id" label="ID" v-if="false" />
            <el-table-column prop="traceId" label="TraceID" show-overflow-tooltip />
            <el-table-column prop="agentName" label="Agent" />
            <el-table-column prop="executionType" label="类型" />
            <el-table-column prop="totalTokens" label="Token" />
            <el-table-column prop="durationMs" label="耗时(ms)" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }"><el-tag :type="row.status==='SUCCESS'?'success':'danger'" size="small">{{ row.status }}</el-tag></template>
            </el-table-column>
            <el-table-column label="时间"><template #default="{ row }">{{ formatDateTime(row.createTime) }}</template></el-table-column>
          </el-table>
          <el-pagination class="pg" v-model:page-size="execSize" v-model:current-page="execPage" :page-sizes="[10,20,50,100]" layout="total, sizes, prev, pager, next, jumper" :total="execTotal" background @current-change="loadExecutions" @size-change="loadExecutions" style="flex-shrink: 0;" />
        </el-tab-pane>
        <el-tab-pane label="长期记忆" name="memory" style="flex: 1; min-height: 0; display: flex; flex-direction: column; height: 100%;">
          <div class="toolbar" style="flex-shrink: 0;">
            <el-select v-model="memFilter.memoryType" placeholder="类型" clearable style="width: 120px;">
              <el-option label="偏好" value="PREFERENCE" /><el-option label="事实" value="FACT" /><el-option label="技能" value="SKILL" />
            </el-select>
            <el-button type="primary" @click="() => { memPage=1; loadMemories() }">查询</el-button>
            <el-button type="success" icon="Plus" @click="openMemDlg">新增</el-button>
          </div>
          <el-table :data="memories" v-loading="loading" stripe width="100%" style="flex: 1; min-height: 0;">
            <el-table-column prop="id" label="ID" v-if="false" />
            <el-table-column prop="userId" label="用户ID" />
            <el-table-column prop="memoryType" label="类型" />
            <el-table-column prop="content" label="内容" show-overflow-tooltip />
            <el-table-column prop="importance" label="重要度" />
            <el-table-column prop="accessCount" label="访问次数" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">{{ row.status === 1 ? '有效' : '失效' }}</template>
            </el-table-column>
            <el-table-column label="操作" width="240">
              <template #default="{ row }"><el-button link type="danger" @click="delMem(row)">删除</el-button></template>
            </el-table-column>
          </el-table>
          <el-pagination class="pg" v-model:page-size="memSize" v-model:current-page="memPage" :page-sizes="[10,20,50,100]" layout="total, sizes, prev, pager, next, jumper" :total="memTotal" background @current-change="loadMemories" @size-change="loadMemories" style="flex-shrink: 0;" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog v-model="memDlg" title="新增长期记忆" width="420px" destroy-on-close>
      <el-form :model="memForm" label-width="80px">
        <el-form-item label="用户ID"><el-input-number v-model="memForm.userId" :min="1" /></el-form-item>
        <el-form-item label="类型"><el-select v-model="memForm.memoryType"><el-option label="偏好" value="PREFERENCE" /><el-option label="事实" value="FACT" /><el-option label="技能" value="SKILL" /></el-select></el-form-item>
        <el-form-item label="内容"><el-input v-model="memForm.content" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="重要度"><el-input-number v-model="memForm.importance" :min="1" :max="5" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="memDlg=false">取消</el-button><el-button type="primary" @click="saveMem">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { fetchExecutionPage, fetchMemoryPage, saveMemory, deleteMemory } from '../../api/agent'
import { formatDateTime } from '../../utils/date'
import { AgentMemory } from '../../data/agent/AgentMemory'

const activeTab = ref('execution')
const loading = ref(false)
const executions = ref<any[]>([]); const execTotal = ref(0); const execPage = ref(1); const execSize = ref(10)
const execFilter = ref<{agentName:string;status:string}>({agentName:'',status:''})
const memories = ref<AgentMemory[]>([]); const memTotal = ref(0); const memPage = ref(1); const memSize = ref(10)
const memFilter = ref<{memoryType:string}>({memoryType:''})
const memDlg = ref(false); const memForm = ref<AgentMemory>({})

const loadExecutions = async () => { loading.value=true; try { const r=await fetchExecutionPage({page:execPage.value,size:execSize.value,condition:execFilter.value}); executions.value=r.data?.records||r.data||[]; execTotal.value=Number(r.data?.total||r['total']||0) } finally {loading.value=false} }
const loadMemories = async () => { loading.value=true; try { const r=await fetchMemoryPage({page:memPage.value,size:memSize.value,condition:memFilter.value}); memories.value=r.data?.records||r.data||[]; memTotal.value=Number(r.data?.total||r['total']||0) } finally {loading.value=false} }
function openMemDlg() { memForm.value={memoryType:'FACT',importance:1,status:1}; memDlg.value=true }
const saveMem = async () => { await saveMemory(memForm.value); memDlg.value=false; await loadMemories() }
const delMem = async (r:AgentMemory) => { await ElMessageBox.confirm('确定删除？','提示'); await deleteMemory(Number(r.id)); await loadMemories() }

watch(activeTab, v => { if(v==='execution') loadExecutions(); else loadMemories() })
onMounted(loadExecutions)
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
.agent-tabs :deep(.el-tabs__content) { overflow: visible; }
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.pg { justify-content: flex-end; }
</style>
