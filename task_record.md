# AI 单词记忆系统 — 实训开发任务记录

## 项目概述

基于 Next.js + Flask + Supabase 的全栈 AI 英语单词记忆系统，支持单词浏览、AI 记忆素材生成、学习记录管理、单词搜索与掌握标记等功能。

| 项目 | 说明 |
|------|------|
| 前端 | Next.js Pages Router + Ant Design |
| 后端 | Python Flask + Supabase Python SDK |
| 数据库 | Supabase PostgreSQL (words / users / study_record) |
| AI | 模拟 AI 生成词根解析、记忆口诀、双语例句 |
| Git | 仅 GitHub 单仓库，12 轮规范提交 |

---

## Day 1: 项目骨架搭建 + Supabase 数据库搭建

**日期**: 第 1 天

### 完成功能
1. 初始化 Next.js + Flask 前后端项目结构
2. 创建 3 个前端路由页面：首页 `/`、登录页 `/login`、背诵历史 `/history`
3. 搭建 Flask 分层后端：`app.py` 入口 + `routes/` 蓝图路由 + `config.py` 配置
4. 配置 CORS 跨域，前后端联通
5. 在 Supabase 创建 `words`、`users`、`study_record` 三张数据表
6. 配置 RLS 行级安全权限
7. 插入 10 条测试单词数据

### Git 提交记录
| # | Commit | 说明 |
|---|--------|------|
| 1 | `71c1977` | feat: 搭建全栈项目基础骨架，完成3个前端路由页面与Flask分层后端空接口 |
| 2 | `ac74734` | fix: 配置 Next.js transpilePackages 解决 Ant Design rc-util 模块解析错误 |
| 3 | `0c702f1` | feat: 配置Supabase云端数据库连接，创建单词/用户/学习记录数据表 |
| 4 | `c52578b` | feat: 实现单词分页/详情查询后端接口，优化首页单词卡片UI样式 |

---

## Day 2: AI 记忆接口 + 前端联调

**日期**: 第 2 天

### 完成功能
1. 开发 AI 记忆素材生成接口 `POST /api/ai/memo`
2. 实现词根解析、趣味记忆口诀、日常例句三模块输出
3. Supabase 客户端连接成功，验证数据读取正常
4. 修复 Python 语法错误（中文引号）
5. 前端首页与后端接口完整联调

### Git 提交记录
| # | Commit | 说明 |
|---|--------|------|
| 5 | `47d1278` | feat: 开发AI单词记忆素材生成接口，前端联调渲染单词数据与AI释义 |
| 6 | `6fab065` | fix: 修复ai_api.py中文引号导致Python语法错误 |
| 7 | `5730e76` | fix: 修正supabase-python依赖版本(>=2.15)以兼容新版sb_密钥格式 |

---

## Day 3: 用户系统 + 学习记录

**日期**: 第 3 天

### 完成功能
1. 用户登录/注册接口 `POST /api/user/login`（自动注册）
2. 学习记录新增接口 `POST /api/study/add`
3. 学习记录分页查询接口 `GET /api/study/list`
4. 前端登录页（含本地存储用户状态）
5. 前端背诵历史页（学习记录列表 + AI 弹窗复习）
6. 首页增加"保存学习记录"按钮
7. 拆分 Git 提交为 4 个独立 commit

### Git 提交记录
| # | Commit | 说明 |
|---|--------|------|
| 8 | `9710523` | feat: 新增用户登录/注册接口 |
| 9 | `2ef364b` | feat: 新增学习记录CRUD接口 |
| 10 | `672853c` | feat: 前端新增登录页与背诵历史页 |
| 11 | `4a0a068` | feat: 首页保存学习记录功能与AI接口字段修复 |

---

## Day 4: UI 美化 + 交互优化 + 文档归档

**日期**: 第 4 天

### 完成功能
1. **全站 UI 美化**: 低饱和渐变纯色背景、统一主色调卡片、圆角阴影、按钮 hover 动效
2. **移动端适配**: 卡片自适应、分页控件堆叠、弹窗自适应宽度
3. **AI 弹窗优化**: 词根/口诀/例句分三区带分割线，渐变彩色分区视觉
4. **骨架屏/空状态美化**: 加载骨架、空数据占位、报错页面统一视觉风格
5. **分页防抖**: 300ms 防抖避免重复请求
6. **AI 超时重试**: 30s 超时倒计时 + 进度条 + 重试按钮
7. **登录实时校验**: 用户名 2-50 字符限制，实时提示
8. **日期筛选**: 背诵历史页可按日期过滤记录
9. **单词查重**: 后端插入时自动检测重复单词
10. **统一错误提示**: 全局封装 `showError/showSuccess/showWarning` 方法
11. **README.md**: 完整项目文档（技术栈、配置、启动、数据库、API 文档）
12. **prompt_log.md**: Day1-Day4 全部 12 条 AI 开发 Prompt 归档

