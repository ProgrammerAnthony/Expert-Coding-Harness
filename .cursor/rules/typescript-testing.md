---
description: "TypeScript/JavaScript 测试规范"
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: false
---
# TypeScript/JavaScript 测试规范

> 扩展通用测试规范，补充 TypeScript/JavaScript 专项内容。

## 推荐框架

- **单元/集成**：Vitest（推荐）或 Jest
- **E2E**：Playwright（关键用户流程）
- **组件**：React Testing Library

## 测试示例

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('UserService', () => {
  it('创建用户时应返回新用户', async () => {
    const mockRepo = {
      create: vi.fn().mockResolvedValue({ id: '1', name: 'Alice' })
    }
    const service = new UserService(mockRepo)
    const result = await service.createUser({ name: 'Alice' })
    expect(result.id).toBe('1')
  })
})
```

## 覆盖率命令

```bash
# Vitest
npx vitest run --coverage

# Jest
npx jest --coverage
```

## 使用技能

使用 **TDD 开发大师**（`/tdd`）引导 RED-GREEN-REFACTOR 流程。
