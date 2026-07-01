<template>
  <div>
    <div class="page-title">知识分类</div>
    <el-card shadow="hover" class="box" style="height: 91vh;">
      <div class="toolbar">
        <span class="toolbar-label">分类名称：</span>
        <el-input v-model="categoryName" placeholder="搜索分类名称" clearable style="width: 180px" @clear="() => { page = 1; load() }" />
        <span class="toolbar-label">分类描述：</span>
        <el-input v-model="categoryDescription" placeholder="搜索分类描述" clearable style="width: 180px" @clear="() => { page = 1; load() }" />
        <el-button type="primary" @click="() => { page = 1; load() }">查询</el-button>
        <el-button type="success" icon="Plus" @click="openCreate">新增分类</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe style="height: 81vh;">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="90" />
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row['createTime']) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
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
          style="height: 3.5vh;"
      />
    </el-card>

    <el-dialog v-model="dlg" title="分类" width="460px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" rows="3" /></el-form-item>
        <el-form-item label="图标"><el-input v-model="form.icon" placeholder="Element 图标名" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" /></el-form-item>
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
import { formatDateTime } from '../../utils/date'
import {Category} from "../../data/category/Category";
import { listCategories, saveCategory, deleteCategory } from '../../api/category'
import {CategoryQueryCondition} from "../../data/category/CategoryQueryCondition";

const loading = ref<boolean>(false)
// 当前所在页码
const page = ref<number>(1)
// 每页数量
const size = ref<number>(10)
// 数据总数
const total = ref<number>(0)
// 是否禁用分页
const disabled = ref<boolean>(false)

// 知识库分类名称查询条件
const categoryName = ref<string>("")
// 知识库分类描述查询条件
const categoryDescription = ref<string>("")

// 知识库分类列表
const list = ref<Category[]>([])
// 是否显示弹窗
const dlg = ref(false)
// 弹窗数据表封装
const form = ref<Category>({
  id: Number(null),
  name: '',
  description: '',
  icon: 'Document',
  sortOrder: 0
})


const load = async () => {
  loading.value = true
  try {
    const res = await listCategories({
      page: Number(page.value),
      size: Number(size.value),
      condition: {
        name: categoryName.value,
        description: categoryDescription.value
      } as CategoryQueryCondition,
    })
    list.value = res.data
    page.value = res.page
    total.value = res.total
    size.value = res.size
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  form.value = {
    id: Number(null),
    name: '',
    description: '',
    icon: 'Folder',
    sortOrder: 0
  }
  dlg.value = true
}

const openEdit = (row: Category) => {
  form.value = {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    sortOrder: row.sortOrder ?? 0
  }
  dlg.value = true
}

const save = async () => {
  await saveCategory(form.value)
  dlg.value = false
  await load()
}

const del = async (row: Category) => {
  await ElMessageBox.confirm(`删除分类「${row.name}」？`, '提示')
  await deleteCategory(Number(row.id))
  await load()
}

const sizeChange = (val: number) => {
  size.value = val
  page.value = 1
  load()
}
onMounted(load)
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
</style>
