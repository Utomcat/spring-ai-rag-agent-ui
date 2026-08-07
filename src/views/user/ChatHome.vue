<template>
  <div class="chat-wrap">
    <el-card class="card" shadow="hover">
      <div class="layout">
        <!-- 会话列表-->
        <aside class="side">
          <!-- 新建会话按钮 -->
          <div class="side-head">
            <el-button
              type="primary"
              icon="Plus"
              round
              size="small"
              @click="newChat"
              >新对话</el-button
            >
          </div>
          <!-- 总数 + 每页条数（与底部分页共享 page/size/total 状态） -->
          <div class="side-meta">
            <el-pagination
              v-model:current-page="page"
              v-model:page-size="size"
              :page-sizes="[10, 100, 200, 300, 400]"
              :size="componentSize"
              :disabled="disabled"
              :background="background"
              layout="total, sizes"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
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
              <div class="t">{{ s.title || "未命名" }}</div>
              <div class="d">{{ formatDateTime(s.updateTime) }}</div>
              <el-button
                class="del"
                text
                type="danger"
                icon="Delete"
                @click="removeSession(s.id, $event)"
              />
            </div>
          </div>
          <!-- 分页插件：底部仅保留翻页 + 前往X页，保证单行显示 -->
          <div class="side-pagination">
            <el-pagination
              v-model:current-page="page"
              v-model:page-size="size"
              :page-sizes="[10, 100, 200, 300, 400]"
              :size="componentSize"
              :disabled="disabled"
              :background="background"
              layout="prev, pager, next, jumper"
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
              <el-option
                v-for="c in categories"
                :key="c.id"
                :label="c.name"
                :value="c.id"
              />
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
              :streaming="
                streaming &&
                idx === messages.length - 1 &&
                m.role === 'ASSISTANT'
              "
              :status="statusText"
              :user-avatar-src="chatUserAvatarSrc"
              :user-avatar-text="chatUserAvatarText"
              :user-avatar-style="chatUserAvatarStyle"
              :message-id="m.id"
              :my-feedback="feedbacks[m.id]"
              @feedback="handleFeedback"
              @cancel-feedback="handleCancelFeedback"
            />
          </div>
          <div class="input-bar">
            <el-input
              v-model="input"
              type="textarea"
              :rows="3"
              class="input-textarea"
              placeholder="输入问题，Enter 发送（Shift+Enter 换行）"
              @keydown.enter.exact.prevent="send"
            />
            <el-button
              v-if="!streaming"
              type="primary"
              class="send"
              :loading="sending"
              @click="send"
              >发送</el-button
            >
            <el-button v-else type="danger" class="send" @click="stopGeneration"
              >停止生成</el-button
            >
          </div>
        </main>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import { useAuthFileUrl } from "../../utils/files";
import { ComponentSize } from "element-plus";
import { useUserStore } from "../../stores/user";
import { formatDateTime } from "../../utils/date";
import { listCategories } from "../../api/category";
import { Category } from "../../data/category/Category";
import ChatMessage from "../../components/ChatMessage.vue";
import { avatarFallbackBg } from "../../utils/avatarFallback";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { SessionResponse } from "../../data/chat/SessionResponse";
import { MessagesResponse } from "../../data/chat/MessagesResponse";
import {
  askStream,
  deleteSession,
  listMessages,
  listSessions,
} from "../../api/chat";
import {
  MessageFeedback,
  submitFeedback,
  fetchMyFeedback,
  cancelFeedback,
} from "../../api/messageFeedback";
import { ElMessage } from "element-plus";

const route = useRoute();
const userStore = useUserStore();

/*当前页码*/
const page = ref<number>(1);
/*当前页数据数量*/
const size = ref<number>(100);
/*数据总量*/
const total = ref<number>(0);
/*分页大小, 可选值 ['large' | 'default' | 'small']*/
const componentSize = ref<ComponentSize>("small");
/*是否为分页按钮添加背景色*/
const background = ref<boolean>(false);
/*是否禁用分页*/
const disabled = ref<boolean>(false);

