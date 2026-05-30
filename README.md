# DietTracker — 智能减重 PWA

📸 拍照识食 · 🤖 AI 营养分析 · 🏃 运动追踪 · ⚖️ 体重管理 · 👥 小圈子打卡

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:5173

## 部署到 Vercel

```bash
npx vercel
```

或从 GitHub 直接导入到 Vercel，无需配置环境变量。Vercel 会自动检测 [vercel.json](vercel.json)。

## 功能

| 功能 | 说明 |
|---|---|
| 📸 拍照识别 | 调用 GPT-4o Vision 分析食物营养成分 |
| 📝 配料解析 | AI 解析食品配料表，估算每 100g 营养 |
| 🔍 食物搜索 | 170+ 种中式常见食物库，离线可用 |
| 🏃 运动追踪 | 30+ 种运动 MET 值，自动计算消耗热量 |
| ⚖️ 体重管理 | 记录体重、自动算 BMI、趋势图 |
| 📊 Bento 仪表盘 | 环形热量图 + 营养素进度条 + 智能每日点评 |
| 👥 小圈子 | 极简打卡社交，仅存昵称/打卡/趋势方向 |
| 📤 导入导出 | JSON 格式，数据 100% 属于你 |
| 🌙 暗色模式 | 支持系统级暗色模式 |

## 技术栈

React 19 · Vite 5 · TypeScript · Tailwind CSS · shadcn/ui (Radix) · IndexedDB · Web Crypto · PWA

## 自定义修改入口

| 想改什么 | 去哪里 |
|---|---|
| 🎨 主题色 | [src/index.css](src/index.css) CSS 变量 `--primary` / `--secondary` |
| 🏃 运动 MET 库 | [src/data/exercises.ts](src/data/exercises.ts) |
| 🥘 食物库 | [src/data/foods.ts](src/data/foods.ts) |
| 🍽️ 饮食配比 | [src/data/dietProfiles.ts](src/data/dietProfiles.ts) |
| 🤖 AI 识别 Prompt | [src/lib/openai.ts](src/lib/openai.ts) `VISION_MODEL` / prompts |
| 🔢 热量公式 | [src/lib/calc.ts](src/lib/calc.ts) Mifflin-St Jeor BMR 公式 |
| 💬 智能点评 | [src/lib/dailyAdvice.ts](src/lib/dailyAdvice.ts) 规则条件 |

## 小圈子部署

圈子功能依赖 Vercel Serverless + Vercel KV：

1. 在 Vercel Dashboard → Storage → 创建 KV 数据库
2. 连接 KV 到本项目的 Vercel 实例
3. 将 [api/circle.ts](api/circle.ts) 中的内存存储替换为 `@vercel/kv` 的 `kv` 实例
4. 部署即可

不使用 KV 时，圈子在内存中运行（每次部署重置）。

## 隐私

- **全部数据存本地 IndexedDB**，不经过任何第三方
- **API Key 使用 Web Crypto AES-GCM 加密**，不可提取
- **小圈子仅同步：昵称 + 头像色 + 打卡状态 + 连续天数 + 体重趋势方向**
- **绝不同步任何具体体重、热量、营养素数字**
