# 2026-04-16 — ArchTrail 网页版设计文档（v1.0）

> 配套阅读：`../../app/docs/plan/design.md`（移动端 UX 规范）+ `../../app/docs/plan/api-spec.md`（mobile API v1.1）

## 0. 项目定位

**目标**：把现有 React Native 移动端 ArchTrail（古桥文化知识应用）的 C 端体验完整复刻到桌面端浏览器，面向桥梁爱好者公开访问。

**核心约束**：
- 拍照识桥功能在 web 端简化为「图片上传」（`<input type="file">` + 拖拽区）
- 其余功能（浏览/搜索/地图/QA/闪卡/收藏复习历史）完整复刻
- **桌面端为主**（电脑版网页），不做 mobile-first 布局
- **后端零改动**：直接复用 mobile API `/api/mobile/v1/*`（21 个端点全覆盖）

**SEO 与公开访问**：选择 Next.js 15 App Router，桥梁/知识点详情页可被搜索引擎收录。

## 1. 技术栈

| 维度 | 选型 | 理由 |
|------|------|------|
| 框架 | Next.js 15 + React 19 | App Router + RSC + SEO 友好 |
| 样式 | Tailwind CSS v4 + shadcn/ui | 与 RAG/web admin 同源；与移动端 NativeWind 设计 token 可对齐 |
| 数据 | TanStack Query v5 + Zustand v5 | 与移动端同栈，最大化复用 |
| 持久化 | localStorage（device_id、language）+ IndexedDB（query persist） | Web 等价物 |
| 地图 | 高德 JS API 2.0（`@amap/amap-jsapi-loader`） | 替代 react-native-amap3d，合规角标共用 `/config` 数据 |
| SSE | 自建 fetch + ReadableStream 客户端 | EventSource 不支持 POST，必须自建 |
| 测试 | vitest + @testing-library/react + playwright（E2E） | webapp-testing skill 已有 playwright |
| 部署 | Vercel / Cloudflare Pages | 静态 + Edge SSR |

## 2. 项目结构

```
4C2026/web/
├── package.json
├── next.config.ts
├── tsconfig.json                 # paths: "@/*" → "./src/*"
├── .env.local                    # NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/mobile/v1
├── .env.production               # NEXT_PUBLIC_API_BASE_URL=https://<prod>/api/mobile/v1
├── docs/plans/                   # 本文件 + 后续 impl plan
└── src/
    ├── app/
    │   ├── layout.tsx            # Providers + Header + 全局 QASheet
    │   ├── page.tsx              # 知识图谱（首页）
    │   ├── map/page.tsx
    │   ├── search/page.tsx
    │   ├── recognize/page.tsx
    │   ├── me/page.tsx
    │   ├── bridges/[id]/page.tsx
    │   ├── knowledge/[id]/page.tsx
    │   └── flashcards/[kpId]/page.tsx
    ├── api/                      # 复用 app/src/api（types/client/hooks）
    ├── stores/                   # 复用 app/src/stores（device 改 localStorage）
    ├── components/
    │   ├── layout/               # Header / Sidebar / Footer / 合规角标
    │   ├── bridge/               # BridgeCard / BridgeHero / SectionAccordion
    │   ├── knowledge/            # KnowledgeTreeWeb / KnowledgePointDetail
    │   ├── map/                  # AMapContainer / ClusterLayer / ResultDrawer
    │   ├── qa/                   # QASheet（Dialog 版） + SSE 渲染器
    │   ├── flashcard/            # FlashCardFlip / ReviewSession
    │   └── ui/                   # shadcn/ui 基础组件
    ├── lib/
    │   ├── sse-client.ts         # POST + ReadableStream 解析 SSE
    │   ├── amap-loader.ts        # 高德 JS API 单例加载
    │   └── device-id.ts          # localStorage device_id
    └── providers/
        ├── QueryProvider.tsx     # TanStack Query + persist
        └── ConfigProvider.tsx    # /config 全局配置
```

## 3. 路由 + 页面映射（桌面端布局）

