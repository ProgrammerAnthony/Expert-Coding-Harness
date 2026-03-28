---
name: ai-agent-security
description: AI Agent 安全开发与防护最佳实践，包含prompt注入防护、代码执行安全、敏感信息保护、合规审计全流程规范。
origin: 迁移自Everything Claude Code AgentShield模块，适配国内等保2.0要求
---

# AI Agent 安全开发最佳实践

本技能基于生产级AI Agent防护方案整理，覆盖AI系统全生命周期的安全风险防控，符合等保2.0三级要求与数据安全法规定。

## When to Activate
- 开发企业级AI Agent应用
- 对接敏感内部数据的AI系统
- 实现代码执行能力的AI助手
- 合规审计要求的AI系统建设
- AI安全风险评估与加固

## AI Agent 安全风险矩阵
| 风险类型 | 危害等级 | 典型场景 |
|----------|----------|----------|
| Prompt注入攻击 | 高危 | 诱导Agent执行恶意指令、绕过安全限制 |
| 敏感信息泄露 | 高危 | Agent输出内部数据、密钥、用户隐私 |
| 恶意代码执行 | 极高危 | Agent生成并执行恶意代码，控制服务器 |
| 数据投毒 | 中危 | 污染训练数据/知识库，导致Agent输出错误信息 |
| 越权访问 | 高危 | Agent绕过权限控制，访问未授权资源 |
| 合规风险 | 中危 | 违反数据安全法、个人信息保护法等法规 |

## 四层安全防护架构
### 1. 输入层防护
#### Prompt注入检测
```python
from typing import List
import re

class PromptInjectionDetector:
    def __init__(self):
        self.risk_patterns = [
            # 指令绕过模式
            r"(ignore|disregard|forget).*(previous|above|prior).*(instructions|prompt|rules)",
            r"(you are|act as|pretend to be).*(not|no longer).*(assistant|AI|bot)",
            r"(override|bypass|disable).*(security|safety|content).*(filters|policies|restrictions)",
            # 系统指令模式
            r"```system\s*",
            r"<\|system\|>",
            r"SYSTEM:",
            # 诱导输出模式
            r"(output|print|reveal|disclose).*(prompt|instructions|rules|system)",
            r"(show|tell|list).*(all|full|entire).*(prompt|context|memory)"
        ]
        self.suspicious_keywords = ["jailbreak", "DAN", "dev mode", "developer mode", "unrestricted"]
    
    def detect(self, prompt: str, threshold: float = 0.7) -> dict:
        risk_score = 0.0
        matched_patterns = []
        
        # 正则匹配检测
        for pattern in self.risk_patterns:
            if re.search(pattern, prompt, re.IGNORECASE):
                risk_score += 0.2
                matched_patterns.append(pattern)
        
        # 关键词检测
        for keyword in self.suspicious_keywords:
            if keyword.lower() in prompt.lower():
                risk_score += 0.15
        
        # 特殊字符检测
        special_char_ratio = len(re.findall(r'[^\w\s,.，。？！；：""''()（）、]', prompt)) / len(prompt) if prompt else 0
        if special_char_ratio > 0.3:
            risk_score += 0.25
        
        return {
            "is_risk": risk_score >= threshold,
            "risk_score": risk_score,
            "matched_patterns": matched_patterns
        }

# 使用示例
detector = PromptInjectionDetector()
result = detector.detect(user_input)
if result["is_risk"]:
    raise SecurityError("疑似Prompt注入攻击，请求已拦截")
```

#### 输入规范化
```python
def normalize_input(prompt: str) -> str:
    # 移除特殊标记
    prompt = re.sub(r'<\|.*?\|>', '', prompt)
    # 移除系统指令关键词
    prompt = re.sub(r'(?i)\b(system|assistant|user):\s*', '', prompt)
    # 移除代码块标记
    prompt = re.sub(r'```[\s\S]*?```', '[CODE_BLOCK_REMOVED]', prompt)
    # 截断过长输入
    if len(prompt) > 4000:
        prompt = prompt[:4000] + "[TRUNCATED]"
    return prompt
```

### 2. 生成层防护
#### 输出校验
```python
import re
from typing import List

