# AI Code Review 报告

**项目**: ai-word-memory  
**日期**: 2026-07-16  
**审查范围**: backend/ (14 文件) + frontend/ (9 文件)  

---

## 一、严重问题 (P0 - 应立即修复)

### 1. 多处 `json_response` 函数重复定义（DRY 违规）

**位置**: `routes/ai_api.py:23`、`routes/word.py:13`、`routes/user.py:13`、`routes/record.py:13`、`routes/practice.py:13`

```python
# 5 个文件各自重复定义了完全相同的函数
def json_response(code=200, data=None, msg='success'):
    return jsonify({'code': code, 'data': data, 'msg': msg})
```

**建议**: 抽取到 `utils.py`，所有路由统一引用。

---

### 2. `/api/ai/memo` 和 `/api/ai/generate` 逻辑完全重复

**位置**: `routes/ai_api.py:76-98` vs `routes/ai_api.py:106-132`

两个路由的代码 100% 相同（参数校验、风格解析、数据库查询、返回）。唯一区别是 `msg` 字段。

```python
# memo 返回
return json_response(data=word)

# generate 返回
return json_response(data=word, msg='OK')
```

**建议**: 合并为一个路由，或抽取公共函数 `_fetch_memo(word_id, style)`。

---

### 3. 无任何认证/鉴权机制

**位置**: 所有后端路由

所有 `POST/PUT/DELETE` 接口仅通过 `user_id` 入参来识别用户，**任何人可以传入任意 `user_id` 操作他人数据**：

```python
# record.py - 任何 user_id 都可以操作
user_id = body.get('user_id')
supabase.table('study_record').insert({'user_id': user_id, ...}).execute()
```

**建议**: 
- 引入 JWT Token，登录后签发，请求时验证
- 或在所有接口中通过 `@login_required` 装饰器保护
- 从 Token 解码 `user_id`，不信任客户端传入的值

---

## 二、中等问题 (P1 - 应尽快修复)

### 4. 学习记录列表的分页总数计算有误

**位置**: `routes/record.py:90-113`

```python
# 第一步 count 拉的是全部记录数
count_result = count_query.limit(0).execute()
raw_total = count_result.count  # ← 包含所有 review_status

# 第二步 Python 侧过滤 review_status 后
# total 实际是 filtered 之后的 len(records)，但 raw_total 仍然是全量
# 导致前端分页器显示的总页数错误
```

**建议**: 当需要 Python 侧过滤时，`total` 应为过滤后的数量而非数据库原始总数。

---

### 5. 异常信息泄露

**位置**: `routes/practice.py:66`、`routes/practice.py:100`

```python
except Exception as e:
    return json_response(code=500, msg=f'保存闯关进度失败: {str(e)}')
```

直接将内部异常信息返回给前端，可能泄露数据库结构、SQL 错误等内部细节。

**建议**: 服务端记录日志，前端返回通用错误消息。

---

### 6. ai_api.py 的 `_parse_mnemonic` 中不必要的 `StopIteration` 捕获

**位置**: `routes/ai_api.py:41-43`

```python
# next(iter(...), '') 已有默认值 '', 永远不会抛出 StopIteration
except (_json.JSONDecodeError, TypeError, StopIteration):
    pass
```

**建议**: 移除 `StopIteration` 或改为更明确的异常类型。

---

### 7. 前端 store user_id 于 localStorage，存在 XSS 风险

**位置**: `pages/practice.js:66`、`pages/index.js`、`components/AIMemoModal.js:109`

```javascript
const uid = localStorage.getItem('user_id');
userIdRef.current = parseInt(uid, 10);
```

**建议**: 使用 `httpOnly` Cookie 存储 session，或配合 JWT + refresh token 方案。

---

### 8. 闯关"重新开始"发送 N 条独立请求

**位置**: `pages/practice.js:246-258`

```javascript
allWords.forEach(w => {
    fetch(`${API_BASE}/api/practice/save`, { ... })  // N 次独立请求
});
```

