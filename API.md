# AI Word Memory — API 接口文档

> 版本：v1.0 | 统一返回格式：`{ "code": 200, "data": {}, "msg": "success" }`

---

## 目录

- [1. 统一规范](#1-统一规范)
- [2. 单词接口](#2-单词接口)
- [3. 用户接口](#3-用户接口)
- [4. AI 记忆素材接口](#4-ai-记忆素材接口)
- [5. 学习记录接口](#5-学习记录接口)
- [6. 闯关进度接口](#6-闯关进度接口)

---

## 1. 统一规范

### 1.1 请求格式

| 项目 | 说明 |
|------|------|
| Content-Type | `application/json` |
| 鉴权方式 | JWT Bearer Token（`Authorization: Bearer <token>`） |
| 字符编码 | UTF-8 |

### 1.2 响应格式

所有接口统一返回 JSON：

```json
{
  "code": 200,
  "data": {},
  "msg": "success"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码：200 成功，400 参数错误，401 未授权，403 无权限，404 不存在，409 冲突，500 服务器错误 |
| data | any | 响应数据，成功时为具体数据，失败时为 `null` |
| msg | string | 提示信息 |

### 1.3 鉴权说明

需要鉴权的接口标注 `🔒 JWT`，请求头需携带 `Authorization: Bearer <token>`。Token 通过 `/api/user/login` 或 `/api/user/register` 获取。

---

## 2. 单词接口

### 2.1 分页获取单词列表

```
GET /api/words?page=1&size=10&keyword=abandon
```

**请求参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|:--:|--------|------|
| page | int | 否 | 1 | 页码（≥1） |
| size | int | 否 | 10 | 每页条数（1~50） |
| keyword | string | 否 | — | 模糊搜索关键词（匹配单词/释义） |

**成功响应**

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "word": "abandon",
        "phonetic": "/əˈbændən/",
        "basic_meaning": "v. 放弃；抛弃",
        "review_status": 0,
        "created_at": "2026-07-11T10:00:00"
      }
    ],
    "total": 235,
    "page": 1,
    "size": 10,
    "keyword": "abandon"
  },
  "msg": "success"
}
```

### 2.2 获取单词详情

```
GET /api/words/{id}
```

**成功响应**

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "word": "abandon",
    "phonetic": "/əˈbændən/",
    "basic_meaning": "v. 放弃；抛弃",
    "review_status": 0,
    "root_analysis": "a-（不）+ band（绑）+ -on → 不绑在一起 → 放弃",
    "mnemonic": "{...}",
    "extra_example": "He abandoned his plan to travel.",
    "created_at": "2026-07-11T10:00:00"
  },
  "msg": "success"
}
```

**错误响应**

```json
{
  "code": 404,
  "data": null,
  "msg": "单词 ID 999 不存在"
}
```

### 2.3 新增单词 `🔒 JWT`

```
POST /api/words
Content-Type: application/json
Authorization: Bearer <token>
```

**请求体**

```json
{
  "word": "serendipity",
  "phonetic": "/ˌserənˈdɪpəti/",
  "basic_meaning": "n. 意外发现珍奇事物的本领"
}
```

**成功响应**

```json
{
  "code": 200,
  "data": {
    "id": 236,
    "word": "serendipity",
    "phonetic": "/ˌserənˈdɪpəti/",
    "basic_meaning": "n. 意外发现珍奇事物的本领"
  },
  "msg": "单词添加成功"
}
```

**查重响应**

```json
{
  "code": 200,
  "data": { "id": 1, "word": "abandon", "..." },
  "msg": "单词\"abandon\"已存在，无需重复添加"
}
```

### 2.4 更新单词复习状态 `🔒 JWT`

```
PUT /api/words/{id}/status
Authorization: Bearer <token>
```

**请求体**

```json
{
  "review_status": 1
}
```

> `review_status`：0=待复习，1=已掌握

**成功响应**

```json
{
  "code": 200,
  "data": { "word_id": 1, "review_status": 1 },
  "msg": "单词已标记为\"已掌握\""
}
```

### 2.5 删除单词 `🔒 JWT`

```
DELETE /api/words/{id}
Authorization: Bearer <token>
```

**成功响应**

```json
{
  "code": 200,
  "data": null,
  "msg": "单词\"abandon\"已删除"
}
```

---

## 3. 用户接口

### 3.1 用户注册

```
POST /api/user/register
Content-Type: application/json
```

**请求体**

```json
{
  "username": "zhangsan",
  "password": "123456"
}
```

**校验规则**

| 字段 | 规则 |
|------|------|
| username | 2~100 字符，不能为空 |
| password | ≥4 字符，不能为空 |

**成功响应**

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "zhangsan",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "created_at": "2026-07-11T10:00:00"
  },
  "msg": "注册成功，欢迎使用"
}
```

**用户名已存在**

```json
{
  "code": 409,
  "data": null,
  "msg": "用户名已被注册"
}
```

### 3.2 用户登录

```
POST /api/user/login
Content-Type: application/json
```

**请求体**

```json
{
  "username": "zhangsan",
  "password": "123456"
}
```

**成功响应**

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "zhangsan",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "created_at": "2026-07-11T10:00:00"
  },
  "msg": "登录成功"
}
```

**错误响应**

```json
// 用户名不存在
{ "code": 401, "data": null, "msg": "用户名不存在，请先注册" }

// 密码错误
{ "code": 401, "data": null, "msg": "密码错误" }
```

### 3.3 获取当前用户信息 `🔒 JWT`

```
GET /api/user/me
Authorization: Bearer <token>
```

**成功响应**

```json
{
  "code": 200,
  "data": {
    "user_id": 1,
    "username": "zhangsan"
  },
  "msg": "success"
}
```

---

## 4. AI 记忆素材接口

### 4.1 获取记忆素材

```
POST /api/ai/memo
POST /api/ai/generate
Content-Type: application/json
```

> 两个路径功能相同，`/memo` 为兼容旧版保留。

**请求体**

```json
{
  "word_id": 1,
  "style": "simple"
}
```

> `style` 可选值：`simple`（简洁版）、`story`（故事版）、`mnemonic`（口诀版），默认 `simple`

**成功响应**

```json
{
  "code": 200,
  "data": {
    "word_id": 1,
    "word": "abandon",
    "root": "a-（不）+ band（绑）+ -on → 不绑在一起 → 放弃",
    "mnemonic": "阿班(aband)正在(on)放弃治疗，因为药太苦了！",
    "examples": ["He abandoned his plan to travel."],
    "from_cache": false,
    "style": "simple"
  },
  "msg": "success"
}
```

---

## 5. 学习记录接口

### 5.1 新增学习记录 `🔒 JWT`

```
POST /api/study/add
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**

```json
{
  "word_id": 1
}
```

**成功响应**

```json
{
  "code": 200,
  "data": null,
  "msg": "学习记录保存成功"
}
```

> 如已有记录则自动更新学习日期，返回 `"复习记录已更新"`

### 5.2 分页查询学习记录 `🔒 JWT`

```
GET /api/study/list?page=1&size=10&date=2026-07-15&review_status=0
Authorization: Bearer <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|:--:|--------|------|
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数（1~50） |
| date | string | 否 | — | 按学习日期筛选（格式：YYYY-MM-DD） |
| review_status | int | 否 | — | 按复习状态筛选（0=待复习，1=已掌握） |

**成功响应**

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "user_id": 1,
        "word_id": 1,
        "word": "abandon",
        "phonetic": "/əˈbændən/",
        "meaning": "v. 放弃；抛弃",
        "review_status": 0,
        "study_date": "2026-07-15T10:30:00"
      }
    ],
    "total": 5,
    "page": 1,
    "size": 10
  },
  "msg": "success"
}
```

### 5.3 删除学习记录 `🔒 JWT`

```
DELETE /api/study/{id}
Authorization: Bearer <token>
```

**成功响应**

```json
{
  "code": 200,
  "data": null,
  "msg": "学习记录已删除"
}
```

**无权限**

```json
{
  "code": 403,
  "data": null,
  "msg": "无权删除他人的学习记录"
}
```

---

## 6. 闯关进度接口

### 6.1 保存闯关进度 `🔒 JWT`

```
POST /api/practice/save
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**

```json
{
  "word_id": 1,
  "correct_count": 2,
  "cooldown_remaining": 0
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| word_id | int | 单词 ID |
| correct_count | int | 答对次数 |
| cooldown_remaining | int | 冷却剩余题数 |

**成功响应**

```json
{
  "code": 200,
  "data": null,
  "msg": "进度已保存"
}
```

### 6.2 加载闯关进度 `🔒 JWT`

```
GET /api/practice/load
Authorization: Bearer <token>
```

**成功响应**

```json
{
  "code": 200,
  "data": {
    "progress": {
      "1": { "correct_count": 2, "cooldown_remaining": 0 },
      "2": { "correct_count": 3, "cooldown_remaining": 5 }
    },
    "total": 2
  },
  "msg": "success"
}
```

### 6.3 批量重置闯关进度 `🔒 JWT`

```
POST /api/practice/reset
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体（指定单词）**

```json
{
  "word_ids": [1, 2, 3]
}
```

**请求体（清空全部）**

```json
{}
```

**成功响应**

```json
{
  "code": 200,
  "data": { "deleted": 3 },
  "msg": "闯关进度已重置"
}
```

---

## 异常场景覆盖

| 场景 | 处理方式 |
|------|---------|
| 缺少必填参数 | 返回 400 + 具体缺少字段提示 |
| 参数类型错误 | 返回 400 + 类型校验提示 |
| page/size 越界 | 自动兜底到合法范围 |
| 请求超时 | 返回 500 + 标准错误 JSON |
| 数据库连接异常 | 返回 500 + 笼统错误信息（不泄露内部细节） |
| JWT Token 过期/无效 | 返回 401 + "请重新登录" |
| 访问他人数据 | 返回 403 + 无权限提示 |
| 单词查重冲突 | 返回 200 + 已有单词数据 + 提示信息 |
| 注册用户名冲突 | 返回 409 + "用户名已被注册" |
| 重复保存学习记录 | Upsert 逻辑，自动更新而非报错 |

---

> 生成时间：2026-07-17 | 实训项目：AI 单词记忆全栈 Web 应用
