---
description: "Go 测试规范"
globs: ["**/*.go", "**/go.mod", "**/go.sum"]
alwaysApply: false
---
# Go 测试规范

> 扩展通用测试规范，补充 Go 专项内容。

## 框架

使用标准 `go test` + **表驱动测试**。

## 竞态检测

始终加 `-race` 标志运行：

```bash
go test -race ./...
```

## 覆盖率

```bash
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

## 表驱动测试示例

```go
func TestCalculateTotal(t *testing.T) {
    tests := []struct {
        name     string
        input    []int
        expected int
    }{
        {"空切片", []int{}, 0},
        {"单个元素", []int{5}, 5},
        {"多个元素", []int{1, 2, 3}, 6},
    }

    for _, tc := range tests {
        t.Run(tc.name, func(t *testing.T) {
            result := CalculateTotal(tc.input)
            if result != tc.expected {
                t.Errorf("期望 %d，得到 %d", tc.expected, result)
            }
        })
    }
}
```

## 使用技能

使用 **TDD 开发大师**（`/tdd`）引导 RED-GREEN-REFACTOR 流程。