| Web 路由 | 对应移动端 | 桌面端布局调整 |
|----------|-----------|---------------|
| `/` | (tabs)/index 知识图谱 | 三列：左侧四大主线 nav + 中间二/三级目录 + 右侧"最近浏览/今日复习" |
| `/map` | (tabs)/map | 左 70% 地图 + 右 30% 抽屉常驻（不再三档抽屉） |
| `/search` | (tabs)/search | 顶部搜索条 + 双列结果列表 |
| `/recognize` | (tabs)/recognize | 拖拽上传区 + 候选列表 |
| `/me` | (tabs)/profile | 三 Tab：收藏 / 复习 / 历史，左侧锚点导航 |
| `/bridges/[id]` | bridge/[id] | 左主内容（图片+档案+四章节） + 右目录浮动+关联知识点 |
| `/knowledge/[id]` | knowledge/[id] | 左 L0/L1/L2 + 右目录+典型桥梁 |
| `/flashcards/[kpId]` | flashcards/[kpId] | 居中翻卡，最大宽度限制 |

**全局 UI**：
- Header：Logo + 5 个主导航 + 全局搜索 + "提问" 按钮
- 全局 QASheet：Radix Dialog 实现的右侧滑出面板
- 合规角标：地图来源 + 审图号，固定在地图页左下角
- 快捷键：⌘K / Ctrl+K 全局搜索；? 打开提问

## 4. 数据层

```
[ Server API /api/mobile/v1 ]
            │
            ▼
[ apiClient（fetch + AbortController）]   ← 复用 app/src/api/client.ts
            │
   ┌────────┴────────┐
   ▼                 ▼
[ TanStack Query ]  [ SSE Stream Client ]
   │                 │
   │  hooks/         │  lib/sse-client.ts
   │  - useConfig    │  POST + ReadableStream
   │  - useBridges   │  解析 event:/data: 行
   │  - useFavorites │  yield 各种事件
   │  ...
   ▼                 ▼
[ React Components（Client）]
            ▲
[ Zustand Stores ]
   - deviceStore：device_id / language（持久化到 localStorage）
   - filterStore：地图/搜索筛选条件
   - qaStore：QASheet 开关 / 当前问题 / 流式累积状态
```

**关键改造点**：
- `apiClient.ts`：`useDeviceStore` 行为改成读 localStorage（保持同名 hook 接口）
- `deviceStore.ts`：init 时若 localStorage 没有 device_id，`crypto.randomUUID()` 生成并写入
- `sse-client.ts`：必须用 fetch + ReadableStream（mobile API 的 SSE 是 POST，EventSource 不支持）
- TanStack Query persist：用 `idb-keyval` 适配 IndexedDB（替代 AsyncStorage）

## 5. 三个特殊模块

### 5.1 地图

- 高德 JS API 2.0：`AMapLoader.load({ key, version: '2.0', plugins: ['AMap.MarkerCluster'] })`
- 单例 loader（`lib/amap-loader.ts`），避免多次加载
- 地图来源 + 审图号 = `GET /config` 的 `map.provider` / `map.approval_number`
- viewport 变化时取 bounds + zoom，调 `GET /bridges/clusters`
- 点击 cluster 放大；点击 point 调 `GET /bridges/{id}` 在右侧抽屉常驻显示
- 高德 Web API key 需放在 `NEXT_PUBLIC_AMAP_KEY`

### 5.2 识景（图片上传版）

- `<input type="file" accept="image/*">` + 拖拽区
- 校验 ≤ 5MB；JPEG / PNG
- FormData → `apiClient.upload('/recognition', formData)`
- 候选列表 + fallback 走 `/search` 或 `/map?region=`
- 不集成相机 API，不要求定位权限

### 5.3 问答 SSE

