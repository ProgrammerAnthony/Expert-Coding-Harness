---
description: "TypeScript/JavaScript 安全规范"
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: false
---
# TypeScript/JavaScript 安全规范

> 扩展通用安全规范，补充 TypeScript/JavaScript 专项内容。

## 密钥管理

```typescript
// 错误：硬编码密钥
const apiKey = "sk-proj-xxxxx"

// 正确：环境变量
const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  throw new Error('OPENAI_API_KEY 未配置')
}
```

## XSS 防护

```typescript
// 永不直接插入用户内容到 DOM
element.innerHTML = userInput  // 危险！

// 使用文本节点
element.textContent = userInput  // 安全
// 或使用 DOMPurify
element.innerHTML = DOMPurify.sanitize(userInput)
```

## SQL 注入防护

```typescript
// 错误：字符串拼接
const query = `SELECT * FROM users WHERE id = ${userId}`

// 正确：参数化查询
const query = 'SELECT * FROM users WHERE id = $1'
const result = await db.query(query, [userId])
```

## 安全审计

使用 **代码安全审计专家** 技能（`/代码安全审计`）进行全面安全审查。
