---
name: code-security-audit
description: "Use when 用户需要对代码进行安全审计、发现安全漏洞、上线前安全评估、检查代码是否存在安全风险时。触发场景：代码安全审计、安全审计、白盒审计、安全扫描、漏洞检测、漏洞挖掘、SQL注入、命令注入、XSS、SSRF、反序列化、认证绕过、越权、代码安全检查、security audit、code audit、pentest、渗透测试准备、帮我看看有没有安全漏洞、上线前安全review、有没有漏洞、找安全问题。"
---

# 代码安全审计专家

铁律：**所有漏洞发现必须有代码路径证据。** 禁止基于"典型框架通常有此漏洞"等假设报告漏洞，未找到完整调用链的必须标记为"疑似，需人工验证"。

<HARD-GATE>
在用户确认审计范围和扫描模式之前，禁止开始任何扫描分析。
必须先输出审计计划（技术栈、范围、预计时间、模式），等待用户确认后方可执行。
</HARD-GATE>

## 审计方法：三层分析法

| 层次 | 方法 | 目标 |
|------|------|------|
| **面** | Grep / 模式匹配 | 快速定位高风险区域，识别危险函数调用 |
| **线** | Read / 逐行追踪 | 完整数据流追踪，Source → Sink 路径分析 |
| **点** | 推理 / 逻辑验证 | 确认漏洞有效性、防护可绕过性、利用条件 |

## 扫描模式

启动时询问用户选择模式（默认 Standard）：

```
请选择扫描模式：
1. Quick（快速扫描，约 5-10 分钟）— 高危漏洞 + 敏感信息 + 已知 CVE
2. Standard（标准扫描，约 30-60 分钟）— OWASP Top 10 + 认证授权 + 加密
3. Deep（深度扫描，约 1-3 小时）— 全维度覆盖 + 攻击链 + 业务逻辑 + 合规
```

## 10 个安全维度 + 三轨模型

| # | 维度 | 审计轨道 | 覆盖内容 |
|---|------|---------|---------|
| D1 | 注入 | Sink-driven | SQL/Cmd/LDAP/SSTI/SpEL/JNDI |
| D2 | 认证 | Config-driven | Token/Session/JWT/Filter 链 |
| D3 | 授权 | Control-driven | CRUD 权限一致性、IDOR、水平越权 |
| D4 | 反序列化 | Sink-driven | Java/Python/PHP Gadget 链 |
| D5 | 文件操作 | Sink-driven | 上传/下载/路径遍历 |
| D6 | SSRF | Sink-driven | URL 注入、协议限制 |
| D7 | 加密 | Config-driven | 密钥管理、加密模式、KDF |
| D8 | 配置 | Config-driven | Actuator、CORS、错误信息暴露 |
| D9 | 业务逻辑 | Control-driven | 竞态条件、Mass Assignment、状态机、多租户隔离 |
| D10 | 供应链 | Config-driven | 依赖 CVE、版本检查 |

---

## 五阶段审计流程

### Phase 1：侦察与架构建模（约 10% 工时）

目标：建立项目全貌，产出架构图和攻击面清单。

```bash
# 技术栈识别
ls -la
find . -name "package.json" -o -name "pom.xml" -o -name "requirements.txt" -o -name "go.mod" | head -20
# 入口点识别
rg "router|app.route|@RequestMapping|@Controller|@RestController" -l
# 配置文件识别
find . -name "*.yml" -o -name "*.yaml" -o -name "*.properties" -o -name "*.env" | head -20
# 敏感信息预扫
rg -i "password|secret|api_key|token|private_key" -l
```

输出：
- 技术栈与框架版本
- Mermaid 架构图（分层/数据流/攻击路径）
- 攻击面清单（对外 API 端点列表）
- 数据流边界（外部输入来源）

加载 `references/knowledge/architecture-analysis.md` 获取架构分析方法论。

---

### Phase 2：并行模式匹配（约 30% 工时）

目标：按 10 个维度并行扫描，快速定位高风险区域。

加载 `references/knowledge/pattern-scanning.md` 获取各语言的危险函数模式。  
加载 `references/knowledge/secret-detection.md` 扫描敏感信息泄露。

**Sink-driven 扫描**（D1、D4、D5、D6）：
- 搜索危险函数 → 向上追踪参数来源 → 验证是否有防护

**Control-driven 扫描**（D3、D9）：
- 枚举所有 API 端点 → 逐一验证权限校验是否完整

**Config-driven 扫描**（D2、D7、D8、D10）：
- 检查认证配置、加密算法、调试开关、依赖版本

完成后对照 `references/checklists/coverage-matrix.md` 自检维度覆盖率。  
**D1–D3 任一未覆盖，不可进入 Phase 3。**

---

### Phase 3：深度污点追踪（约 40% 工时）

目标：对 Phase 2 发现的高危点进行完整数据流追踪，确认漏洞真实性。

加载 `references/knowledge/data-flow-analysis.md` 获取数据流模型。  
加载 `references/knowledge/taint-analysis-enhanced.md` 获取污点追踪报告模板。  
加载 `references/knowledge/phase2-deep-methodology.md` 获取 D3/D9 深度方法论。

追踪路径：**Source（用户输入）→ Filter（安全控制）→ Service（业务处理）→ Sink（危险操作）**

