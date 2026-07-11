# Day 1 Prompt 存档

## 细分 Prompt 列表

### Prompt1：前端 Next 项目初始化
- 功能：创建 Pages Router 模式的 Next.js 项目，安装 antd 组件库
- 对应文件：frontend/（整体目录结构）

### Prompt2：前端导航布局 + 3 个页面
- 功能：封装公共 Layout 组件（顶部导航），创建 3 个路由页面
- 对应文件：components/Layout.js、pages/index.js、pages/ai-test.js、pages/record.js

### Prompt3：Flask 后端分层骨架
- 功能：搭建 Flask 分层后端，注册 3 个路由蓝图，全局 CORS
- 对应文件：backend/app.py、backend/config.py、backend/routes/*.py

### Prompt4：生成 .gitignore 配置文件
- 功能：生成覆盖前端 node_modules/.next + Python venv/pyc + IDE 的忽略规则
- 对应文件：.gitignore
