<template>
  <div>
    <div class="page-title">问答测试</div>
    <p class="sub">管理员快速验证 RAG 与 Ollama 连通性</p>
    <el-card shadow="hover" class="box">
      <el-form label-position="top">
        <el-form-item label="限定检索分类（可选，多选）">
          <el-select v-model="categoryIds" multiple clearable placeholder="不选则全库检索" style="width: 100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题">
          <el-input v-model="question" type="textarea" :rows="5" placeholder="请输入要检索的问题" />
        </el-form-item>
        <el-alert
          v-show="loading"
          type="info"
          :closable="false"
          show-icon
          class="busy-hint"
          title="正在检索知识库并调用本地模型生成回答，首次加载模型可能较慢，请耐心等待。"
        />
        <el-button type="primary" size="large" :loading="loading" @click="submit">发送提问</el-button>
      </el-form>
      <div v-if="answerHtml" class="answer" v-html="answerHtml" />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { marked } from 'marked'
import { onMounted } from 'vue'
import { ask } from '../../api/chat'
import { listCategories } from '../../api/category'
import {Category} from "../../data/category/Category";

marked.setOptions({ breaks: true })

/** 是否正在加载中 */
const loading = ref<boolean>(false)

/** 知识库分类 List  */
const categories = ref<Category[]>([])
/** 限定检索分类 ID 列表 */
const categoryIds = ref<number[]>([])
/** 会话 ID 初次进入页面录入问题时, 该值为 0 */
const sessionId = ref<number>(Number(null))
/** 用户录入的问题字符串 */
const question = ref<string>('')
/** 回答内容 HTML */
const answerHtml = ref<string>('')


onMounted(async () => {
  const res = await listCategories({
    page: 1,
    size: 1000,
    condition: {},
  })
  categories.value = res.data
})

const submit = async() => {
  if (!question.value.trim()) return
  loading.value = true
  answerHtml.value = ''
  try {
    const ids = categoryIds.value.map((id) => Number(id)).filter((n) => !Number.isNaN(n))
    const res = await ask({
      question: String(question.value),
      sessionId: Number(sessionId.value),
      categoryIds: ids.length ? ids : [],
    })
    console.debug("在问答测试功能中, 当前用户发起问题后, 获取到的响应为: ", res)
    sessionId.value = Number(res.data.sessionId)
    answerHtml.value = marked.parse(res.data.answer || '') as string
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.sub {
  color: #64748b;
  margin: 4px 0 16px;
}
.box {
  border-radius: 16px;
  max-width: 880px;
}
.busy-hint {
  margin-bottom: 12px;
}
.answer {
  margin-top: 24px;
  padding: 16px 18px;
  border-radius: 12px;
  background: linear-gradient(120deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.06));
  border: 1px solid rgba(99, 102, 241, 0.15);
  line-height: 1.6;
}
</style>
