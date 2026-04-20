---
name: llm-wiki-interview
description: "面试向 LLM Wiki 全流程：Raw 层在 raw/ 沉淀 _research.md、basic/、blog/（见 references/raw-layer.md）；Wiki 层只读 raw/、编译维护 wiki/（实体/概念、index、log，见 references/wiki-layer.md）。触发：建资料包、收录博客、从 raw 导入 wiki、查询、lint、面试备考知识库。关键词：LLM Wiki、raw、wiki、ingest、面试、Obsidian、知识库、用户供稿。"
version: 1.0.0
---

# LLM Wiki Interview（合并技能）

铁律：**`raw/` 与 `wiki/` 分工不同**——写资料只按 Raw 层规范；把资料编译成可查询 Wiki 只按 Wiki 层规范，且 **ingest 时不得改 `raw/`**。

## 与两层文件的关系

| 阶段 | 目录与职责 | 完整规范 |
| --- | --- | --- |
| **Raw 层** | 只写 **`raw/`**：唯一检索总账 `_research.md`、`basic/`、`blog/`、`assets/`；不写 `wiki/` | [`references/raw-layer.md`](references/raw-layer.md) |
| **Wiki 层** | **只读** `raw/`，读写 **`wiki/`**：实体/概念/摘要页、`wiki/index.md`、`wiki/log.md`、图片同步到 `wiki/assets/` | [`references/wiki-layer.md`](references/wiki-layer.md) |

**衔接**：两层只通过**同一份 `raw/`** 对齐——先（或并行由用户维护）在 `raw/` 里按 Raw 层落料，再在用户要求「导入 / ingest / 编译 wiki」时按 Wiki 层把内容编译进 `wiki/`。

## 何时加载哪一份 reference

- 用户要做 **关键词拆分、检索笔记、basic 长文、blog 编译、用户供稿、每轮 blog≤5** 等：先读 **`references/raw-layer.md`**，并遵守其中自检清单。
- 用户要说 **创建知识库、从 raw 导入 wiki、查询 wiki、lint、维护 index/log**：先读 **`references/wiki-layer.md`**。
- **同一会话**里先 raw 后 wiki：两段规范都可能在一次任务里用到；切换阶段时明确当前手是否允许写 `raw/` 还是仅写 `wiki/`。

## 核心理念（与 Wiki 层一致）

用 LLM **持续维护**结构化 Markdown 知识库（`wiki/`），而不是每次提问只做一次性检索；`raw/` 作为**不可变来源层**与**面试向加工层**（basic + blog），再经 ingest 进入 `wiki/`。更细的哲学与操作见 `references/wiki-layer.md` 开头与「三大操作」。

## 参考资源（必读顺序）

1. [`references/raw-layer.md`](references/raw-layer.md) — Raw 层全部规则与质量自检。
2. [`references/wiki-layer.md`](references/wiki-layer.md) — Wiki 层 ingest / query / lint、初始化目录、实战经验（含 `raw/blog` 全文块与「核心内容提取」何者为真）。

项目内说明与出处见同目录 [`README.md`](README.md)。
