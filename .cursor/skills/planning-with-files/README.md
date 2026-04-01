# planning-with-files（文件化规划）

这是 `skills/planning-with-files/` 的 Cursor 镜像版本，用于 Cursor 自动发现/加载技能内容。

上游思想来源于 [planning-with-files](https://github.com/OthmanAdi/planning-with-files/)：用 `task_plan.md`、`findings.md`、`progress.md` 三文件把关键上下文落盘，配合 hooks 自动回读与 stop 门禁，让复杂任务不容易“跑偏/忘记/提前结束”。

## 三文件（放在项目根目录）

- **`task_plan.md`**：目标、阶段（Phase）、决策与错误（会被 hooks 高频回读/注入）
- **`findings.md`**：研究发现与证据（外部/不可信内容只放这里）
- **`progress.md`**：过程日志（做了什么、改了哪些文件、验证结果）

## 与本仓库 hooks 的关系

本仓库的 hooks 集成在 `.cursor/hooks.json`，核心逻辑位于 `scripts/hooks/planning-with-files-*.js`，Cursor 侧 `.cursor/hooks/*.js` 仅做薄适配层调用。

## 模板/脚本

- 模板：`templates/`
- 脚本：`scripts/`