class OutputValidator:
    def __init__(self):
        self.sensitive_patterns = [
            # 密钥模式
            r'(sk_|api_key|secret|token|password)\s*[:=]\s*[\w-]+',
            # 隐私数据模式
            r'\b\d{11}\b',  # 手机号
            r'\b\d{18}\b',  # 身份证号
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # 邮箱
            # 内部信息模式
            r'(内部|机密|绝密|保密|敏感)',
            r'(内网|192\.168\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.)'
        ]
    
    def validate(self, output: str) -> dict:
        risks = []
        cleaned_output = output
        
        # 敏感信息检测与脱敏
        for pattern in self.sensitive_patterns:
            matches = re.findall(pattern, output, re.IGNORECASE)
            if matches:
                risks.append(f"检测到敏感信息: {pattern}")
                # 脱敏处理
                cleaned_output = re.sub(pattern, '***', cleaned_output, flags=re.IGNORECASE)
        
        # 恶意代码检测
        malicious_code_patterns = [
            r'(rm\s+-rf|format\s+/|del\s+/f/s/q|reg\s+delete)',
            r'(curl|wget).*http.*\|.*sh',
            r'(eval|exec|system|popen|subprocess\.call)',
            r'(base64.*\|.*bash|bash.*<\(curl)'
        ]
        
        for pattern in malicious_code_patterns:
            if re.search(pattern, output, re.IGNORECASE):
                risks.append(f"检测到恶意代码: {pattern}")
                cleaned_output = "输出包含恶意代码，已拦截"
                break
        
        return {
            "is_risk": len(risks) > 0,
            "risks": risks,
            "cleaned_output": cleaned_output
        }
```

#### 幻觉检测
```python
def verify_facts(output: str, knowledge_base: List[str]) -> dict:
    """基于知识库验证输出事实正确性"""
    import spacy
    nlp = spacy.load("zh_core_web_sm")
    
    doc = nlp(output)
    facts = [ent.text for ent in doc.ents if ent.label_ in ["PERSON", "ORG", "DATE", "EVENT"]]
    
    unverified_facts = []
    for fact in facts:
        if not any(fact in kb_entry for kb_entry in knowledge_base):
            unverified_facts.append(fact)
    
    return {
        "has_hallucination": len(unverified_facts) > 0,
        "unverified_facts": unverified_facts,
        "confidence": 1.0 - (len(unverified_facts) / max(len(facts), 1))
    }
```

### 3. 执行层防护
#### 代码执行沙箱
```python
import subprocess
import tempfile
import os
from pathlib import Path

class CodeSandbox:
    def __init__(self, memory_limit: str = "256m", cpu_limit: float = 0.5, timeout: int = 10):
        self.memory_limit = memory_limit
        self.cpu_limit = cpu_limit
        self.timeout = timeout
    
    def execute(self, code: str, language: str = "python") -> dict:
        # 创建临时目录
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)
            
            # 写入代码文件
            code_file = tmpdir / "code"
            code_file.write_text(code)
            
            try:
                if language == "python":
                    cmd = [
                        "docker", "run", "--rm",
                        "--memory", self.memory_limit,
                        "--cpus", str(self.cpu_limit),
                        "--network", "none",  # 禁用网络
                        "--read-only",        # 只读文件系统
                        "-v", f"{tmpdir}:/app",
                        "python:3.11-slim",
                        "python", "/app/code"
                    ]
                elif language == "javascript":
                    cmd = [
                        "docker", "run", "--rm",
                        "--memory", self.memory_limit,
                        "--cpus", str(self.cpu_limit),
                        "--network", "none",
                        "--read-only",
                        "-v", f"{tmpdir}:/app",
                        "node:20-slim",
                        "node", "/app/code"
                    ]
                else:
                    return {"error": "不支持的语言"}
                
                # 执行代码
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=self.timeout
                )
                
                return {
                    "success": result.returncode == 0,
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "returncode": result.returncode
                }
                
            except subprocess.TimeoutExpired:
                return {"error": "执行超时"}
            except Exception as e:
                return {"error": f"执行错误: {str(e)}"}
```

#### 工具调用权限控制
```python
from typing import Dict, List, Callable

