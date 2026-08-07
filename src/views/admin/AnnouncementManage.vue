<template>
  <div>
    <div class="page-title">系统公告</div>
    <el-card class="box" shadow="hover" style="height: 91vh;">
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="搜索标题" clearable style="width: 8vw;" @clear="load" />
        <el-button type="primary" @click="() => { page = 1; load() }">查询</el-button>
        <el-button type="success" icon="Plus" @click="openCreate">发布公告</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe width="100%" style="height: 81vh;">
        <el-table-column prop="id" label="ID" v-if="false" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="type" label="类型">
          <template #default="{ row }">
            <el-tag :type="row.type === 'WARNING' ? 'warning' : row.type === 'MAINTENANCE' ? 'danger' : 'info'" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'PUBLISHED' ? 'success' : row.status === 'OFFLINE' ? 'info' : 'warning'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间">
          <template #default="{ row }">{{ formatDateTime(row.publishTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pg" v-model:page-size="size" v-model:current-page="page" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total" background @current-change="load" @size-change="sizeChange" />
    </el-card>
    <el-dialog v-model="dlg" title="公告" width="600px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="6" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type">
            <el-option label="通知" value="INFO" /><el-option label="警告" value="WARNING" /><el-option label="维护" value="MAINTENANCE" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级"><el-input-number v-model="form.priority" :min="0" :max="2" /></el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="草稿" value="DRAFT" /><el-option label="已发布" value="PUBLISHED" /><el-option label="已下线" value="OFFLINE" />
          </el-select>
        </el-form-item>
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
import { fetchAnnouncementPage, saveAnnouncement, deleteAnnouncement } from '../../api/announcement'
import { formatDateTime } from '../../utils/date'
import { Announcement } from '../../data/announcement/Announcement'

const loading = ref(false)
const list = ref<Announcement[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const keyword = ref('')
const dlg = ref(false)
const form = ref<Announcement>({})

const load = async () => {
  loading.value = true
  try {
    const res = await fetchAnnouncementPage({ page: page.value, size: size.value, condition: { keyword: keyword.value } })
    list.value = res.data; total.value = Number(res['total']) || 0
  } finally { loading.value = false }
}
function openCreate() { form.value = { type: 'INFO', priority: 0, status: 'DRAFT' }; dlg.value = true }
const save = async () => { await saveAnnouncement(form.value); dlg.value = false; await load() }
const del = async (row: Announcement) => { await ElMessageBox.confirm(`确定删除公告「${row.title}」？`, '提示'); await deleteAnnouncement(Number(row.id)); await load() }
const sizeChange = (val: number) => { size.value = Number(val); load() }
onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.box { border-radius: 16px; }
.pg { margin-top: 16px; justify-content: flex-end; }
</style>
