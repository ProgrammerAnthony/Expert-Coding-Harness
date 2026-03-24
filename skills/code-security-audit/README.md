# 代码安全审计专家

基于深度数据流分析和业务逻辑理解的专家级白盒安全审计，覆盖 10 个安全维度，五阶段标准化审计协议，所有发现均要求代码路径证据。

## 安装

```bash
npx skills add ProgrammerAnthony/Expert-Coding-Skills --path skills/code-security-audit
```

## 使用方式

```
/代码安全审计
```

或：

```
/audit
```

## 扫描模式

| 模式 | 适用场景 | 时间 | 覆盖内容 |
|------|----------|------|---------|
| **Quick** | CI/CD、小项目、快速验证 | 5-10 分钟 | 高危漏洞 + 敏感信息 + 依赖 CVE |
| **Standard** | 常规审计、迭代前安全检查 | 30-60 分钟 | OWASP Top 10 + 认证授权 + 加密 |
| **Deep** | 重要项目、上线前审计、渗透测试准备 | 1-3 小时 | 全维度 + 攻击链 + 业务逻辑 + 合规 |

## 10 个安全维度

| # | 维度 | 典型漏洞 |
|---|------|---------|
| D1 | 注入 | SQL注入、命令注入、SSTI、JNDI |
| D2 | 认证 | Token 伪造、Session 固定、弱密码策略 |
| D3 | 授权 | 水平越权、垂直越权、IDOR |
| D4 | 反序列化 | Java Gadget链、Pickle RCE、YAML注入 |
| D5 | 文件操作 | 路径穿越、恶意文件上传 |
| D6 | SSRF | 内网探测、协议滥用 |
| D7 | 加密 | 弱算法、硬编码密钥、证书校验绕过 |
| D8 | 配置 | 调试接口暴露、CORS 过宽、错误信息泄露 |
| D9 | 业务逻辑 | 竞态条件、价格篡改、Mass Assignment |
| D10 | 供应链 | 已知 CVE、版本过旧 |

## 审计流程

```
Phase 1: 侦察与架构建模（10%）
  ↓ 识别技术栈、绘制架构图、梳理攻击面
Phase 2: 并行模式匹配（30%）
  ↓ 按 D1-D10 三轨扫描，定位高风险区域
Phase 3: 深度污点追踪（40%）
  ↓ Source → Filter → Service → Sink 完整追踪
Phase 4: 攻击链构建与验证（15%）
  ↓ 评估漏洞组合利用场景，评估综合风险
Phase 5: 生成结构化报告（5%）
  ↓ 漏洞清单 + 攻击链分析 + 优先级修复建议
```

## 支持的技术栈

- **Java**：Spring Boot、MyBatis、Shiro、Fastjson
- **Python**：Django、Flask、FastAPI
- **Go**：Gin、Echo、Fiber
- **PHP**：Laravel、ThinkPHP
- **Node.js**：Express、Koa、NestJS
- **其他**：C/C++、.NET/C#、Ruby、Rust

## 核心特性

- **三层分析法**：面（模式匹配）→ 线（数据流追踪）→ 点（逻辑验证）
- **防幻觉机制**：所有漏洞必须有文件路径 + 行号 + 完整调用链证据
- **攻击链分析**：分析漏洞组合利用场景，评估综合风险
- **WooYun 案例库**：包含 2010-2016 年真实漏洞案例参考
- **合规覆盖**：支持 GDPR、PCI-DSS、ISO 27001 合规审计维度