/*当前登录用户所进行过会话的会话列表存储对象 - 为避免当前会话列表加载过多, 只进行当前页的历史会话展示*/
const sessions = ref<SessionResponse[]>([]);
/*指定会话的消息列表*/
const messages = ref<MessagesResponse[]>([]);
/*当前激活的会话ID*/
const activeId = ref<number>(Number(null));
/*当前选中的知识库分类ID*/
const categoryIds = ref<number[]>([]);
/*当前系统中拥有的知识库分类数据列表*/
const categories = ref<Category[]>([]);
/*用户输入的内容*/
const input = ref<string>("");
/*用户是否发送中消息的状态*/
const sending = ref<boolean>(false);
/*流式请求控制器 - 用于取消流式响应*/
let streamController: AbortController | null = null;
/*是否正在流式生成中*/
const streaming = ref<boolean>(false);
/*等待首个 Token 时的状态文案（如“正在检索知识库…”）*/
const statusText = ref<string>("");
/*会话消息 HTML 元素*/
const msgEl = ref<HTMLElement | null>(null);
/*会话消息单页拉取条数(后端上限 100)*/
const MESSAGE_PAGE_SIZE = 100;

/*消息反馈缓存 - key 为 messageId, value 为当前用户对该消息的反馈*/
const feedbacks = ref<Record<number, MessageFeedback | null>>({});

/*聊天用户头像转换 - 头像文件需带鉴权下载(/files/** 不再匿名放行), 经 objectURL 缓存后绑定*/
const chatUserAvatarSrc = useAuthFileUrl(() => userStore.user?.avatar);
/*用户聊天用户名*/
const chatUserAvatarText = computed(() =>
  (userStore.user?.realName || userStore.user?.username || "?").slice(0, 1),
);

/*用户聊天头像样式*/
const chatUserAvatarStyle = computed(() =>
  userStore.user?.avatar
    ? undefined
    : avatarFallbackBg(userStore.user?.username),
);

/*聊天信息滚动到消息底部*/
const scrollMsgToBottom = async () => {
  await nextTick();
  const el = msgEl.value;
  if (el) {
    el.scrollTop = el.scrollHeight;
  }
};

/*解析参考来源JSON格式内容*/
const parseRefs = (refs: string | string[]) => {
  if (!refs) return [];
  if (typeof refs === "string") {
    try {
      return JSON.parse(refs);
    } catch {
      return [];
    }
  }
  return Array.isArray(refs) ? refs : [];
};

/*加载会话列表*/
const loadSessions = async () => {
  let res = await listSessions({
    page: Number(page.value),
    size: Number(size.value),
    condition: {},
  });
  sessions.value = res.data ?? [];
  /* 同步后端返回的总记录数, 供分页组件展示“共 X 条”并据此计算总页数 */
  total.value = Number(res.total) || 0;
  /* 同步后端实际生效的页码/页大小, 保证前端分页状态与后端一致(如后端对越界页码做了修正) */
  if (Number(res.page) > 0) page.value = Number(res.page);
  if (Number(res.size) > 0) size.value = Number(res.size);
};

/*会话选择 - 消息接口已改分页(破坏性变更), 后端按消息 ID 升序返回, 拉取最后一页即最新消息*/
const selectSession = async (id: number) => {
  activeId.value = id;
  let res = await listMessages(id, 1, MESSAGE_PAGE_SIZE);
  const totalMessages = Number(res.total) || 0;
  const lastPage = Math.max(1, Math.ceil(totalMessages / MESSAGE_PAGE_SIZE));
  if (lastPage > 1) {
    res = await listMessages(id, lastPage, MESSAGE_PAGE_SIZE);
  }
  messages.value = res.data ?? [];
  // 加载消息反馈
  await loadFeedbacks();
  await scrollMsgToBottom();
};

