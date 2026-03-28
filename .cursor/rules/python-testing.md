---
description: "Python 测试规范"
globs: ["**/*.py", "**/*.pyi"]
alwaysApply: false
---
# Python 测试规范

> 扩展通用测试规范，补充 Python 专项内容。

## 框架

使用 **pytest** 作为测试框架。

## 覆盖率

```bash
pytest --cov=src --cov-report=term-missing
```

## 测试组织

使用 `pytest.mark` 分类测试：

```python
import pytest

@pytest.mark.unit
def test_calculate_total():
    assert calculate_total([1, 2, 3]) == 6

@pytest.mark.integration
def test_database_connection():
    # 集成测试需要真实数据库连接
    ...
```

## 测试示例

```python
from unittest.mock import Mock, patch

def test_user_service_create():
    mock_repo = Mock()
    mock_repo.save.return_value = {"id": "1", "name": "Alice"}

    service = UserService(repo=mock_repo)
    result = service.create_user({"name": "Alice"})

    assert result["id"] == "1"
    mock_repo.save.assert_called_once()
```

## 使用技能

使用 **TDD 开发大师**（`/tdd`）引导测试驱动开发流程。
