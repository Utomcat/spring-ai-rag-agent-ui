<template>
  <div>
    <div class="page-title">会话历史</div>
    <p class="sub">点击查看可继续对话 · 时间格式 YYYY-MM-DD HH:mm:ss</p>
    <el-card shadow="hover" class="box">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openSession(row)">打开</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listSessions } from '../../api/chat.ts'
import { formatDateTime } from '../../utils/date.ts'
import {SessionResponse} from "../../data/chat/SessionResponse.ts";

const router = useRouter()
const list = ref<SessionResponse[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await listSessions({
      page: 1,
      size: 100
    })
    list.value = res.data
  } finally {
    loading.value = false
  }
}

function openSession(row: SessionResponse) {
  router.push({ path: '/user/chat', query: { sessionId: String(row.id) } })
}

onMounted(load)
</script>

<style scoped>
.sub {
  color: #64748b;
  margin: 4px 0 16px;
}
.box {
  border-radius: 16px;
}
</style>
