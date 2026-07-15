# AI 单词记忆系统 — 实训交付材料

## 项目概况

| 项目 | 说明 |
|------|------|
| 项目名称 | AI 单词记忆 (AI Word Memory) |
| 技术栈 | Next.js (Pages Router) + Flask + Supabase PostgreSQL |
| 前端端口 | localhost:3000 |
| 后端端口 | localhost:5000 |
| Git 仓库 | https://github.com/Yuuuux24/ai-word-memory.git |
| 分支 | main |
| 提交总数 | 19 轮 |

---

## 材料清单

### 1. 源代码（`../` 项目根目录）

```
ai-word-memory/
├── backend/          # Flask 后端（4 个路由蓝图 + 种子脚本）
├── frontend/         # Next.js 前端（4 个页面 + 2 个组件）
├── database/         # 数据库初始化 SQL + RLS 策略
├── prompt-record/    # Day1~Day5 AI 对话截图归档
├── README.md         # 项目说明文档
├── prompt_log.md     # 全部 AI 开发 Prompt 归档
└── task_record.md    # 每日开发任务记录
```

### 2. 页面功能清单

| 页面 | 路由 | 核心功能 |
|------|------|---------|
| 首页 | `/` | 单词分页浏览、模糊搜索、复习状态标记、AI 记忆弹窗 |
| 登录页 | `/login` | 用户名+密码登录、注册切换、状态持久化 |
| 背诵历史 | `/history` | 学习记录分页、日期筛选、状态筛选、复习弹窗 |
| 单词闯关 | `/practice` | 四选一答题、3次掌握+冷却复现、里程碑提示 |
| 404 页面 | `/*` | 自定义 404 错误页面 |

### 3. API 接口清单

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/words?page=&size=&keyword=` | 单词分页 + 模糊搜索 |
| GET | `/api/words/:id` | 单词详情 |
| POST | `/api/words` | 新增单词（含查重） |
| PUT | `/api/words/:id/status` | 更新复习状态 |
| DELETE | `/api/words/:id` | 删除单词 |
| POST | `/api/ai/memo` | AI 生成记忆素材 |
| POST | `/api/user/register` | 用户注册 |
| POST | `/api/user/login` | 用户登录 |
| POST | `/api/study/add` | 新增学习记录 |
| GET | `/api/study/list` | 学习记录分页查询 |
| DELETE | `/api/study/:id` | 删除学习记录 |

### 4. 数据库表

| 表名 | 说明 | RLS |
|------|------|:--:|
| words | 单词表（含音标、释义、复习状态） | YES |
| users | 用户表（含密码哈希） | YES |
| study_record | 学习记录表（外键关联） | YES |

### 5. Git 提交记录（最近 9 轮）

```
810566c feat: 新增单词闯关页面（四选一+答对3次掌握+冷却复现+里程碑提示）
e5bf757 feat: 登录页面增加密码验证与注册切换功能
f54c23b feat: 新增 404 自定义错误页面
33a8cb1 fix: 修复废弃API（bodyStyle→styles）、清理未使用变量、补充缺失import
e059de7 feat: 新增单词删除接口 + 学习记录删除功能（前端确认弹窗）
89b4474 refactor: 抽取公共 AI 记忆素材弹窗组件 AIMemoModal
5c3c349 perf: 修复学习记录分页性能 + DELETE 接口
ee0b56e feat: 拓展新增单词模糊搜索、单词掌握标记功能，支持复习状态筛选
df84c7d fix: 全流程验收修复遗留细微bug，统一全站提示文案与视觉细节
```

### 6. 安全合规

- [x] `.env` / `.env.local` 已加入 `.gitignore`，未提交密钥
- [x] Supabase Publishable Key 仅前端，Secret Key 仅后端
- [x] 数据库 RLS 已配置，匿名只读，写入后端受控
- [x] 用户密码使用哈希存储
- [x] 未登录自动重定向，无越权访问

### 7. 启动方式

```bash
# 后端
cd backend && pip install -r requirements.txt && python app.py

# 前端
cd frontend && npm install && npm run dev
```

访问 http://localhost:3000

---

> 生成时间：2026-07-15 | 实训项目：AI 单词记忆全栈 Web 应用
