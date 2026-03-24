# 攻击链分析知识

## 一、攻击链分析的核心思想

攻击链分析是Phase 4的核心任务，目的是构建漏洞组合攻击链，评估综合风险，不是单个漏洞的简单叠加。

## 二、攻击链类型

### 2.1 认证绕过 + 数据泄露

**攻击路径**
1. 绕过认证
2. 访问敏感数据
3. 窃取敏感信息

**示例**
```java
// 第一步：认证绕过
@GetMapping("/admin/users")
public List<User> getAllUsers() {
    // 缺少认证检查
    return userService.getAllUsers();
}

// 第二步：数据泄露
@GetMapping("/admin/export")
public String exportUsers() {
    // 缺少权限检查
    List<User> users = userService.getAllUsers();
    return exportToCSV(users);
}
```

**综合风险**：Critical - 可以完全控制数据库并窃取所有用户数据

### 2.2 认证绕过 + 文件上传

**攻击路径**
1. 绕过认证
2. 上传恶意文件
3. 执行恶意代码
4. 控制服务器

**示例**
```java
// 第一步：认证绕过
@PostMapping("/admin/upload")
public String uploadFile(@RequestParam MultipartFile file) {
    // 缺少认证检查
    String filename = file.getOriginalFilename();
    File dest = new File("/var/www/uploads/" + filename);
    file.transferTo(dest);
    return "上传成功";
}

// 第二步：文件上传漏洞
// 上传shell.php
// 访问http://example.com/uploads/shell.php
// 执行系统命令
```

**综合风险**：Critical - 可以完全控制服务器

### 2.3 SQL注入 + 认证绕过

**攻击路径**
1. 绕过认证
2. 利用SQL注入获取管理员权限
3. 执行管理操作

**示例**
```java
// 第一步：认证绕过
@PostMapping("/login")
public String login(@RequestParam String username, @RequestParam String password) {
    // 逻辑错误认证绕过
    if (username.equals("admin") && password.length() > 0) {
        return "登录成功";
    }
    return "登录失败";
}

// 第二步：SQL注入
@GetMapping("/users/{id}")
public User getUserById(@PathVariable Long id) {
    String sql = "SELECT * FROM users WHERE id = " + id;
    return jdbcTemplate.query(sql);
}

// 攻击步骤：
// 1. 使用' OR '1'='1绕过登录
// 2. 使用SQL注入获取管理员用户
// 3. 执行管理操作
```

**综合风险**：Critical - 可以获取管理员权限并执行任意操作

### 2.4 XSS + CSRF

**攻击路径**
1. 利用CSRF伪造用户操作
2. 利用XSS窃取用户会话
3. 以用户身份执行恶意操作

**示例**
```html
<!-- 第一步：CSRF -->
<form action="http://example.com/api/change-password" method="POST">
    <input type="hidden" name="new_password" value="hacked">
    <input type="submit" value="提交">
</form>

<!-- 第二步：XSS -->
<script>
fetch('http://example.com/api/comments', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        content: '<script>alert(document.cookie)</script>'
    })
});
</script>

<!-- 攻击步骤： -->
<!-- 1. 诱导用户点击CSRF链接 -->
<!-- 2. CSRF请求修改密码 -->
<!-- 3. XSS窃取用户Cookie -->
<!-- 4. 使用Cookie访问系统 -->
```

**综合风险**：High - 可以以用户身份执行恶意操作

### 2.5 SSRF + 内网扫描

**攻击路径**
1. 利用SSRF访问内网
2. 扫描内网服务
3. 发现更多漏洞
4. 扩大攻击面

**示例**
```bash
# 第一步：SSRF
curl -X GET "http://example.com/api/proxy?url=http://192.168.1.1:22"

# 第二步：内网扫描
curl -X GET "http://example.com/api/proxy?url=http://192.168.1.1:8080"
curl -X GET "http://example.com/api/proxy?url=http://192.168.1.1:3306"

# 第三步：发现更多漏洞
# 发现内网服务存在更多漏洞
# 利用SSRF访问更多内网服务
```

**综合风险**：High - 可以访问内网并发现更多漏洞

## 三、攻击链分析方法

### 3.1 漏洞关联分析

**方法**：分析漏洞之间的关联关系

