# Expert Coding Skills — Hooks

自动化安全检查钩子集，支持 **Claude Code** 和 **Cursor** 双平台。

## 目录结构

```
项目根/
├── hooks/                      ← 仅配置文件（对标 ECC 的 hooks/）
│   ├── hooks.json              ← Claude Code hooks 配置
│   └── README.md
│
├── scripts/                    ← 所有实际脚本逻辑（对标 ECC 的 scripts/）
│   ├── lib/
│   │   └── utils.js            ← 跨平台工具函数（两平台共用）
│   └── hooks/                  ← 核心 hook 逻辑（两平台共用）
│       ├── check-secrets.js
│       ├── warn-sensitive-file.js
│       └── post-edit-checks.js
│
└── .cursor/                    ← Cursor 配置（对标 ECC 的 .cursor/）
    ├── hooks.json              ← Cursor hooks 配置
    ├── hooks/                  ← Cursor 适配层（极薄，只做格式转换）
    │   ├── adapter.js
    │   ├── before-submit-prompt.js
    │   ├── before-read-file.js
    │   └── after-file-edit.js
    ├── rules/                  ← 永久注入规则
    └── skills/ → skills/       ← Junction 软链接
```

**核心原则**（与 ECC 完全一致）：
- `hooks/` 只放配置文件，不放脚本
- `scripts/hooks/` 放所有实际逻辑，两平台共用
- `.cursor/hooks/` 是极薄的适配层，负责 Cursor→Claude Code 格式转换，然后调用 `scripts/hooks/`

## 包含的 Hooks

| Hook | Claude Code 事件 | Cursor 事件 | 功能 |
|------|-----------------|-------------|------|
| `check-secrets` | `Stop` | `beforeSubmitPrompt` | 检测 API Key、Token、私钥 |
| `warn-sensitive-file` | `PreToolUse Read` | `beforeReadFile` | 读取 `.env`/`.key`/`.pem` 时警告 |
| `post-edit-checks` | `PostToolUse Edit` | `afterFileEdit` | 检测 JS/TS 中遗留的 `console.log` |

所有 hooks 均为**仅警告**模式（exit 0），不阻断正常开发流程。

---

## 安装

### Cursor

**克隆仓库后直接可用**——`.cursor/` 已包含完整配置。

### Claude Code

将 `hooks/hooks.json` 中的配置合并到目标项目的 `~/.claude/settings.json`，并确保 `scripts/` 目录存在于项目根：

```bash
# 复制脚本目录
xcopy /E /I scripts 你的项目\scripts
# 将 hooks/hooks.json 中的 hooks 配置合并到 ~/.claude/settings.json
```

---

## 自定义

编辑 `scripts/hooks/` 下对应脚本中的模式列表：

- **密钥检测**：`check-secrets.js` → `SECRET_PATTERNS`
- **敏感文件**：`warn-sensitive-file.js` → `SENSITIVE_PATTERNS`
- **console.log 排除**：`post-edit-checks.js` → `EXCLUDED_PATTERNS`
