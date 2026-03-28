---
description: "Go 安全规范"
globs: ["**/*.go", "**/go.mod", "**/go.sum"]
alwaysApply: false
---
# Go 安全规范

> 扩展通用安全规范，补充 Go 专项内容。

## 密钥管理

```go
apiKey := os.Getenv("OPENAI_API_KEY")
if apiKey == "" {
    log.Fatal("OPENAI_API_KEY 未配置")
}
```

## SQL 注入防护

```go
// 错误：字符串拼接
query := fmt.Sprintf("SELECT * FROM users WHERE id = %s", userID)

// 正确：参数化查询
row := db.QueryRow("SELECT * FROM users WHERE id = $1", userID)
```

## Context 与超时

始终使用 `context.Context` 控制超时：

```go
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()

result, err := service.DoSomething(ctx, params)
```

## 安全扫描工具

```bash
# gosec — 静态安全分析
gosec ./...

# govulncheck — 依赖漏洞检查
govulncheck ./...
```

## 安全审计

使用 **代码安全审计专家** 技能（`/代码安全审计`）进行全面安全审查。
