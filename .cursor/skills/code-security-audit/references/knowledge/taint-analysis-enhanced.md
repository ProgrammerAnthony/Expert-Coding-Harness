# Taint Analysis 模块（增强版）

> 污点分析核心模块 - 用于追踪用户可控数据从输入到危险函数的完整路径
> 版本: 2.0.0（融合 dfyx_code_security_review 的数据流分析）

## 概述

污点分析是代码审计的核心方法论，通过追踪不可信数据(污点)从进入系统到触发危险操作的完整流程，精确定位安全漏洞。

```
┌─────────────────────────────────────────────────────────────────┐
│                      Taint Analysis Flow                        │
│                                                                 │
│   Source ──→ Propagation ──→ Sanitizer? ──→ Sink               │
│   (污点源)    (传播路径)      (净化检查)     (汇聚点)            │
│                                                                 │
│   用户输入    变量赋值         过滤/转义      危险函数            │
│              函数参数          验证/编码      执行操作            │
│              返回值            白名单                            │
└─────────────────────────────────────────────────────────────────┘
```

## 专项详细规则

| 漏洞类型 | 详细规则文件 | Sink 示例 |
|----------|--------------|-----------|
| 反序列化 Gadget | `languages/java_gadget_chains.md` | readObject, parseObject |
| JNDI 注入 | `languages/java_jndi_injection.md` | InitialContext.lookup |
| XXE | `languages/java_xxe.md` | DocumentBuilder.parse |
| Fastjson | `languages/java_fastjson.md` | JSON.parseObject |
| 通用 Sink/Source | `core/sinks_sources.md` | 完整规则库 |

## Taint Analysis Report Template

### 标准报告格式

```markdown
## [严重程度] 漏洞类型 - 文件名:行号

### 基本信息
| 属性 | 值 |
|------|-----|
| 漏洞类型 | SQL注入 / XSS / RCE / SSRF / ... |
| 严重程度 | Critical / High / Medium / Low |
| CWE编号 | CWE-89 / CWE-79 / CWE-78 / ... |
| 文件位置 | path/to/file.ext:行号 |
| 函数名称 | function_name() |

---

### Source (污点源)
**位置**: `file.ext:行号`

**类型**: [HTTP参数 / Cookie / Header / 文件读取 / 数据库 / 环境变量]

**代码**:
\`\`\`language
// 污点引入点代码
\`\`\`

**说明**: 描述为什么此处是污点源，数据如何进入系统

---

### Taint Propagation (污点传播路径)
\`\`\`
[步骤1] file.ext:行号
        代码: variable = source_input
        操作: 污点引入
        ↓
[步骤2] file.ext:行号
        代码: processed = transform(variable)
        操作: 污点传递 (未净化)
        ↓
[步骤3] file.ext:行号
        代码: result = build_query(processed)
        操作: 污点拼接
        ↓
[步骤4] file.ext:行号
        代码: execute(result)
        操作: 污点到达Sink
\`\`\`

**传播链摘要**:
- 总跨度: X 行代码 / X 个函数 / X 个文件
- 中间变量: var1 → var2 → var3 → sink参数
- 跨函数调用: funcA() → funcB() → funcC()

---

### Sink (汇聚点)
**位置**: `file.ext:行号`

**类型**: [SQL执行 / 命令执行 / 文件操作 / 网络请求 / 模板渲染 / 反序列化]

**代码**:
\`\`\`language
// Sink 点代码
\`\`\`

**防护检查**:
- [ ] 输入验证
- [ ] 输出编码
- [ ] 参数化查询
- [ ] 白名单验证
```
