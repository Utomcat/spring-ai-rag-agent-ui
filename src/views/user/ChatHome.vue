<template>
  <div class="chat-wrap">
    <el-card class="card" shadow="hover">
      <div class="layout">
        <!-- 会话列表-->
        <aside class="side">
          <!-- 新建会话按钮 -->
          <div class="side-head">
            <el-button type="primary" icon="Plus" round size="small" @click="newChat">新对话</el-button>
          </div>
          <!-- 会话列表 -->
          <div class="sess-list">
            <div
                v-for="s in sessions"
                :key="s.id"
                class="sess"
                :class="{ active: activeId === s.id }"
                @click="selectSession(s.id)"
            >
              <div class="t">{{ s.title || '未命名' }}</div>
              <div class="d">{{ formatDateTime(s.updateTime) }}</div>
              <el-button class="del" text type="danger" icon="Delete" @click="removeSession(s.id, $event)"/>
            </div>
          </div>
          <!-- 分页插件 -->
          <div class="side-pagination">
            <el-pagination
                v-model:current-page="page"
                v-model:page-size="size"
                :page-sizes="[10, 100, 200, 300, 400]"
                :size="componentSize"
                :disabled="disabled"
                :background="background"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
          </div>
        </aside>
        <!-- 打开的会话 -->
        <main class="main">
          <div class="filters">
            <el-select
                v-model="categoryIds"
                multiple
                clearable
                collapse-tags
                placeholder="限定分类（可选）"
                style="width: min(360px, 100%)"
            >
              <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id"/>
            </el-select>
          </div>
          <div ref="msgEl" class="message">
            <div v-if="!messages.length && !sending" class="empty">
              向企业知识库提问，答案将基于已上传文档生成。或调用工具进行网络搜索。
            </div>
            <ChatMessage
                v-for="(m, idx) in messages"
                :key="idx"
                :role="m.role"
                :content="m.content"
                :refs="parseRefs(m.refs)"
                :user-avatar-src="chatUserAvatarSrc"
                :user-avatar-text="chatUserAvatarText"
                :user-avatar-style="chatUserAvatarStyle"
            />
            <div v-if="sending" class="pending-row" aria-live="polite">
              <div class="pending-sys-icon">
                <el-icon class="pending-sys-ic">
                  <ChatDotRound/>
                </el-icon>
              </div>
              <div class="pending-bubble">
                <span class="pending-label">系统正在检索中，请稍等</span>
                <span class="pending-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span>
              </div>
            </div>
          </div>
          <div class="input-bar">
            <el-input
                v-model="input"
                type="textarea"
                :rows="3"
                placeholder="输入问题，Enter 发送（Shift+Enter 换行）"
                @keydown.enter.exact.prevent="send"
                style="width: 68vw;"
            />
            <el-button type="primary" class="send" :loading="sending" @click="send">发送</el-button>
          </div>
        </main>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import {useRoute} from 'vue-router'
import {fileUrl} from '../../utils/files'
import {ComponentSize} from "element-plus"
import {useUserStore} from '../../stores/user'
import {formatDateTime} from '../../utils/date'
import {listCategories} from '../../api/category'
import {ChatDotRound} from '@element-plus/icons-vue'
import {Category} from "../../data/category/Category"
import ChatMessage from '../../components/ChatMessage.vue'
import {avatarFallbackBg} from '../../utils/avatarFallback'
import {computed, nextTick, onMounted, ref, watch} from 'vue'
import {SessionResponse} from "../../data/chat/SessionResponse"
import {MessagesResponse} from "../../data/chat/MessagesResponse"
import {ask, deleteSession, listMessages, listSessions} from '../../api/chat'

const route = useRoute()
const userStore = useUserStore()

/*当前页码*/
const page = ref<number>(1)
/*当前页数据数量*/
const size = ref<number>(100)
/*数据总量*/
const total = ref<number>(0)
/*分页大小, 可选值 ['large' | 'default' | 'small']*/
const componentSize = ref<ComponentSize>('small')
/*是否为分页按钮添加背景色*/
const background = ref<boolean>(false)
/*是否禁用分页*/
const disabled = ref<boolean>(false)

/*当前登录用户所进行过会话的会话列表存储对象 - 为避免当前会话列表加载过多, 只进行当前页的历史会话展示*/
const sessions = ref<SessionResponse[]>([])
/*指定会话的消息列表*/
const messages = ref<MessagesResponse[]>([])
/*当前激活的会话ID*/
const activeId = ref<number>(Number(null))
/*当前选中的知识库分类ID*/
const categoryIds = ref<number[]>([])
/*当前系统中拥有的知识库分类数据列表*/
const categories = ref<Category[]>([])
/*用户输入的内容*/
const input = ref<string>('')
/*用户是否发送中消息的状态*/
const sending = ref<boolean>(false)
/*会话消息 HTML 元素*/
const msgEl = ref<HTMLElement | null>(null)

/*聊天用户头像转换*/
const chatUserAvatarSrc = computed(() =>
    userStore.user?.avatar ? fileUrl(userStore.user.avatar) : '',
)
/*用户聊天用户名*/
const chatUserAvatarText = computed(() =>
    (userStore.user?.realName || userStore.user?.username || '?').slice(0, 1),
)

/*用户聊天头像样式*/
const chatUserAvatarStyle = computed(() =>
    userStore.user?.avatar ? undefined : avatarFallbackBg(userStore.user?.username),
)

