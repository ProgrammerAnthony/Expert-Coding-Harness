# 初始化 planning-with-files 三份规划文件（项目根目录）
# 用法：.\init-session.ps1 [project-name]

param(
    [string]$ProjectName = "project"
)

$DATE = Get-Date -Format "yyyy-MM-dd"

Write-Host "Initializing planning files for: $ProjectName"

if (-not (Test-Path "task_plan.md")) {
    @"
# 任务计划：<一句话描述任务>

## Goal（目标）
<用一句话描述最终交付状态>

## Current Phase（当前阶段）
Phase 1

## Phases（阶段拆分）

### Phase 1：需求澄清与现状摸底
- [ ] 复述用户目标与约束
- [ ] 找到相关代码/配置位置
- [ ] 把关键发现写入 findings.md
- **Status:** in_progress

### Phase 2：方案与落地路径
- [ ] 明确集成方案与改动面（文件清单）
- [ ] 定义验证方式（怎么证明完成）
- **Status:** pending

### Phase 3：实现
- [ ] 按计划逐步改动
- [ ] 每次改动后记录 progress.md
- **Status:** pending

### Phase 4：验证与回归
- [ ] 验证所有需求点
- [ ] 记录验证结果到 progress.md
- **Status:** pending

### Phase 5：交付与收尾
- [ ] 回顾所有改动与文档
- [ ] 输出交付说明与后续建议
- **Status:** pending

## Decisions Made（已做决策）
| 决策 | 理由 |
|------|------|
|      |      |

## Errors Encountered（错误记录）
| 错误 | Attempt | 解决方式 |
|------|---------|----------|
|      | 1       |          |
"@ | Out-File -FilePath "task_plan.md" -Encoding UTF8
    Write-Host "Created task_plan.md"
} else {
    Write-Host "task_plan.md already exists, skipping"
}

if (-not (Test-Path "findings.md")) {
    @"
# Findings（发现与证据）

## Requirements（需求拆解）
-

## Research Findings（研究发现）
-

## Technical Decisions（技术决策）
| 决策 | 理由 |
|------|------|
|      |      |

## Files & Locations（关键路径）
-

## Resources（资源）
-
"@ | Out-File -FilePath "findings.md" -Encoding UTF8
    Write-Host "Created findings.md"
} else {
    Write-Host "findings.md already exists, skipping"
}

if (-not (Test-Path "progress.md")) {
    @"
# Progress（过程日志）

## Session：$DATE

### Phase 1：需求澄清与现状摸底
- **Status:** in_progress
- **Started:** $DATE
- Actions taken:
  -
- Files created/modified:
  -

## Test Results（验证记录）
| 测试 | 输入 | 预期 | 实际 | 状态 |
|------|------|------|------|------|
|      |      |      |      |      |

## Error Log（错误明细）
| 时间 | 错误 | Attempt | 解决方式 |
|------|------|---------|----------|
|      |      | 1       |          |
"@ | Out-File -FilePath "progress.md" -Encoding UTF8
    Write-Host "Created progress.md"
} else {
    Write-Host "progress.md already exists, skipping"
}

Write-Host ""
Write-Host "Planning files initialized!"
Write-Host "Files: task_plan.md, findings.md, progress.md"