/*加载当前页消息的反馈状态*/
const loadFeedbacks = async () => {
  const assistantMessages = messages.value.filter(m => m.role === 'ASSISTANT' && m.id);
  for (const msg of assistantMessages) {
    try {
      const res = await fetchMyFeedback(msg.id!);
      feedbacks.value[msg.id!] = res.data;
    } catch {
      feedbacks.value[msg.id!] = null;
    }
  }
};

/*新建聊天*/
const newChat = async () => {
  activeId.value = Number(null);
  messages.value = [];
};

/*会话消息发送 - 流式响应*/
const send = async () => {
  const q = input.value.trim();
  if (!q || sending.value) return;
  sending.value = true;
  streaming.value = true;
  statusText.value = "正在检索知识库，请稍候";
  const sid = activeId.value;
  messages.value = [
    ...messages.value,
    {
      id: Number(null),
      sessionId: sid,
      role: "USER",
      content: q,
      refs: String(null),
      createTime: new Date().toISOString(),
    },
  ];
  input.value = "";
  await scrollMsgToBottom();

  // 添加一条空的 ASSISTANT 消息占位，用于流式填充
  messages.value = [
    ...messages.value,
    {
      id: Number(null),
      sessionId: sid,
      role: "ASSISTANT",
      content: "",
      refs: "[]",
      createTime: new Date().toISOString(),
    },
  ];
  await scrollMsgToBottom();

  const ids = categoryIds.value
    .map((id) => Number(id))
    .filter((n) => !Number.isNaN(n));
  streamController = askStream(
    { question: q, sessionId: sid, categoryIds: ids.length ? ids : null },
    {
      onStatus(type, message) {
        // 展示后端推送的阶段状态，如 "正在检索知识库..."、"正在调用工具..."
        const fallback =
          type === "tool_calling" ? "正在调用工具…" : "正在思考…";
        statusText.value = message || fallback;
      },
      onToken(content) {
        const last = messages.value[messages.value.length - 1];
        last.content += content;
        scrollMsgToBottom();
      },
      onReferences(refs) {
        const last = messages.value[messages.value.length - 1];
        last.refs = JSON.stringify(refs);
      },
      onDone(sessionId) {
        activeId.value = Number(sessionId);
        sending.value = false;
        streaming.value = false;
        statusText.value = "";
        streamController = null;
        loadSessions();
        scrollMsgToBottom();
      },
      onError(message) {
        const last = messages.value[messages.value.length - 1];
        if (!last.content) {
          last.content = message || "系统异常，请稍后重试";
        }
        sending.value = false;
        streaming.value = false;
        statusText.value = "";
        streamController = null;
        scrollMsgToBottom();
      },
    },
  );
};

/*停止生成*/
const stopGeneration = () => {
  if (streamController) {
    streamController.abort();
    streamController = null;
  }
  sending.value = false;
  streaming.value = false;
  statusText.value = "";
};

/*删除会话*/
const removeSession = async (id: number, ev: MouseEvent) => {
  ev.stopPropagation();
  await deleteSession(id);
  if (activeId.value === id) await newChat();
  await loadSessions();
};

/*分页大小改变监听事件*/
const handleSizeChange = (val: number) => {
  size.value = val;
  page.value = 1;
  loadSessions();
};

/*分页页码改变监听事件*/
const handleCurrentChange = (val: number) => {
  page.value = val;
  loadSessions();
};

onMounted(async () => {
  let c = await listCategories({
    page: 1,
    size: 1000,
    condition: {},
  });
  categories.value = c.data;
  await loadSessions();
  const qid = route.query.sessionId;
  if (qid) {
    await selectSession(Number(qid));
  }
});

watch(
  () => route.query.sessionId,
  (v) => {
    if (v) selectSession(Number(v));
  },
);

watch(
  () => messages.value.length,
  () => scrollMsgToBottom(),
);

watch(sending, (v) => {
  if (v) scrollMsgToBottom();
});

