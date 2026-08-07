<template>
  <div class="page-wrapper">
    <div class="page-title">文档标签</div>
    <el-card class="box" shadow="hover" style="display: flex; flex-direction: column; overflow: hidden;">
      <div class="toolbar" style="flex-shrink: 0;">
        <span class="toolbar-label" style="white-space: nowrap;">标签名称：</span>
        <el-input v-model="tagName" placeholder="搜索标签名称" clearable style="width: 8vw;" @clear="() => { page = 1; load() }" />
        <el-button type="primary" @click="() => { page = 1; load() }">查询</el-button>
        <el-button type="success" icon="Plus" @click="openCreate">新增标签</el-button>
        <el-tooltip content='打标后需对文档执行"向量重灌"以刷新元数据中的标签信息' placement="top">
          <el-icon :size="20" style="margin-left: 8px; cursor: help; color: #409EFF;"><InfoFilled /></el-icon>
        </el-tooltip>
      </div>
      <el-table :data="list" v-loading="loading" stripe width="100%" style="flex: 1; min-height: 0;">
        <el-table-column prop="id" label="ID" v-if="false" />
        <el-table-column prop="name" label="名称">
          <template #default="{ row }">
            <el-tag :color="row.color" effect="dark" style="color: #fff;">{{ row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="color" label="颜色">
          <template #default="{ row }">
            <div :style="{ backgroundColor: row.color, width: '60px', height: '24px', borderRadius: '4px' }"></div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间">
          <template #default="{ row }">{{ formatDateTime(row['createTime']) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          class="pg"
          v-model:page-size="size"
          v-model:current-page="page"
          :page-sizes="[10, 20, 50, 100]"
          :size="size"
          :disabled="disabled"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background
          @current-change="load"
          @size-change="sizeChange"
          style="flex-shrink: 0; margin-top: 16px;"
      />
    </el-card>

    <el-dialog v-model="dlg" title="新增标签" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" placeholder="标签名称" /></el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="form.color" />
          <span style="margin-left: 12px; color: #999;">{{ form.color }}</span>
        </el-form-item>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { formatDateTime } from '../../utils/date'
import { Tag, fetchTagPage, createTag, deleteTag } from '../../api/tag'

const loading = ref<boolean>(false)
const page = ref<number>(1)
const size = ref<number>(10)
const total = ref<number>(0)
const disabled = ref<boolean>(false)

const tagName = ref<string>("")
const list = ref<Tag[]>([])
const dlg = ref(false)
const form = ref<{ name: string; color: string }>({
  name: '',
  color: '#409EFF'
})

const load = async () => {
  loading.value = true
  try {
    const res = await fetchTagPage({
      page: Number(page.value),
      size: Number(size.value),
      condition: { name: tagName.value }
    })
    list.value = res.data
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const sizeChange = () => {
  page.value = 1
  load()
}

const openCreate = () => {
  form.value = { name: '', color: '#409EFF' }
  dlg.value = true
}

const save = async () => {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }
  await createTag(form.value)
  ElMessage.success('标签已新增')
  dlg.value = false
  load()
}

const del = async (row: Tag) => {
  await ElMessageBox.confirm(`确认删除标签"${row.name}"？删除后将级联清理文档关联，向量元数据中的标签残留需执行向量重灌刷新`, '警告', { type: 'warning' })
  await deleteTag(row.id)
  ElMessage.success('标签已删除')
  load()
}

onMounted(load)
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
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.pg { margin-top: 16px; justify-content: flex-end; }
</style>