**步骤**
1. 识别所有发现的漏洞
2. 分析漏洞之间的关联
3. 构建漏洞依赖关系图
4. 识别可能的攻击链

**示例**
```
漏洞A：认证绕过
漏洞B：SQL注入
漏洞C：文件上传

关联关系：
- 漏洞A可以访问漏洞B的入口
- 漏洞B可以获取管理员权限
- 漏洞C可以上传恶意文件

攻击链：A -> B -> C
```

### 3.2 攻击路径构建

**方法**：构建完整的攻击路径

**步骤**
1. 确定攻击目标
2. 选择初始漏洞
3. 逐步利用漏洞
4. 达到最终目标

**示例**
```
攻击目标：完全控制服务器

初始漏洞：认证绕过
中间漏洞：SQL注入、文件上传
最终目标：完全控制服务器

攻击路径：
1. 利用认证绕过访问系统
2. 利用SQL注入获取管理员权限
3. 利用文件上传上传WebShell
4. 执行系统命令，完全控制服务器
```

### 3.3 综合风险评估

**方法**：评估攻击链的综合风险

**评估维度**
- 攻击难度：整个攻击链的利用难度
- 影响范围：攻击链最终影响范围
- 数据泄露：攻击链导致的数据泄露程度
- 系统控制：攻击链导致的系统控制程度

**风险等级**
- Critical：可以完全控制系统
- High：可以窃取大量敏感数据
- Medium：可以访问部分敏感功能
- Low：影响有限

## 四、攻击链验证

### 4.1 静态验证

**方法**：通过代码分析验证攻击链的可行性

**检查项**
- 漏洞之间的依赖关系
- 攻击路径的逻辑性
- 防护措施的有效性
- 触发条件的可满足性

### 4.2 动态验证

**方法**：通过实际测试验证攻击链的可行性

**检查项**
- 每个漏洞的利用性
- 攻击链的完整性
- 实际影响的确认
- 防护措施的绕过性

### 4.3 综合验证

**方法**：结合静态和动态验证

**步骤**
1. 静态分析验证攻击链逻辑
2. 动态测试验证攻击链可行性
3. 综合评估攻击链风险
4. 提供修复建议

## 五、攻击链报告

### 5.1 报告内容

攻击链分析报告应包含：
- 攻击链描述
- 漏洞依赖关系图
- 攻击路径图
- 综合风险评估
- 修复建议

### 5.2 报告格式

建议使用JSON格式，便于后续处理：
```json
{
  "scan_date": "2024-01-01T00:00:00Z",
  "target_directory": "/path/to/project",
  "attack_chains": [
    {
      "chain_id": "AC-001",
      "description": "认证绕过 + SQL注入",
      "vulnerabilities": [
        {
          "id": "VULN-001",
          "type": "auth_bypass",
          "file": "AuthFilter.java",
          "line": 23
        },
        {
          "id": "VULN-002",
          "type": "sql_injection",
          "file": "UserController.java",
          "line": 45
        }
      ],
      "attack_path": [
        {
          "step": 1,
          "action": "绕过认证",
          "vulnerability": "VULN-001"
        },
        {
          "step": 2,
          "action": "利用SQL注入获取管理员权限",
          "vulnerability": "VULN-002"
        }
      ],
      "final_impact": "可以获取管理员权限并执行任意操作",
      "risk_level": "critical"
    }
  ],
  "summary": {
    "total_chains": 1,
    "critical_chains": 1,
    "high_chains": 0,
    "medium_chains": 0,
    "low_chains": 0
  }
}
```

## 六、最佳实践

### 6.1 攻击链分析原则

- 系统性：系统分析所有漏洞的关联关系
- 逻辑性：构建逻辑合理的攻击路径
- 可验证性：确保攻击链可以验证
- 可修复性：提供可行的修复建议

### 6.2 优先级决策

- 认证链优先：优先分析涉及认证绕过的攻击链
- 高影响优先：优先分析影响范围大的攻击链
- 低难度优先：优先分析利用难度低的攻击链
- 业务价值关联：优先分析涉及核心业务逻辑的攻击链

### 6.3 持续改进

- 知识库更新：将新发现的攻击链模式加入知识库
- 工具优化：根据分析经验优化攻击链分析工具
- 流程改进：基于分析结果改进攻击链分析流程
- 技能提升：针对分析中发现的知识gaps进行培训