/*提交反馈*/
const handleFeedback = async (messageId: number, rating: number) => {
  try {
    await submitFeedback({ messageId, rating });
    const res = await fetchMyFeedback(messageId);
    feedbacks.value[messageId] = res.data;
    ElMessage.success(rating === 3 ? '感谢点赞' : '感谢反馈');
  } catch (e) {
    ElMessage.error('反馈提交失败');
  }
};

/*取消反馈*/
const handleCancelFeedback = async (messageId: number) => {
  try {
    await cancelFeedback(messageId);
    feedbacks.value[messageId] = null;
    ElMessage.success('反馈已取消');
  } catch (e) {
    ElMessage.error('取消反馈失败');
  }
};
</script>

<style scoped>
.chat-wrap {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.card {
  border-radius: 20px;
  border: none;
  overflow: hidden;
  /* 宽度随容器伸缩但限制最大值, 避免超宽屏下卡片被过度拉伸 */
  width: min(1560px, 100%);
  /* 高度跟随容器剩余高度(外层为确定高度的 flex 布局), 适配任意分辨率 */
  height: 100%;
  min-height: 480px;
  margin: 0 auto;
}

/* 卡片内部去除默认内边距, 让布局撑满 */
.card :deep(.el-card__body) {
  padding: 0;
  height: 100%;
}

.layout {
  display: grid;
  /* 侧栏固定像素宽度, 主区弹性占满剩余空间, 不再依赖 vw */
  grid-template-columns: clamp(220px, 20%, 320px) minmax(0, 1fr);
  /* 行高明确为 100%, 防止子元素被默认 stretch 拉伸超出容器导致底部被裁剪 */
  grid-template-rows: 100%;
  width: 100%;
  height: 100%;
}

.side {
  background: linear-gradient(180deg, #0f172a, #1e293b);
  color: #e2e8f0;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.side-head {
  margin-bottom: 10px;
}

/* 侧栏头部下方: 总数 + 每页条数, 单行居中 */
.side-meta {
  display: flex;
  flex-shrink: 0;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}
.side-meta :deep(.el-pagination) {
  flex-wrap: nowrap;
  white-space: nowrap;
  font-size: 12px;
}
.side-meta :deep(.el-pagination .el-select) {
  width: 78px;
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
  /* 底部仅保留翻页+跳转 4 组控件, 宽度充足, 强制单行并居中 */
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}

/* 分页内部控件强制单行, 压缩尺寸以适配窄侧栏 */
.side-pagination :deep(.el-pagination) {
  flex-wrap: nowrap;
  white-space: nowrap;
  justify-content: center;
  align-items: center;
  font-size: 12px;
}

/* 收紧各控件间距, 进一步节省横向空间 */
.side-pagination :deep(.el-pagination .el-pager li),
.side-pagination :deep(.el-pagination button) {
  min-width: 22px;
  padding: 0 4px;
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
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.filters {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
}

.message {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px 24px;
  /* Firefox 细滚动条 */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

/* Webkit 细滚动条: 默认半透明, 悬停加深, 替代原生粗滚动条 */
.message::-webkit-scrollbar {
  width: 6px;
}
.message::-webkit-scrollbar-track {
  background: transparent;
}
.message::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
  transition: background 0.2s ease;
}
.message::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 消息内容限制最大宽度并居中, 超宽屏下阅读体验不变形 */
.message > * {
  max-width: min(920px, 100%);
  margin-left: auto;
  margin-right: auto;
}

.empty {
  text-align: center;
  color: #94a3b8;
  padding: 48px 16px;
  font-size: 14px;
}

.input-bar {
  display: flex;
  gap: 12px;
  padding: 12px 16px 16px;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  align-items: center;
}

/* 输入框占满剩余宽度, 上限 820px, 不再使用 vw 固定宽度 */
.input-textarea {
  flex: 1;
  min-width: 0;
  width: min(820px, 100%);
}

.send {
  flex-shrink: 0;
  height: 40px;
  min-width: 76px;
}
</style>
