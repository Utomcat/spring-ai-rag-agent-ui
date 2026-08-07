<template>
  <div>
    <div class="page-title">文档管理</div>
    <el-card style="height: 91vh;" shadow="hover" class="box">
      <div class="toolbar">
        <span class="toolbar-label">文档类别：</span>
        <el-select v-model="categoryId" clearable placeholder="选择分类" style="width: 180px" @change="handleChangeCategory">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id"/>
        </el-select>
        <span class="toolbar-label">标题/文件名：</span>
        <el-input v-model="keyword" placeholder="搜索标题/文件名" clearable style="width: 220px" @clear="handleClearKeyword"/>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button type="success" :icon="Upload" @click="openUpload">上传解析</el-button>
      </div>
      <el-table style="height: 81vh;" :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" v-if="false"/>
        <el-table-column prop="title" label="标题" min-width="160"/>
        <el-table-column prop="fileName" label="文件" min-width="140" show-overflow-tooltip/>
        <el-table-column prop="fileType" label="类型" width="80"/>
        <el-table-column label="文档类别" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ categoryName(row.categoryId) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">{{ formatDocStatus(row.status) }}</template>
        </el-table-column>
        <el-table-column prop="vectorCount" label="向量块" width="90"/>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openVersions(row)">版本</el-button>
            <el-button link type="primary" @click="openTags(row)">标签</el-button>
            <el-button link type="primary" @click="openReupload(row)">重传</el-button>
            <el-button link type="warning" @click="reindex(row)">重灌</el-button>
            <el-button link type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          class="pg"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          v-model:page-size="size"
          v-model:current-page="page"
          @current-change="load"
          @size-change="sizeChange"
          style="flex-shrink: 0;"
      />
    </el-card>

    <el-dialog v-model="uploadOpen" title="上传知识文件" width="460px">
      <el-alert type="info" :closable="false" show-icon
                title="支持 txt / pdf / doc / docx / md，提交后后台异步解析并向量化写入 Redis，可关闭弹窗等待完成通知"/>
      <el-form label-width="80px" style="margin-top: 16px">
        <el-form-item label="分类">
          <el-select v-model="uploadCat" style="width: 100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="uploadTitle" placeholder="可选，默认文件名"/>
        </el-form-item>
        <el-form-item label="文件">
          <el-upload v-model:file-list="fileList" :multiple="true" :auto-upload="false" :limit="1" drag>
            <el-icon class="el-icon--upload" :size="48">
              <UploadFilled/>
            </el-icon>
            <div class="el-upload__text">拖拽或点击选择</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadOpen = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="doUpload">开始上传</el-button>
      </template>
    </el-dialog>
    <!-- 版本历史弹窗 -->
    <el-dialog v-model="versionsOpen" title="文档版本历史" width="700px">
      <el-table :data="versions" v-loading="versionsLoading" stripe max-height="400">
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column prop="fileName" label="文件名" show-overflow-tooltip />
        <el-table-column prop="fileSize" label="大小(KB)" width="100">
          <template #default="{ row }">{{ row.fileSize ? Math.round(row.fileSize / 1024) : '-' }}</template>
        </el-table-column>
        <el-table-column prop="vectorCount" label="向量块" width="90" />
        <el-table-column prop="jobType" label="类型" width="100">
          <template #default="{ row }">{{ row.jobType === 'REINDEX' ? '重灌' : '入库' }}</template>
        </el-table-column>
        <el-table-column prop="changeDesc" label="说明" show-overflow-tooltip />
        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 标签管理弹窗 -->
    <el-dialog v-model="tagsOpen" title="文档标签管理" width="500px">
      <div style="margin-bottom: 12px;">
        <span style="margin-right: 8px;">已绑定标签：</span>
        <el-tag v-for="tag in documentTags" :key="tag.id" :color="tag.color" closable effect="dark" style="color: #fff; margin-right: 6px;" @close="unbindTag(tag.id)">
          {{ tag.name }}
        </el-tag>
        <span v-if="documentTags.length === 0" style="color: #999;">暂无标签</span>
      </div>
      <el-divider />
      <div>
        <span style="margin-right: 8px;">绑定标签：</span>
        <el-select v-model="selectedTagIds" multiple placeholder="选择标签" style="width: 300px;">
          <el-option v-for="tag in allTags" :key="tag.id" :label="tag.name" :value="tag.id">
            <span style="float: left">{{ tag.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 12px;">{{ tag.color }}</span>
          </el-option>
        </el-select>
        <el-button type="primary" @click="bindTags" style="margin-left: 12px;">绑定</el-button>
      </div>
      <el-alert type="info" :closable="false" style="margin-top: 12px;">
        标签变更后需执行"重灌"以刷新向量元数据中的标签信息
      </el-alert>
    </el-dialog>

    <!-- 重新上传弹窗 -->
    <el-dialog v-model="reuploadOpen" title="重新上传（版本递增）" width="460px">
      <el-alert type="warning" :closable="false" show-icon title="新文件将替换当前文档内容，版本号+1，旧版本保留供回溯" />
      <el-form label-width="80px" style="margin-top: 16px">
        <el-form-item label="文件">
          <el-upload v-model:file-list="reuploadFileList" :multiple="false" :auto-upload="false" :limit="1" drag>
            <el-icon class="el-icon--upload" :size="48">
              <UploadFilled/>
            </el-icon>
            <div class="el-upload__text">拖拽或点击选择新文件</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reuploadOpen = false">取消</el-button>
        <el-button type="primary" :loading="reuploading" @click="doReupload">开始上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, onUnmounted} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {formatDateTime} from '../../utils/date'
import type {UploadUserFile} from 'element-plus'
import {listCategories} from '../../api/category'
import {Document} from "../../data/document/Document";
import {Category} from "../../data/category/Category";
import {Upload, UploadFilled} from '@element-plus/icons-vue'
import {fetchDocumentPage, uploadDocument, deleteDocument, fetchIngestJob} from '../../api/document'
import {Tag, fetchTagPage, fetchDocumentTags, bindDocumentTags, unbindDocumentTag} from '../../api/tag'
import {DocumentVersion, fetchDocumentVersions, reuploadDocument, reindexDocument} from '../../api/documentVersion'

const loading = ref(false)
const list = ref<Document[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)

const keyword = ref('')

const categoryId = ref<number>(Number(null))
const categories = ref<Category[]>([])

const uploadOpen = ref(false)
const uploadCat = ref<number>(Number(null))
const uploadTitle = ref<string>('')
const fileList = ref<UploadUserFile[]>([])
const uploading = ref(false)

// 版本历史
const versionsOpen = ref(false)
const versionsLoading = ref(false)
const versions = ref<DocumentVersion[]>([])
const currentDocId = ref<number>(0)

// 标签管理
const tagsOpen = ref(false)
const allTags = ref<Tag[]>([])
const documentTags = ref<Tag[]>([])
const selectedTagIds = ref<number[]>([])

// 重新上传
const reuploadOpen = ref(false)
const reuploadFileList = ref<UploadUserFile[]>([])
const reuploading = ref(false)

/** 入库任务进度轮询间隔(毫秒) */
const JOB_POLL_INTERVAL_MS = 2000
/*入库任务进度轮询定时器句柄 - 页面卸载时需清理*/
let jobPollTimer: ReturnType<typeof setInterval> | null = null

const loadCats = async () => {
  const res = await listCategories({
    page: 1,
    size: 1000,
    condition: {},
  })
  categories.value = res.data
}

const load = async () => {
  loading.value = true
  try {
    const res = await fetchDocumentPage({
      page: page.value,
      size: size.value,
      condition: {
        keyword: keyword.value,
        categoryId: categoryId.value
      },
    })
    list.value = res.data
    total.value = res['total']
    page.value = res['page']
    size.value = res['size']
  } finally {
    loading.value = false
  }
}

const sizeChange = () => {
  page.value = 1
  load()
}

const openUpload = () => {
  uploadCat.value = categoryId.value || (categories.value[0]?.id ?? Number(null))
  uploadTitle.value = ''
  fileList.value = []
  uploadOpen.value = true
}

const doUpload = async () => {
  const f = fileList.value[0]?.raw
  if (!f || !uploadCat.value) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('files', f)
    fd.append('categoryId', String(uploadCat.value))
    if (uploadTitle.value) fd.append('title', uploadTitle.value)
    // 上传改为异步受理: 后端立即返回批次ID, 解析/切块/向量化在后台执行(破坏性变更)
    const res = await uploadDocument(fd)
    uploadOpen.value = false
    ElMessage.info('文件已提交，正在后台解析向量化，完成后自动刷新列表')
    pollIngestJob(res.data)
    await load()
  } finally {
    uploading.value = false
  }
}

