<template>
  <div>
    <div class="page-title">消息反馈</div>
    <el-card class="box" shadow="hover" style="height: 91vh;">
      <div class="toolbar">
        <el-select v-model="ratingFilter" placeholder="评分筛选" clearable style="width:120px;" @clear="load">
          <el-option label="好评" :value="3" /><el-option label="一般" :value="2" /><el-option label="差评" :value="1" />
        </el-select>
        <el-button type="primary" @click="() => { page=1; load() }">查询</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe width="100%" style="height: 81vh;">
        <el-table-column prop="id" label="ID" v-if="false" />
        <el-table-column prop="messageId" label="消息ID" />
        <el-table-column prop="sessionId" label="会话ID" />
        <el-table-column prop="userId" label="用户ID" />
        <el-table-column prop="rating" label="评分">
          <template #default="{ row }">
            <el-tag :type="row.rating===3?'success':row.rating===2?'warning':'danger'" size="small">{{ row.rating===3?'好评':row.rating===2?'一般':'差评' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" show-overflow-tooltip />
        <el-table-column prop="comment" label="评论" show-overflow-tooltip />
        <el-table-column label="时间"><template #default="{ row }">{{ formatDateTime(row.createTime) }}</template></el-table-column>
      </el-table>
      <el-pagination class="pg" v-model:page-size="size" v-model:current-page="page" :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next, jumper" :total="total" background @current-change="load" @size-change="sizeChange" />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { fetchFeedbackPage } from '../../api/messageFeedback'
import { formatDateTime } from '../../utils/date'

const loading = ref(false); const list = ref<any[]>([]); const total = ref(0); const page = ref(1); const size = ref(10)
const ratingFilter = ref<number | ''>('')

const load = async () => {
  loading.value = true
  try {
    const res = await fetchFeedbackPage({ page: page.value, size: size.value, condition: { rating: ratingFilter.value || undefined } })
    list.value = res.data; total.value = Number(res['total']) || 0
  } finally { loading.value = false }
}
const sizeChange = (v: number) => { size.value = Number(v); load() }
onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; }
.box { border-radius: 16px; }
.pg { margin-top: 16px; justify-content: flex-end; }
</style>
