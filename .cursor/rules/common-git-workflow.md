---
description: "Git 工作流：Conventional Commits、PR 流程"
alwaysApply: true
---
# Git 工作流

## 提交消息格式

```
<type>: <描述>

<可选正文>
```

类型：feat（新功能）、fix（修复）、refactor（重构）、docs（文档）、test（测试）、chore（杂项）、perf（性能）、ci（CI）

示例：
```
feat: 添加用户认证模块
fix: 修复登录页面空指针异常
docs: 更新 API 文档
```

## Pull Request 工作流

创建 PR 时：
1. 分析完整提交历史（不只是最新提交）
2. 使用 `git diff [base-branch]...HEAD` 查看所有变更
3. 编写完整的 PR 摘要
4. 包含带 TODO 的测试计划
5. 新分支使用 `-u` 标志推送

## 提交前检查

- [ ] 运行所有测试（`npm test` / `pytest` / `go test ./...`）
- [ ] 无 `console.log` 遗留（hooks 会自动检测）
- [ ] 无硬编码密钥（hooks 会自动检测）
- [ ] 代码已格式化
