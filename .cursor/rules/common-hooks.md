---
description: "Hooks 系统：自动化检查、TodoWrite 最佳实践"
alwaysApply: true
---
# Hooks 系统

本项目已配置以下自动化 Hooks（见 `.cursor/hooks.json`）：

## 已启用的 Hooks

| 事件 | Hook | 行为 |
|------|------|------|
| `beforeSubmitPrompt` | check-secrets | 检测提示词中的 API Key / Token |
| `beforeReadFile` | warn-sensitive-file | 读取 `.env`/`.key`/`.pem` 时警告 |
| `afterFileEdit` | post-edit-checks | 编辑 JS/TS 文件后检查 `console.log` |

所有 hooks 均为仅警告模式（不阻断），核心脚本在 `hooks/scripts/hooks/` 中。

## TodoWrite 最佳实践

使用 TodoWrite 工具来：
- 追踪多步骤任务的进度
- 验证对指令的理解
- 实现实时引导
- 展示具体的实施步骤

待办列表能帮助发现：
- 乱序步骤
- 遗漏项目
- 不必要的额外步骤
- 粒度不当
- 对需求的误解
