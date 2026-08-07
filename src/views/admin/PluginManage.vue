<template>
  <div>
    <div class="page-title">插件注册管理</div>
    <el-card class="box" shadow="hover" style="height: 91vh;">
      <div class="toolbar">
        <el-input v-model="filter.pluginType" placeholder="插件类型" clearable style="width:130px;" />
        <el-input v-model="filter.name" placeholder="插件名称" clearable style="width:160px;" />
        <el-button type="primary" @click="() => { page=1; load() }">查询</el-button>
        <el-button type="success" icon="Plus" @click="openCreate">注册插件</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe width="100%" style="height: 78vh;">
        <el-table-column prop="id" label="ID" v-if="false" />
        <el-table-column prop="pluginCode" label="插件编码" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="pluginType" label="类型">
          <template #default="{ row }">
            <el-tag :type="row.pluginType==='MCP'?'primary':row.pluginType==='TOOL'?'success':'warning'" size="small">{{ row.pluginType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="endpoint" label="端点" show-overflow-tooltip />
        <el-table-column prop="version" label="版本" />
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
      <el-pagination class="pg" v-model:page-size="size" v-model:current-page="page" :page-sizes="[10,20,50,100]" layout="total, sizes, prev, pager, next, jumper" :total="total" background @current-change="load" @size-change="sizeChange" style="flex-shrink: 0;" />
    </el-card>
    <el-dialog v-model="dlg" title="注册插件" width="520px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="插件编码"><el-input v-model="form.pluginCode" placeholder="唯一标识，如 my-mcp-plugin" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.pluginType">
            <el-option label="MCP" value="MCP" />
            <el-option label="TOOL" value="TOOL" />
            <el-option label="SKILL" value="SKILL" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="端点"><el-input v-model="form.endpoint" placeholder="http://... 或本地路径" /></el-form-item>
        <el-form-item label="版本"><el-input v-model="form.version" placeholder="1.0.0" /></el-form-item>
        <el-form-item label="配置JSON"><el-input v-model="form.config" type="textarea" :rows="3" placeholder="可选" /></el-form-item>
        <el-form-item label="权限"><el-input v-model="form.permissions" placeholder="可选，逗号分隔" /></el-form-item>
        <el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { savePlugin, fetchPluginPage, togglePluginStatus, deletePlugin } from '../../api/plugin'
import { PluginRegistry } from '../../data/platform/PluginRegistry'

const loading = ref(false)
const list = ref<PluginRegistry[]>([])
const total = ref(0); const page = ref(1); const size = ref(10)
const filter = ref<{pluginType:string;name:string}>({pluginType:'',name:''})
const dlg = ref(false)
const form = ref<PluginRegistry>({})

const load = async () => {
  loading.value = true
  try {
    const r = await fetchPluginPage({ page: page.value, size: size.value, condition: filter.value })
    list.value = r.data?.records || r.data || []
    total.value = Number(r.data?.total || r['total'] || 0)
  } finally { loading.value = false }
}

function openCreate() {
  form.value = { pluginType: 'TOOL', status: 1, version: '1.0.0' }
  dlg.value = true
}

const save = async () => {
  await savePlugin(form.value)
  dlg.value = false
  ElMessage.success('保存成功')
  await load()
}

const toggleStatus = async (r: PluginRegistry) => {
  await togglePluginStatus(Number(r.id), r.status === 1 ? 0 : 1)
  await load()
}

const del = async (r: PluginRegistry) => {
  await ElMessageBox.confirm('确定删除？', '提示')
  await deletePlugin(Number(r.id))
  await load()
}

const sizeChange = (v: number) => { size.value = Number(v); load() }
onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.box { border-radius: 16px; }
.pg { margin-top: 16px; justify-content: flex-end; }
</style>