/**
 * 轮询入库任务进度 - 批次终态(SUCCESS/FAIL)后停止轮询并刷新文档列表
 *
 * @param batchId - 上传受理返回的批次ID
 */
const pollIngestJob = (batchId: string) => {
  if (jobPollTimer) clearInterval(jobPollTimer)
  jobPollTimer = setInterval(async () => {
    try {
      const res = await fetchIngestJob(batchId)
      const job = res.data
      if (job.status === 'SUCCESS') {
        clearInterval(jobPollTimer!)
        jobPollTimer = null
        ElMessage.success(`解析完成，共生成 ${job.vectorCount ?? 0} 个向量块`)
        await load()
      } else if (job.status === 'FAIL') {
        clearInterval(jobPollTimer!)
        jobPollTimer = null
        ElMessage.error(job.errorMsg || '解析失败，请重试')
        await load()
      }
    } catch {
      // 单次轮询异常不中断轮询, 由下一次重试; 401 已由响应拦截器统一处理
    }
  }, JOB_POLL_INTERVAL_MS)
}

const del = async (row: Document) => {
  await ElMessageBox.confirm(`删除文档「${row.title}」及向量？`, '提示')
  await deleteDocument(row.id!)
  await load()
}

const DOC_STATUS_CN: Record<string, string> = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  SUCCESS: '解析成功',
  FAIL: '解析失败',
}

