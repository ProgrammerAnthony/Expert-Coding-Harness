# planning-with-files（文件化规划）

本技能参考并吸收了开源项目 [planning-with-files](https://github.com/OthmanAdi/planning-with-files/) 的核心思想：用 **3 份 Markdown 文件**作为“可持久化的工作记忆”，来解决长任务里的目标漂移、上下文丢失与错误重复。

## 适用场景

- 复杂任务（预计 >5 次工具调用、跨多个文件、需要研究、可能跨会话）
- 需要强约束的阶段推进（Phase）
- 需要可恢复的过程记录（/clear 之后仍能继续）

## 三文件（放在项目根目录）

- **`task_plan.md`**：目标、阶段（Phase）、关键决策、错误与下一步（会被 hooks 高频回读/注入）
- **`findings.md`**：研究发现与证据（外部/不可信内容只放这里）
- **`progress.md`**：过程日志（做了什么、改了哪些文件、验证结果）

> 安全提示：由于 `task_plan.md` 会被 hooks 反复注入上下文，**不要把网页/搜索结果原文写进 `task_plan.md`**，外部内容只写 `findings.md`。

## 与本仓库 Cursor hooks 的配合

本仓库已在 `.cursor/hooks.json` 集成 planning-with-files 的关键行为：

- **`userPromptSubmit`**：每次用户提交提示词时，把 `task_plan.md` 头部与 `progress.md` 尾部摘要注入 prompt（用于 /clear 后恢复）
- **`preToolUse`**：每次工具调用前回读 `task_plan.md` 头部（把目标拉回注意力窗口）
- **`postToolUse`**：写/改文件后提醒更新 `progress.md` 与 Phase 状态
- **`stop`**：若 Phase 未全部完成，返回 `followup_message` 触发自动继续（loop_limit=3）

实现位置：
- Cursor 薄适配层：`.cursor/hooks/*`
- 主要逻辑脚本：`scripts/hooks/planning-with-files-*.js`
- 模板与脚本：`skills/planning-with-files/templates/`、`skills/planning-with-files/scripts/`

## 快速开始

1. 从模板创建三文件（拷贝即可）：
   - `templates/task_plan.md`
   - `templates/findings.md`
   - `templates/progress.md`
2. 先把 `task_plan.md` 的 Goal/Phases 填完整，再开始实现
3. 每完成一个阶段就更新 `task_plan.md` 的 `**Status:**`，并在 `progress.md` 记一笔

