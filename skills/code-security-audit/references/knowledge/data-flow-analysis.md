# 数据流分析知识

## 一、数据流分析的核心思想

数据流分析是Phase 3的核心任务，目的是追踪数据从Source到Sink的完整路径，确认漏洞的真实性和可利用性。

## 二、数据流模型

### 2.1 Source（数据源）

**定义**：用户可控的输入点

**常见Source**
- HTTP请求参数
- 路径参数
- 查询参数
- 请求体
- Cookie
- Header
- 文件上传

**识别方法**
- 查找Controller层的参数接收
- 查找@PathVariable、@RequestParam、@RequestBody等注解
- 查找request.getParameter()、request.args.get()等方法

### 2.2 Filter（安全控制点）

**定义**：数据流中的安全控制点

**常见Filter**
- 输入验证
- 类型转换
- 数据清洗
- 权限检查
- 认证检查

**识别方法**
- 查找Filter、Interceptor、Middleware类
- 查找@PreAuthorize、@RolesAllowed等注解
- 查找isAuthenticated()、hasPermission()等方法

### 2.3 Service（业务处理）

**定义**：业务逻辑处理层

**常见Service**
- 业务规则验证
- 数据转换
- 状态更新
- 事务管理

**识别方法**
- 查找Service层的方法
- 查找@Transactional等注解
- 查找业务逻辑处理代码

### 2.4 Sink（数据汇聚点）

**定义**：数据最终输出的地方

**常见Sink**
- 数据库操作
- 文件操作
- 命令执行
- 网络请求
- 前端输出

**识别方法**
- 查找数据库操作方法
- 查找文件操作方法
- 查找命令执行方法
- 查找HTTP请求方法
- 查找前端输出方法

## 三、数据流追踪方法

### 3.1 静态追踪

**方法**：通过代码静态分析，追踪数据流向

**步骤**
1. 识别Source点
2. 追踪数据到Filter点
3. 追踪数据到Service点
4. 追踪数据到Sink点

**工具**
- 抽象语法树分析
- 数据流分析框架
- 污点分析工具

### 3.2 动态追踪

**方法**：通过运行时分析，追踪数据流向

**步骤**
1. 构造测试数据
2. 执行代码
3. 监控数据流向
4. 记录数据变化

**工具**
- 调试器
- 日志分析
- 运行时监控

### 3.3 混合追踪

**方法**：结合静态和动态追踪，提高准确性

**步骤**
1. 静态分析识别潜在路径
2. 动态验证确认实际路径
3. 人工审计确认细节

## 四、常见数据流模式

### 4.1 直接流

**模式**：Source -> Sink，无中间处理

**示例**
```java
@GetMapping("/users/{id}")
public User getUserById(@PathVariable Long id) {
    String sql = "SELECT * FROM users WHERE id = " + id;
    return jdbcTemplate.query(sql);
}
```

**风险**：无输入验证，直接拼接SQL

### 4.2 验证流

**模式**：Source -> Filter -> Sink

**示例**
```java
@GetMapping("/users/{id}")
public User getUserById(@PathVariable Long id) {
    if (!isValidId(id)) {
        throw new IllegalArgumentException("Invalid ID");
    }
    String sql = "SELECT * FROM users WHERE id = ?";
    return jdbcTemplate.query(sql, new Object[]{id});
}
```

**风险**：有输入验证，但可能绕过

### 4.3 复杂流

**模式**：Source -> Filter -> Service -> Sink

**示例**
```java
@GetMapping("/users/{id}")
public User getUserById(@PathVariable Long id) {
    if (!isValidId(id)) {
        throw new IllegalArgumentException("Invalid ID");
    }
    User user = userService.findById(id);
    if (!hasPermission(user)) {
        throw new AccessDeniedException("No permission");
    }
    return user;
}
```

**风险**：多层验证，但可能存在逻辑漏洞

## 五、数据流完整性检查

### 5.1 路径完整性

**检查项**
- Source到Filter：数据是否经过验证
- Filter到Service：数据是否经过处理
- Service到Sink：数据是否经过业务逻辑
- 整体路径：数据流是否完整无截断

### 5.2 验证完整性

**检查项**
- 输入验证：所有用户输入是否都经过验证
- 类型检查：数据类型是否正确转换
- 范围检查：数据范围是否正确限制
- 格式检查：数据格式是否正确验证

### 5.3 权限完整性

**检查项**
- 认证检查：所有敏感操作是否都经过认证
- 授权检查：所有资源访问是否都经过授权
- 角色检查：角色权限是否正确验证
- 资源检查：资源所有权是否正确验证

## 六、数据流分析方法

### 6.1 向前追踪

**方法**：从Source向前追踪到Sink

**步骤**
1. 识别Source点
2. 查找数据流向
3. 逐层追踪到Sink
4. 确认数据流完整性

### 6.2 向后追踪

**方法**：从Sink向后追踪到Source

**步骤**
1. 识别Sink点
2. 查找数据来源
3. 逐层追踪到Source
4. 确认数据流完整性

### 6.3 双向追踪

**方法**：同时向前和向后追踪，提高准确性

**步骤**
1. 识别Source和Sink点
2. 向前追踪确认数据流
3. 向后追踪确认数据流
4. 对比确认一致性

## 七、数据流分析报告

### 7.1 报告内容

数据流分析报告应包含：
- 数据流图
- Source点列表
- Filter点列表
- Service点列表
- Sink点列表
- 漏洞确认列表
- 风险评估

### 7.2 报告格式

建议使用JSON格式，便于后续处理：
```json
{
  "scan_date": "2024-01-01T00:00:00Z",
  "target_directory": "/path/to/project",
  "data_flows": [
    {
      "source": {
        "file": "UserController.java",
        "line": 45,
        "type": "request_parameter"
      },
      "filter": {
        "file": "AuthFilter.java",
        "line": 23,
        "type": "input_validation"
      },
      "service": {
        "file": "UserService.java",
        "line": 67,
        "type": "business_logic"
      },
      "sink": {
        "file": "UserRepository.java",
        "line": 89,
        "type": "database_operation"
      }
    }
  ],
  "vulnerabilities": [
    {
      "type": "sql_injection",
      "file": "UserController.java",
      "line": 45,
      "pattern": "SELECT * FROM users WHERE id = \" + id",
      "line_content": "String sql = \"SELECT * FROM users WHERE id = \" + id;",
      "severity": "high"
    }
  ],
  "summary": {
    "total_data_flows": 10,
    "total_vulnerabilities": 5,
    "languages": ["java"]
  }
}
```

## 八、最佳实践

### 8.1 数据流追踪原则

- 完整性：确保数据流从Source到Sink的完整追踪
- 准确性：确保数据流分析的准确性
- 可验证性：确保数据流分析结果可验证
- 可重现性：确保数据流分析结果可重现

### 8.2 优先级决策

- 认证链优先：优先审计认证相关数据流
- Sink聚合点优先：优先审计公共工具类的数据流
- 攻击面导向：根据技术栈调整审计重点
- 业务价值关联：优先审计核心业务逻辑的数据流

### 8.3 持续改进

- 定期更新数据流分析方法
- 收集新的数据流模式
- 优化数据流分析工具
- 分享数据流分析最佳实践