const formatDocStatus = (status: string) => {
  if (status == null || status === '') return '—'
  return DOC_STATUS_CN[status] ?? status
}

const categoryName = (id: number) => {
  if (id == null) return '—'
  const c = categories.value.find((x) => x.id === id)
  return c?.name ?? '—'
}

const handleChangeCategory = () => {
  page.value = 1
  size.value = 10
  load()
}

const handleClearKeyword = () => {
  page.value = 1
  size.value = 10
  keyword.value = ''
  load()
}

const handleSearch = () => {
  page.value = 1
  size.value = 10
  load()
}

onMounted(async () => {
  await loadCats()
  if (categories.value.length > 0) {
    categoryId.value = Number(categories.value[0].id)
  }
  await load()
})

onUnmounted(() => {
  // 页面卸载时清理入库任务轮询定时器, 避免内存泄漏与后台无效请求
  if (jobPollTimer) {
    clearInterval(jobPollTimer)
    jobPollTimer = null
  }
})

// 版本历史
const openVersions = async (row: Document) => {
  currentDocId.value = row.id!
  versionsOpen.value = true
  versionsLoading.value = true
  try {
    const res = await fetchDocumentVersions(row.id!)
    versions.value = res.data || []
  } finally {
    versionsLoading.value = false
  }
}

// 标签管理
const openTags = async (row: Document) => {
  currentDocId.value = row.id!
  tagsOpen.value = true
  // 加载所有标签
  const tagRes = await fetchTagPage({ page: 1, size: 1000, condition: {} })
  allTags.value = tagRes.data
  // 加载文档已绑定标签
  const docTagRes = await fetchDocumentTags(row.id!)
  documentTags.value = docTagRes.data
  selectedTagIds.value = []
}

const bindTags = async () => {
  if (selectedTagIds.value.length === 0) {
    ElMessage.warning('请选择要绑定的标签')
    return
  }
  await bindDocumentTags(currentDocId.value, selectedTagIds.value)
  ElMessage.success('标签已绑定，请执行"重灌"刷新向量元数据')
  // 刷新已绑定标签
  const docTagRes = await fetchDocumentTags(currentDocId.value)
  documentTags.value = docTagRes.data
  selectedTagIds.value = []
}

const unbindTag = async (tagId: number) => {
  await unbindDocumentTag(currentDocId.value, tagId)
  ElMessage.success('标签已解绑')
  const docTagRes = await fetchDocumentTags(currentDocId.value)
  documentTags.value = docTagRes.data
}

// 重新上传
const openReupload = (row: Document) => {
  currentDocId.value = row.id!
  reuploadFileList.value = []
  reuploadOpen.value = true
}

const doReupload = async () => {
  const f = reuploadFileList.value[0]?.raw
  if (!f) return
  reuploading.value = true
  try {
    const res = await reuploadDocument(currentDocId.value, f)
    reuploadOpen.value = false
    ElMessage.info('文件已提交，正在后台重新解析向量化')
    pollIngestJob(res.data)
    await load()
  } finally {
    reuploading.value = false
  }
}

// 向量重灌
const reindex = async (row: Document) => {
  await ElMessageBox.confirm(`对文档「${row.title}」执行向量重灌？将刷新向量元数据（含标签信息）`, '提示')
  const res = await reindexDocument(row.id!)
  ElMessage.success('重灌任务已提交，后台处理中')
  pollIngestJob(res.data)
}
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  align-items: center;
}

.toolbar-label {
  font-weight: 500;
  white-space: nowrap;
  color: #606266;
}

.box {
  border-radius: 16px;
}

.pg {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
