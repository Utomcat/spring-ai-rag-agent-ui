<template>
  <div class="page-wrapper">
    <div class="page-title">Webhook 管理</div>
    <el-card class="box" shadow="hover" style="display: flex; flex-direction: column; overflow: hidden;">
      <el-tabs v-model="activeTab" class="webhook-tabs" style="flex: 1; min-height: 0; display: flex; flex-direction: column;">
        <el-tab-pane label="订阅配置" name="config" style="flex: 1; min-height: 0; display: flex; flex-direction: column; height: 100%;">
          <div class="toolbar" style="flex-shrink: 0;">
            <el-button type="success" icon="Plus" @click="openConfigDlg">新增配置</el-button>
            <el-button type="primary" icon="Promotion" @click="openPublishDlg">手动发布</el-button>
          </div>
          <el-table :data="configs" v-loading="loading" stripe width="100%" style="flex: 1; min-height: 0;">
            <el-table-column prop="id" label="ID" v-if="false" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="targetUrl" label="推送地址" show-overflow-tooltip />
            <el-table-column prop="eventTypes" label="事件类型" show-overflow-tooltip />
            <el-table-column prop="timeoutMs" label="超时(ms)" />
            <el-table-column prop="maxRetry" label="最大重试" />
            <el-table-column label="上次触发">
              <template #default="{ row }">{{ formatDateTime(row.lastTriggerTime) || '未触发' }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="{ row }">
                <el-button link type="warning" @click="toggleConfig(row)">{{ row.status === 1 ? '停用' : '启用' }}</el-button>
                <el-button link type="danger" @click="delConfig(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination class="pg" v-model:page-size="cfgSize" v-model:current-page="cfgPage" :page-sizes="[10,20,50,100]" layout="total, sizes, prev, pager, next, jumper" :total="cfgTotal" background @current-change="loadConfigs" @size-change="loadConfigs" style="flex-shrink: 0;" />
        </el-tab-pane>
        <el-tab-pane label="推送日志" name="log" style="flex: 1; min-height: 0; display: flex; flex-direction: column; height: 100%;">
          <div class="toolbar" style="flex-shrink: 0;">
            <el-select v-model="logFilter.status" placeholder="状态" clearable style="width: 120px;" @change="() => { logPage=1; loadLogs() }">
              <el-option label="成功" value="SUCCESS" /><el-option label="失败" value="FAIL" /><el-option label="重试中" value="RETRYING" /><el-option label="等待" value="PENDING" />
            </el-select>
            <el-button type="primary" @click="() => { logPage=1; loadLogs() }">查询</el-button>
          </div>
          <el-table :data="logs" v-loading="loading" stripe width="100%" style="flex: 1; min-height: 0;">
            <el-table-column prop="id" label="ID" v-if="false" />
            <el-table-column prop="eventType" label="事件类型" />
            <el-table-column prop="bizId" label="业务ID" show-overflow-tooltip />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status==='SUCCESS'?'success':row.status==='FAIL'?'danger':row.status==='RETRYING'?'warning':'info'" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="httpStatus" label="HTTP" />
            <el-table-column prop="retryCount" label="重试" />
            <el-table-column label="推送时间">
              <template #default="{ row }">{{ formatDateTime(row.pushTime) }}</template>
            </el-table-column>
            <el-table-column prop="errorMsg" label="错误信息" show-overflow-tooltip />
          </el-table>
          <el-pagination class="pg" v-model:page-size="logSize" v-model:current-page="logPage" :page-sizes="[10,20,50,100]" layout="total, sizes, prev, pager, next, jumper" :total="logTotal" background @current-change="loadLogs" @size-change="loadLogs" style="flex-shrink: 0;" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog v-model="configDlg" title="Webhook 订阅配置" width="520px" destroy-on-close>
      <el-form :model="configForm" label-width="100px">
        <el-form-item label="名称"><el-input v-model="configForm.name" /></el-form-item>
        <el-form-item label="推送地址"><el-input v-model="configForm.targetUrl" placeholder="https://..." /></el-form-item>
        <el-form-item label="签名密钥"><el-input v-model="configForm.secret" placeholder="可选" /></el-form-item>
        <el-form-item label="事件类型"><el-input v-model="configForm.eventTypes" placeholder="如：DOC_UPLOADED,DOC_PARSED" /></el-form-item>
        <el-form-item label="自定义头"><el-input v-model="configForm.headers" placeholder='JSON，如 {"Authorization":"Bearer xxx"}' /></el-form-item>
        <el-form-item label="超时(ms)"><el-input-number v-model="configForm.timeoutMs" :min="1000" :max="30000" /></el-form-item>
        <el-form-item label="最大重试"><el-input-number v-model="configForm.maxRetry" :min="0" :max="10" /></el-form-item>
        <el-form-item label="状态"><el-switch v-model="configForm.status" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="configDlg=false">取消</el-button><el-button type="primary" @click="saveConfig">保存</el-button></template>
    </el-dialog>
    <el-dialog v-model="publishDlg" title="手动发布事件" width="420px" destroy-on-close>
      <el-form :model="publishForm" label-width="100px">
        <el-form-item label="事件类型"><el-input v-model="publishForm.eventType" placeholder="如：MANUAL_TEST" /></el-form-item>
        <el-form-item label="业务ID"><el-input v-model="publishForm.bizId" placeholder="可选" /></el-form-item>
        <el-form-item label="负载数据"><el-input v-model="publishForm.payload" type="textarea" :rows="4" placeholder="JSON" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="publishDlg=false">取消</el-button><el-button type="primary" @click="publish">发布</el-button></template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { saveWebhookConfig, fetchWebhookConfigs, toggleWebhookStatus, deleteWebhookConfig, fetchWebhookLogPage, manualPublish } from '../../api/webhook'
