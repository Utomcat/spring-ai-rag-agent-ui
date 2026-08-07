<template>
  <div>
    <div class="page-title">模型配置</div>
    <el-card class="box" shadow="hover" style="height: 91vh;">
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="搜索模型名称" clearable style="width: 8vw;" @clear="load" />
        <el-button type="primary" @click="() => { page = 1; load() }">查询</el-button>
        <el-button type="success" icon="Plus" @click="openCreate">新增模型</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe width="100%" style="height: 81vh;">
        <el-table-column prop="id" label="ID" v-if="false" />
        <el-table-column prop="modelName" label="模型名称" />
        <el-table-column prop="provider" label="供应商" />
        <el-table-column prop="modelType" label="类型" />
        <el-table-column prop="inputPricePer1k" label="输入价(元/千Token)" />
        <el-table-column prop="outputPricePer1k" label="输出价(元/千Token)" />
        <el-table-column prop="isDefault" label="默认">
          <template #default="{ row }">{{ row.isDefault === 1 ? '是' : '' }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">{{ row.status === 1 ? '启用' : '停用' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pg" v-model:page-size="size" v-model:current-page="page" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total" background @current-change="load" @size-change="sizeChange" />
    </el-card>
    <el-dialog v-model="dlg" title="模型配置" width="520px" destroy-on-close>
      <el-form :model="form" label-width="120px">
        <el-form-item label="模型名称"><el-input v-model="form.modelName" placeholder="如 qwen3:8b" /></el-form-item>
        <el-form-item label="供应商">
          <el-select v-model="form.provider">
            <el-option label="Ollama" value="OLLAMA" /><el-option label="DashScope" value="DASHSCOPE" /><el-option label="OpenAI" value="OPENAI" /><el-option label="Azure" value="AZURE" />
          </el-select>
        </el-form-item>
        <el-form-item label="API地址"><el-input v-model="form.baseUrl" /></el-form-item>
        <el-form-item label="模型类型">
          <el-select v-model="form.modelType">
            <el-option label="对话" value="CHAT" /><el-option label="向量" value="EMBEDDING" /><el-option label="图像" value="IMAGE" />
          </el-select>
        </el-form-item>
        <el-form-item label="输入价"><el-input-number v-model="form.inputPricePer1k" :precision="4" :min="0" /></el-form-item>
        <el-form-item label="输出价"><el-input-number v-model="form.outputPricePer1k" :precision="4" :min="0" /></el-form-item>
        <el-form-item label="最大Token"><el-input-number v-model="form.maxTokens" :min="1" /></el-form-item>
        <el-form-item label="默认模型"><el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0" /></el-form-item>
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
import { fetchModelConfigPage, saveModelConfig, deleteModelConfig } from '../../api/modelConfig'
import { AiModelConfig } from '../../data/aiModelConfig/AiModelConfig'

const loading = ref(false)
const list = ref<AiModelConfig[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const keyword = ref('')
const dlg = ref(false)
const form = ref<AiModelConfig>({})

const load = async () => {
  loading.value = true
  try {
    const res = await fetchModelConfigPage({ page: page.value, size: size.value, condition: { keyword: keyword.value } })
    list.value = res.data; total.value = Number(res['total']) || 0
  } finally { loading.value = false }
}
function openCreate() { form.value = { provider: 'OLLAMA', modelType: 'CHAT', isDefault: 0, status: 1 }; dlg.value = true }
const save = async () => { await saveModelConfig(form.value); dlg.value = false; await load() }
const del = async (row: AiModelConfig) => { await ElMessageBox.confirm(`确定删除模型「${row.modelName}」？`, '提示'); await deleteModelConfig(Number(row.id)); await load() }
const sizeChange = (val: number) => { size.value = Number(val); load() }
onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.box { border-radius: 16px; }
.pg { margin-top: 16px; justify-content: flex-end; }
</style>