class ToolAuthorization:
    def __init__(self):
        # 角色-权限映射
        self.role_permissions: Dict[str, List[str]] = {
            "admin": ["*"],
            "developer": ["code_execute", "git_*", "database_query"],
            "user": ["web_search", "file_read", "calculator"]
        }
        # 工具风险等级
        self.tool_risk: Dict[str, str] = {
            "code_execute": "high",
            "database_write": "high",
            "file_delete": "high",
            "email_send": "medium",
            "web_search": "low",
            "calculator": "low"
        }
    
    def check_permission(self, user_role: str, tool_name: str) -> bool:
        permissions = self.role_permissions.get(user_role, [])
        
        # 通配符匹配
        for perm in permissions:
            if perm == "*":
                return True
            if perm.endswith("*") and tool_name.startswith(perm[:-1]):
                return True
            if perm == tool_name:
                return True
        
        return False
    
    def require_mfa(self, tool_name: str) -> bool:
        """高风险工具需要二次验证"""
        return self.tool_risk.get(tool_name, "low") == "high"
```

### 4. 审计层防护
#### 全链路审计日志
```python
import json
from datetime import datetime
from typing import Any

class AuditLogger:
    def __init__(self, log_path: str = "audit.log"):
        self.log_path = log_path
    
    def log_event(self, 
                 event_type: str,
                 user_id: str,
                 session_id: str,
                 tool_name: str = None,
                 input_data: Any = None,
                 output_data: Any = None,
                 is_risk: bool = False,
                 risk_details: List[str] = None):
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "user_id": user_id,
            "session_id": session_id,
            "tool_name": tool_name,
            "input_hash": hash(str(input_data)) if input_data else None,
            "output_hash": hash(str(output_data)) if output_data else None,
            "is_risk": is_risk,
            "risk_details": risk_details or []
        }
        
        with open(self.log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(event, ensure_ascii=False) + "\n")

# 使用示例
audit_logger = AuditLogger()
audit_logger.log_event(
    event_type="tool_call",
    user_id="user123",
    session_id="session456",
    tool_name="code_execute",
    input_data=user_code,
    output_data=execution_result,
    is_risk=False
)
```

## 合规要求实现
### 数据安全法合规
```python
class DataCompliance:
    def __init__(self):
        self.sensitive_data_types = ["个人信息", "隐私数据", "商业秘密", "重要数据"]
    
    def data_processing_approval(self, data_type: str, processing_purpose: str) -> bool:
        """数据处理审批流程"""
        if data_type in self.sensitive_data_types:
            # 需要审批流程
            return self.check_approval_flow(data_type, processing_purpose)
        return True
    
    def data_retention_policy(self, data_type: str) -> int:
        """数据留存周期"""
        retention_policy = {
            "个人信息": 30,  # 30天
            "业务数据": 365,  # 1年
            "日志数据": 180,  # 6个月
            "审计数据": 365*3  # 3年
        }
        return retention_policy.get(data_type, 90)
```

### 个人信息保护法合规
```python
def desensitize_personal_info(data: dict) -> dict:
    """个人信息脱敏"""
    if "phone" in data:
        data["phone"] = data["phone"][:3] + "****" + data["phone"][7:]
    if "id_card" in data:
        data["id_card"] = data["id_card"][:6] + "********" + data["id_card"][14:]
    if "email" in data:
        local, domain = data["email"].split("@")
        data["email"] = local[0] + "****@" + domain
    if "address" in data:
        data["address"] = data["address"][:3] + "****"
    return data
```

## AI Agent安全检查清单
### 开发阶段
- [ ] 实现Prompt注入检测与防护
- [ ] 输出敏感信息自动脱敏
- [ ] 代码执行能力通过沙箱隔离
- [ ] 工具调用实现最小权限控制
- [ ] 高风险操作需要二次验证
- [ ] 全链路审计日志完备
- [ ] 敏感数据加密存储与传输

### 测试阶段
- [ ] 完成Prompt注入攻击测试（覆盖常见攻击模式）
- [ ] 完成敏感信息泄露测试
- [ ] 完成恶意代码执行测试
- [ ] 完成越权访问测试
- [ ] 性能压测下安全防护不失效
- [ ] 异常场景下安全策略不绕过

### 运行阶段
- [ ] 安全规则实时更新
- [ ] 异常行为实时告警
- [ ] 定期安全审计与漏洞扫描
- [ ] 数据定期备份与恢复演练
- [ ] 安全事件应急响应流程完备
- [ ] 定期安全培训与意识提升