/*聊天信息滚动到消息底部*/
const scrollMsgToBottom = async () => {
  await nextTick()
  const el = msgEl.value
  if (el) {
    el.scrollTop = el.scrollHeight
  }
}

/*解析参考来源JSON格式内容*/
const parseRefs = (refs: string | string[]) => {
  if (!refs) return []
  if (typeof refs === 'string') {
    try {
      return JSON.parse(refs)
    } catch {
      return []
    }
  }
  return Array.isArray(refs) ? refs : []
}

/*加载会话列表*/
const loadSessions = async () => {
  let res = await listSessions({
    page: Number(page.value),
    size: Number(size.value),
    condition: {}
  });
  sessions.value = res.data
}

/*会话选择*/
const selectSession = async (id: number) => {
  activeId.value = id
  let res = await listMessages(id)
  messages.value = res.data
  await scrollMsgToBottom()
}

/*新建聊天*/
const newChat = async () => {
  activeId.value = Number(null)
  messages.value = []
}

/*会话消息发送*/
const send = async() => {
  const q = input.value.trim()
  if (!q || sending.value) return
  sending.value = true
  const sid = activeId.value
  messages.value = [...messages.value, {
    id: Number(null),
    sessionId: sid,
    role: 'USER',
    content: q,
    refs: String(null),
    createTime: new Date().toISOString(),
  }]
  input.value = ''
  await scrollMsgToBottom()
  try {
    const ids = categoryIds.value.map((id) => Number(id)).filter((n) => !Number.isNaN(n))
    const res = await ask({
      question: q,
      sessionId: sid,
      categoryIds: ids.length ? ids : null,
    })
    activeId.value = Number(res.data.sessionId)
    const ans = res.data.answer
    const refs = res.data.references || []
    messages.value = [...messages.value, {
      id: Number(null),
      sessionId: sid,
      role: 'ASSISTANT',
      content: ans,
      refs: String(refs),
      createTime: new Date().toISOString(),
    }]
    await loadSessions()
    await scrollMsgToBottom()
  } finally {
    sending.value = false
    await scrollMsgToBottom()
  }
}

/*删除会话*/
const removeSession = async (id: number, ev: MouseEvent) => {
  ev.stopPropagation()
  await deleteSession(id)
  if (activeId.value === id) await newChat()
  await loadSessions()
}

/*分页大小改变监听事件*/
const handleSizeChange = (val: number) => {
  size.value = val
  page.value = 1
  loadSessions()
}

/*分页页码改变监听事件*/
const handleCurrentChange = (val: number) => {
  page.value = val
  loadSessions()
}

onMounted(async () => {
  let c = await listCategories({
    page: 1,
    size: 1000,
    condition: {},
  });
  categories.value = c.data
  await loadSessions()
  const qid = route.query.sessionId
  if (qid) {
    await selectSession(Number(qid))
  }
})

watch(
    () => route.query.sessionId,
    (v) => {
      if (v) selectSession(Number(v))
    }
)

watch(
    () => messages.value.length,
    () => scrollMsgToBottom(),
)

watch(sending, (v) => {
  if (v) scrollMsgToBottom()
})
</script>

<style scoped>
.chat-wrap {
  width: 100%;
  height: 100%;
}

.card {
  border-radius: 20px;
  border: none;
  overflow: hidden;
  width: 96vw;
  height: 86vh;
  margin: 20px auto;
}

.layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  width: 17vw;
  height: 83vh;
}

.side {
  background: linear-gradient(180deg, #0f172a, #1e293b);
  color: #e2e8f0;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  width: 16vw;
  height: 80vh;
  overflow: hidden;
}

.side-head {
  margin-bottom: 10px;
}

.sess-list {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  margin-bottom: 8px;
}

.side-pagination {
  display: flex;
  flex-shrink: 0;
  padding: 4px 0;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
  align-items: center;
}

.sess {
  position: relative;
  padding: 10px 30px 10px 10px;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 6px;
}

.sess:hover {
  background: rgba(255, 255, 255, 0.06);
}

.sess.active {
  background: rgba(99, 102, 241, 0.35);
}

.sess .t {
  font-size: 13px;
  font-weight: 600;
}

.sess .d {
  font-size: 11px;
  opacity: 0.65;
  margin-top: 4px;
}

.sess .del {
  position: absolute;
  right: 4px;
  top: 8px;
}

.main {
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  width: 77vw;
  height: 80vh;
  margin-left: 6vw;
  overflow: hidden;
}

.filters {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
}

.message {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px 100px;
}

.empty {
  text-align: center;
  color: #94a3b8;
  padding: 48px 16px;
  font-size: 14px;
}

.pending-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
}

.pending-sys-icon {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(145deg, #6366f1, #7c3aed);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
  margin-top: 2px;
  animation: pending-pulse 1.6s ease-in-out infinite;
}

.pending-sys-ic {
  font-size: 22px;
}

.pending-bubble {
  max-width: min(420px, 88%);
  padding: 12px 16px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
  font-size: 14px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 4px;
}

.pending-label {
  font-weight: 500;
}

.pending-dots span {
  animation: dot-fade 1.2s ease-in-out infinite;
}

.pending-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.pending-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pending-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.92;
    transform: scale(0.97);
  }
}

@keyframes dot-fade {
  0%,
  100% {
    opacity: 0.25;
  }
  50% {
    opacity: 1;
  }
}

.input-bar {
  display: flex;
  gap: 12px;
  padding: 12px 16px 16px;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  align-items: center;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: flex-start;
}

.send {
  height: 4vh;
  width: 4vw;
}
</style>