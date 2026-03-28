---
description: "Python 编码规范"
globs: ["**/*.py", "**/*.pyi"]
alwaysApply: false
---
# Python 编码规范

> 扩展通用编码规范，补充 Python 专项内容。

## 标准

- 遵循 **PEP 8** 规范
- 所有函数签名使用**类型注解**

## 不可变性

优先使用不可变数据结构：

```python
from dataclasses import dataclass
from typing import NamedTuple

@dataclass(frozen=True)
class User:
    name: str
    email: str

class Point(NamedTuple):
    x: float
    y: float
```

## 格式化工具

- **ruff** — 代码格式化 + lint（推荐）
- **black** — 仅格式化
- **isort** — import 排序
- **mypy** / **pyright** — 类型检查

## 设计模式

```python
from typing import Protocol

# Repository 模式
class UserRepository(Protocol):
    def find_by_id(self, id: str) -> dict | None: ...
    def save(self, entity: dict) -> dict: ...

# DTO（数据传输对象）
@dataclass
class CreateUserRequest:
    name: str
    email: str
    age: int | None = None
```

## 资源管理

使用上下文管理器（`with` 语句）管理资源：

```python
with open('file.txt') as f:
    content = f.read()
```

## Print 语句

- 生产代码中禁止使用 `print()`
- 改用 `logging` 模块
