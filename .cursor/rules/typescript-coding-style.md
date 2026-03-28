---
description: "TypeScript/JavaScript 编码规范"
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: false
---
# TypeScript/JavaScript 编码规范

> 扩展通用编码规范，补充 TypeScript/JavaScript 专项内容。

## 不可变性

使用展开运算符进行不可变更新：

```typescript
// 错误：直接变异
function updateUser(user: User, name: string) {
  user.name = name  // 变异！
  return user
}

// 正确：不可变
function updateUser(user: User, name: string): User {
  return { ...user, name }
}
```

## 错误处理

使用 async/await 与 try-catch：

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('操作失败:', error)
  throw new Error('用户友好的错误描述')
}
```

## 输入验证

推荐使用 Zod 进行 schema 验证：

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## Console.log

- 生产代码中禁止 `console.log`
- 改用正式的日志库（pino、winston 等）
- Hooks 会在编辑后自动检测并警告

## API 响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: { total: number; page: number; limit: number }
}
```

## Repository 模式

```typescript
interface Repository<T> {
  findAll(filters?: Filters): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: CreateDto): Promise<T>
  update(id: string, data: UpdateDto): Promise<T>
  delete(id: string): Promise<void>
}
```
