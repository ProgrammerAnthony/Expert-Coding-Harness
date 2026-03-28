---
description: "Python 安全规范"
globs: ["**/*.py", "**/*.pyi"]
alwaysApply: false
---
# Python 安全规范

> 扩展通用安全规范，补充 Python 专项内容。

## 密钥管理

```python
import os
from dotenv import load_dotenv

load_dotenv()

# 推荐：缺失时抛出 KeyError（快速失败）
api_key = os.environ["OPENAI_API_KEY"]

# 或使用 get 并手动检查
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY 未配置")
```

## SQL 注入防护

```python
# 错误：字符串拼接
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# 正确：参数化查询
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

## 安全扫描工具

```bash
# bandit — 静态安全分析
bandit -r src/

# safety — 依赖漏洞检查
safety check
```

## 安全审计

使用 **代码安全审计专家** 技能（`/代码安全审计`）进行全面安全审查。
