# 页面截图目录

将实际项目运行截图放入此目录，并严格按照以下文件名保存，README 中已引用这些路径：

| 文件名 | 对应页面 | 建议截图内容 |
|--------|----------|--------------|
| `home.png` | 首页 `http://localhost:3000` | 单词卡片列表、搜索框、复习状态 |
| `modal.png` | 首页点击卡片后弹出的 AI 弹窗 | 词根解析、记忆口诀、双语例句三区 |
| `login.png` | 登录页 `http://localhost:3000/login` | 登录/注册表单 |
| `history.png` | 历史页 `http://localhost:3000/history` | 学习记录列表、日期筛选 |
| `practice.png` | 闯关页 `http://localhost:3000/practice` | 四选一答题界面 |

## 操作步骤

1. 启动后端：`cd backend && python app.py`
2. 启动前端：`cd frontend && npm run dev`
3. 访问 `http://localhost:3000`
4. 使用系统截图或浏览器 DevTools（Ctrl+Shift+S / F12 → 截图）截取每个页面
5. 将图片重命名为上表文件名，放到本目录
6. 提交并推送：
   ```bash
   git add screenshots/
   git commit -m "docs: add project screenshots"
   git push origin main
   ```

> 截图格式建议为 PNG，宽度 1200px 左右即可，保持 README 表格排版整齐。