如果单词数为 200 个，将同时发送 200 个 HTTP 请求。

**建议**: 后端提供批量重置接口 `POST /api/practice/reset`，一次请求完成。

---

### 9. AIMemoModal 倒计时存在闭包陷阱

**位置**: `components/AIMemoModal.js:58-62`

```javascript
let cd = Math.ceil(AI_TIMEOUT / 1000);  // 局部变量
setCountdown(cd);
countdownRef.current = setInterval(() => {
    cd--;         // 操作局部变量，依赖闭包
    setCountdown(cd);
    if (cd <= 0) clearInterval(countdownRef.current);
}, 1000);
```

`cd` 作为 `let` 局部变量在每个 tick 中正确递减，但 **`setCountdown(cd)` 与 `setCountdown(prev => prev - 1)` 相比，在快速连续切换风格时可能出现状态竞争**。

**建议**: 使用 `setCountdown(prev => prev - 1)` 函数式更新。

---

## 三、轻微问题 (P2 - 建议优化)

### 10. `word.py` 模糊搜索使用 f-string 拼接 SQL

**位置**: `routes/word.py:39`

```python
query = query.or_(f"word.ilike.%{keyword}%,basic_meaning.ilike.%{keyword}%")
```

虽然 Supabase Python SDK 会做参数化处理，但 f-string 嵌套 `keyword` 存在注入风险。

**建议**: 使用 Supabase SDK 的参数绑定方式，或对 `keyword` 做转义过滤特殊字符 `%` 和 `_`。

---

### 11. practice.js 硬编码 `page=1&size=10`

**位置**: `pages/practice.js:75`

```javascript
const res = await fetch(`${API_BASE}/api/words?page=1&size=10`);
```

如果单词库超过 10 个，闯关只能使用前 10 个单词。

**建议**: 提供专门的 `/api/words/all` 接口返回全部单词，或增大 size 参数。

---

### 12. `from_cache` 字段始终为 `False`

**位置**: `routes/ai_api.py:71`

```python
'from_cache': False,  # 永远返回 False，字段无意义
```

前端有 `fromCache` 状态和 `<Tag color="blue">已缓存</Tag>` 展示，但因为恒为 `False` 永远不会显示。

**建议**: 移除该字段，或实现真正的缓存命中逻辑。

---

### 13. 路由文件缺少日志

**位置**: 所有路由文件

所有 `except Exception` 分支只返回通用错误，没有使用 `logging` 模块记录异常堆栈。

```python
except Exception:
    return json_response(code=500, msg='获取单词列表失败，请稍后重试')
    # 丢失了 traceback，出问题时无法排查
```

**建议**: 在所有 `except` 分支中加入 `app.logger.exception(e)`。

---

## 四、架构建议

| 类别 | 当前状态 | 建议 |
|------|----------|------|
| **项目结构** | Flask Blueprint + Next.js Pages | 保持，结构清晰 |
| **状态管理** | 各页面独立 useState | 小型项目合理，无需引入 Redux |
| **数据库** | Supabase | 可考虑增加 RLS 策略增强安全性 |
| **缓存** | 无 | 可对 `/api/words` 加简单的内存缓存（如 `cachetools`） |
| **API 版本** | 无版本号 | 建议加 `/api/v1/` 前缀，方便后续迭代 |

---

## 五、总结

| 级别 | 数量 | 摘要 |
|------|------|------|
| P0 严重 | 3 | 重复代码 DRY 违规、两个路由完全重复、零鉴权 |
| P1 中等 | 6 | 分页计数错误、异常信息泄露、XSS 风险、N+1 请求、闭包陷阱 |
| P2 轻微 | 4 | SQL 拼接、硬编码、无用字段、缺少日志 |

**最优先修复项**: 增加 JWT 鉴权（P0-3）+ 合并重复的 AI 路由（P0-1）+ 修复分页计数 bug（P1-4）。

---

*报告由 AI 生成，可根据实际情况调整优先级。*