### Git 提交记录
| # | Commit | 说明 |
|---|--------|------|
| 12 | `7079398` | feat: 全站简约UI美化，配置渐变纯色护眼背景 |
| 13 | `fe100b3` | fix: 优化交互容错，分页防抖、单词查重、日期筛选、超时重试 |
| 14 | `2b502f4` | docs: 编写完整项目README说明文档 |
| 15 | `1285fb2` | docs: 归档全项目AI开发Prompt，整理实训开发日志文档 |

---

## Day 5: 验收修复 + 拓展功能 + 交付打包

**日期**: 第 5 天

### 完成功能
1. **全流程验收**: 走通登录→浏览单词→AI 生成→保存记录→历史页筛选完整闭环
2. **Bug 修复**: 统一后端错误提示文案、修复 record.py 计数查询、优化移动端导航菜单
3. **视觉细节**: 全局间距/字号微调、移动端 Header 汉堡菜单、按钮圆角统一
4. **单词模糊搜索**: 首页新增搜索框，支持单词/释义实时检索
5. **单词掌握标记**: 每张卡片添加「标记掌握/已掌握」按钮，调用后端状态更新接口
6. **复习状态筛选**: 背诵历史页可按"待复习/已掌握"筛选记录
7. **数据库 SQL 更新**: 更新 `init.sql` 匹配实际表结构 + 增加 `review_status` 字段
8. **task_record.md**: Day1-Day5 完整开发任务记录

### Git 提交记录
| # | Commit | 说明 |
|---|--------|------|
| 16 | `df84c7d` | fix: 全流程验收修复遗留细微bug，统一全站提示文案与视觉细节 |
| 17 | `ee0b56e` | feat: 拓展新增单词模糊搜索、单词掌握标记功能，支持复习状态筛选 |
| 18 | (本文件) | docs: 整理实训交付全套材料，新增每日开发任务记录文档 |

### 额外说明：掌握标记功能需要 SQL
由于 REST API 无法执行 DDL 语句，请先在 Supabase SQL Editor 中执行：
```sql
ALTER TABLE words ADD COLUMN IF NOT EXISTS review_status INTEGER DEFAULT 0;
```

---

## 技术架构总结

```
frontend/ (Next.js + Ant Design)
├── pages/
│   ├── index.js    → 单词首页（分页浏览 + AI弹窗 + 搜索 + 掌握标记）
│   ├── login.js    → 用户登录/注册
│   └── history.js  → 背诵历史（日期筛选 + 复习状态筛选 + 复习弹窗）
├── components/
│   └── Layout.js   → 全局布局（顶部导航 + 移动端汉堡菜单）
├── utils/
│   └── errorHandler.js → 统一错误提示
└── styles/
    └── globals.css → 全局样式 + 移动端适配

backend/ (Flask + Supabase)
├── app.py         → 应用入口
├── config.py      → 配置管理
├── supabase_client.py → Supabase 客户端单例
├── routes/
│   ├── word.py    → 单词 CRUD + 模糊搜索 + 状态更新
│   ├── ai_api.py  → AI 记忆素材生成
│   ├── record.py  → 学习记录增查 + 日期/状态筛选
│   └── user.py    → 用户登录/注册
└── seed_kaoyan_words.py → 考研词汇批量导入脚本

database/
└── init.sql       → 完整建表 SQL + 测试数据

prompt-record/     → 4天全部 AI 对话截图
prompt_log.md      → 全部 Prompt 归档
README.md          → 项目说明文档
task_record.md     → 本文件：开发任务记录
```

---

## 自查清单

- [x] 首页 / 登录 / 历史三页面完整可用
- [x] 纯色渐变背景，无外部图片
- [x] 移动端自适应正常
- [x] 分页防抖、AI 超时重试、单词查重全部正常
- [x] 日期筛选、复习状态筛选功能可用
- [x] 单词模糊搜索可用
- [x] README.md、prompt_log.md、task_record.md 三份文档齐全
- [x] 12 轮规范 Git 提交，仅 GitHub 单仓库
- [x] .gitignore 已屏蔽 .env / .env.local 密钥文件