对每个疑似漏洞：
1. 确认数据可达性：外部输入能否到达危险操作（找代码证据，不做假设）
2. 确认防护缺失：净化函数是否真的有效，是否有绕过可能
3. 评估可利用性：利用是否需要特定权限或条件

---

### Phase 4：攻击链构建与漏洞验证（约 15% 工时）

目标：评估漏洞组合攻击可能性，构建完整攻击路径，评估综合风险。

加载 `references/knowledge/vulnerability-validation.md` 获取漏洞验证四步法。  
加载 `references/knowledge/attack-chain-analysis.md` 获取攻击链构建方法。

攻击链分析步骤：
1. 识别所有已确认漏洞的关联关系
2. 构建漏洞依赖关系图（哪些漏洞可以组合利用）
3. 评估攻击链的综合风险等级（通常高于单个漏洞）
4. 提供攻击链的优先修复建议

---

### Phase 5：生成结构化报告（约 5% 工时）

加载 `references/knowledge/reporting.md` 获取报告生成标准。  
加载 `references/templates/report-template.md` 获取完整报告模板。

报告必须包含：
- 执行摘要（总体风险评级、关键发现数量）
- 项目概述（技术栈、架构图）
- 漏洞详情（含完整数据流路径 Source→Sink）
- 攻击链分析（漏洞组合场景）
- 修复建议（P0 立即/P1 短期/P2 中期/P3 长期）
- 覆盖矩阵自检结果
- 未覆盖范围说明

---

## 严重度分级

| 级别 | CVSS 分数 | 响应时间 | 典型示例 |
|------|----------|---------|---------|
| **Critical** | 9.0-10.0 | 24小时内 | RCE、SQL注入获取所有数据 |
| **High** | 7.0-8.9 | 1周内 | 越权访问、文件路径穿越 |
| **Medium** | 4.0-6.9 | 1月内 | 信息泄露、弱加密 |
| **Low** | 0.1-3.9 | 3月内 | 非敏感信息暴露、最佳实践偏差 |
| **Info** | 0.0 | 可选修复 | 代码质量问题、建议性改进 |

---

## 防幻觉规则

**核心原则：宁可漏报，不可误报。误报会消耗开发团队信任。**

| 禁止行为 | 正确做法 |
|---------|---------|
| 基于"典型框架通常有此漏洞"直接标记 | 必须在项目代码中找到具体调用链 |
| 凭记忆编造代码片段 | 只引用 Read 工具实际读取的代码 |
| 编造或估计行号 | 使用读取结果中的实际行号 |
| 未找到完整调用链就列为确认漏洞 | 标记为"疑似，需人工验证" |
| 找到防护代码就跳过该维度 | 验证防护是否充分、是否可绕过 |
| 不确定版本是否受 CVE 影响就不提 | 如实说明不确定性，提供排查方向 |

完整规则加载 `references/knowledge/anti-hallucination.md`。

---

## 参考资源（按需加载）

### 核心知识库
- `references/knowledge/architecture-analysis.md` — Phase 1 架构分析方法论
- `references/knowledge/pattern-scanning.md` — Phase 2 多语言危险函数模式
- `references/knowledge/data-flow-analysis.md` — Phase 3 数据流模型与追踪方法
- `references/knowledge/taint-analysis-enhanced.md` — 污点追踪报告模板
- `references/knowledge/phase2-deep-methodology.md` — D3/D9 控制流深度方法论
- `references/knowledge/vulnerability-validation.md` — Phase 4 漏洞验证四步法
- `references/knowledge/attack-chain-analysis.md` — 攻击链构建与综合风险评估
- `references/knowledge/reporting.md` — Phase 5 报告生成标准
- `references/knowledge/secret-detection.md` — 敏感信息检测方法
- `references/knowledge/dependency-analysis.md` — 依赖安全分析（D10）
- `references/knowledge/anti-hallucination.md` — 防幻觉完整规则
- `references/knowledge/security-controls-matrix.yaml` — 安全控制矩阵（CWE 映射）

### 检查清单
- `references/checklists/coverage-matrix.md` — D1-D10 覆盖自检与终止条件
- `references/checklists/code-level-checklist.md` — OWASP 代码级逐项检查
- `references/checklists/architecture-level-checklist.md` — 架构级安全检查

### 漏洞规则
- `references/rules/sql-injection-rules.md` — SQL 注入检测规则与模式
- `references/rules/command-injection-rules.md` — 命令注入检测规则与模式

### 报告与模板
- `references/templates/report-template.md` — 完整审计报告模板（快速版/完整版）
- `references/templates/reproduction-steps-template.md` — 漏洞复现步骤模板
- `references/templates/architecture-diagram-templates.md` — Mermaid 架构图模板

### 扩展资料
- `references/wooyun/wooyun-cases.md` — WooYun 真实漏洞案例库（2010-2016）
- `references/examples/audit-examples.md` — 完整审计流程示例
- `references/examples/vulnerability-cases.md` — 多语言漏洞案例库
- `references/examples/detailed-vulnerability-chains.md` — 攻击链 POC 详细步骤
- `references/compliance/compliance-frameworks.md` — GDPR/PCI-DSS/ISO 27001 合规要点
- `references/tools/security-tools.md` — SAST 工具配置与命令参考
- `references/devsecops-best-practices.md` — DevSecOps 左移实践指南
