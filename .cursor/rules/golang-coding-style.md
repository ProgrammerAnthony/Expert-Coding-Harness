---
description: "Go 编码规范"
globs: ["**/*.go", "**/go.mod", "**/go.sum"]
alwaysApply: false
---
# Go 编码规范

> 扩展通用编码规范，补充 Go 专项内容。

## 格式化

- **gofmt** 和 **goimports** 是强制要求，无样式争议

## 设计原则

- 接收接口，返回结构体
- 保持接口小巧（1-3 个方法）

## 错误处理

始终用上下文包装错误：

```go
if err != nil {
    return fmt.Errorf("创建用户失败: %w", err)
}
```

## 依赖注入

使用构造函数注入依赖：

```go
func NewUserService(repo UserRepository, logger Logger) *UserService {
    return &UserService{repo: repo, logger: logger}
}
```

## 函数式选项模式

```go
type Option func(*Server)

func WithPort(port int) Option {
    return func(s *Server) { s.port = port }
}

func NewServer(opts ...Option) *Server {
    s := &Server{port: 8080}
    for _, opt := range opts {
        opt(s)
    }
    return s
}
```

## 接口定义位置

在使用接口的地方定义接口，而非在实现的地方：

```go
// user_service.go — 在使用方定义
type UserRepository interface {
    FindByID(id string) (*User, error)
    Save(user *User) error
}
```