import { formatDateTime } from '../../utils/date'
import { WebhookConfig } from '../../data/platform/WebhookConfig'

const activeTab = ref('config')
const loading = ref(false)

const configs = ref<WebhookConfig[]>([])
const cfgTotal = ref(0); const cfgPage = ref(1); const cfgSize = ref(10)
const configDlg = ref(false)
const configForm = ref<WebhookConfig>({})

const logs = ref<any[]>([])
const logTotal = ref(0); const logPage = ref(1); const logSize = ref(10)
const logFilter = ref<{status:string}>({status:''})

const publishDlg = ref(false)
const publishForm = ref<Record<string, any>>({eventType:'',bizId:'',payload:''})

const loadConfigs = async () => {
  loading.value = true
  try { const r = await fetchWebhookConfigs({ page: cfgPage.value, size: cfgSize.value }); configs.value = r.data?.records || r.data || []; cfgTotal.value = Number(r.data?.total || r['total'] || 0) } finally { loading.value = false }
}
function openConfigDlg() { configForm.value = { status: 1, timeoutMs: 5000, maxRetry: 3 }; configDlg.value = true }
const saveConfig = async () => { await saveWebhookConfig(configForm.value); configDlg.value = false; ElMessage.success('保存成功'); await loadConfigs() }
const toggleConfig = async (r: WebhookConfig) => { await toggleWebhookStatus(Number(r.id), r.status === 1 ? 0 : 1); await loadConfigs() }
const delConfig = async (r: WebhookConfig) => { await ElMessageBox.confirm('确定删除？', '提示'); await deleteWebhookConfig(Number(r.id)); await loadConfigs() }

const loadLogs = async () => {
  loading.value = true
  try { const r = await fetchWebhookLogPage({ page: logPage.value, size: logSize.value, condition: logFilter.value }); logs.value = r.data?.records || r.data || []; logTotal.value = Number(r.data?.total || r['total'] || 0) } finally { loading.value = false }
}
const publish = async () => { await manualPublish(publishForm.value); publishDlg.value = false; ElMessage.success('事件已发布') }

watch(activeTab, v => { if (v === 'config') loadConfigs(); else loadLogs() })
onMounted(loadConfigs)
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
.webhook-tabs :deep(.el-tabs__content) { overflow: visible; }
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.pg { justify-content: flex-end; }
</style>