```ts
// lib/sse-client.ts 草案
export async function* askQuestion(req: AskRequest): AsyncGenerator<QAEvent> {
  const res = await fetch(`${BASE}/qa/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
    body: JSON.stringify(req),
  });
  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += value;
    const { events, remainder } = parseSSEFrames(buf);
    for (const ev of events) yield ev;
    buf = remainder;
  }
}
```

QASheet 用 Zustand 累积事件（outline → details[] → deep_dive → sources），渲染时按到达顺序展示骨架屏占位 → 内容填充。

## 6. 渐进式披露 UI

### 6.1 知识点详情（L0/L1/L2）

- L0：默认展开，每条要点是 `<details>` 折叠卡（hover 出"展开/提问"按钮）
- L1：点击 L0 卡 → 同卡内向下展开 explanation + illustrations + related_terms 标签云 + citations 角标
- L2：底部独立区域，三栏 Tab：对比 / 演变 / 争议
- 引用角标 [1] [2] hover 显示来源弹窗

### 6.2 桥梁详情

- 顶部 Hero：图片轮播（Embla Carousel）；无图时桥型对应占位图
- 档案卡：紧贴 Hero
- 四大章节用 shadcn Accordion，每个 Item 内部 L0/L1
- 空章节灰字"该章节内容待补充"
- 右栏浮动：当前章节锚点 + 关联知识点列表

### 6.3 Flashcard 翻卡

- Framer Motion `rotateY` + perspective 翻面动画
- 键盘快捷键：← / → 切卡，空格翻面，1=已掌握，2=待复习
- ReviewSession：依次播放队列，最后展示总结卡

## 7. 错误处理

| 场景 | UI |
|------|-----|
| 网络/服务异常（5xx） | 全屏 `<ErrorState>` + 重试按钮 |
| 详情 404 | 友好空页 + "回到首页" |
| SSE 中断 | QASheet 内显示"连接中断，请重新提问" |
| 上传超 5MB | 表单内联提示，不弹 toast |
| 收藏接口 409 重复 | 静默吞，按已收藏处理 |
| 限流 429 | 顶部 banner 提示"请稍后重试" |

全局 `ErrorBoundary` 包裹根布局；技术细节（错误码/堆栈）禁止暴露给用户。

## 8. 测试策略

| 层级 | 工具 | 覆盖重点 |
|------|------|---------|
| 类型 | tsc --noEmit | 全量 |
| 单元 | vitest + @testing-library/react | api 类型 / stores / sse-client 解析 / device-id 生成 |
| E2E | playwright | 5 个核心路径：首页 → 搜索 → 桥梁详情 → QA 问答 → 收藏 |

## 9. 部署

- 本地：`npm run dev` (port 3000)，连本地后端 `http://localhost:8000`（后端 CORS 已配置 `localhost:3000`）
- 生产：Vercel 或 Cloudflare Pages
- 环境变量：`NEXT_PUBLIC_API_BASE_URL`、`NEXT_PUBLIC_AMAP_KEY`

## 10. MVP 验收清单（对齐移动端 design.md §10）

1. 5 个主入口可用：知识图谱（首页） / 地图 / 识景 / 搜索 / 我的
2. 知识点详情：L0/L1/L2 渐进式披露；可跳地图高亮典型桥例
3. 桥梁详情：图片轮播 + 档案卡 + 四章节 L0/L1 + 关联知识点
4. 问答：右侧 Sheet 弹出，SSE 流式渲染要点 → 详情 → 深挖 → 来源
5. 问答证据不足：显示降级 fallback_actions
6. 识景：拖拽/选择上传 → Top 候选 + 兜底入口
7. Flash Cards：概念卡 + 辨识卡，翻卡 + 标记 + 进入今日复习
8. 地图：viewport 聚类、筛选条、合规角标固定
9. 搜索：待输入态显示历史 + 推荐；类型选择动态过滤器；空结果有别名提示
10. 全局空/加载/错误状态规范
11. 我的：今日复习突出 + 收藏列表 + 浏览历史按日期分组 + 设置
12. SEO：bridges/[id]、knowledge/[id] 服务端可渲染，meta 标签齐全

---

## 复用 vs 重写边界总结

| 来源（mobile） | 复用方式 | Web 端去向 |
|---------------|---------|-----------|
| `app/src/api/types.ts` | 直接拷贝 | `web/src/api/types.ts` |
| `app/src/api/client.ts` | 拷贝后改 device 适配 | `web/src/api/client.ts` |
| `app/src/api/hooks/*` | 直接拷贝（TanStack Query 同栈） | `web/src/api/hooks/*` |
| `app/src/stores/qaStore.ts` | 拷贝（zustand 同栈） | `web/src/stores/qaStore.ts` |
| `app/src/stores/filterStore.ts` | 拷贝 | `web/src/stores/filterStore.ts` |
| `app/src/stores/deviceStore.ts` | 拷贝后改 localStorage | `web/src/stores/deviceStore.ts` |
| `app/src/constants/config.ts` | 参考逻辑，改用 `process.env.NEXT_PUBLIC_*` | `web/src/constants/config.ts` |
| `app/src/constants/theme.ts` | 复用色板 → 映射 shadcn 主题 token | `web/tailwind.config.ts` |
| `app/src/components/*.tsx` | **不复用**（RN View → React DOM 全部重写） | `web/src/components/*` |
