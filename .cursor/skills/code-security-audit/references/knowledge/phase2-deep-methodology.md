# Phase 2 深度审计方法论

> 本文档定义 Phase 2（并行模式匹配 + 深度污点追踪）的具体执行方法
> 对应 coverage-matrix.md 中三种轨道的审计策略

---

## Phase 2.1 Sink-driven 审计方法 (D1, D4, D5, D6)

### 核心逻辑

Sink-driven 审计的核心是**从危险函数出发，反向追踪数据源**。适用于存在"危险代码"的漏洞类型：
- D1 注入：SQL 注入、命令注入、LDAP 注入等
- D4 反序列化：不受信数据反序列化
- D5 文件操作：路径遍历、任意文件读取
- D6 SSRF：服务端请求伪造

### 执行步骤

#### Step 1: 识别 Sink 点（危险函数）

**D1 注入类 Sink**：
```
SQL:  executeQuery(), execute(), query(), raw(), find_by_sql()
Cmd:  exec(), system(), shell_exec(), passthru(), popen(), proc_open()
LDAP: ldap_search(), ldap_bind()
SSTI: render_template(), render(), Template()
SpEL: SpelExpressionParser.parseExpression(), getValue()
JNDI: lookup(), bind(), rebind()
```

**D4 反序列化 Sink**：
```
Java: ObjectInputStream.readObject(), readUnshared()
      XStream.fromXML(), JSON.parseObject()
Python: pickle.loads(), yaml.load(), json.loads()
PHP:  unserialize(), igbinary_unserialize()
```

**D5 文件操作 Sink**：
```
读取: FileInputStream(), Files.readAllBytes(), open(), readFile()
写入: FileOutputStream(), Files.write(), file_put_contents()
包含: include(), require(), import(), eval()
上传: move_uploaded_file(), MultipartFile.transferTo()
```

**D6 SSRF Sink**：
```
HTTP: URL.openConnection(), HttpClient.execute(), requests.get()
      curl_exec(), file_get_contents()
DNS:  gethostbyname(), InetAddress.getByName()
```

#### Step 2: 反向数据流追踪

对于每个 Sink 点，执行以下追踪：

```
Sink (危险函数)
  ↑
  |  参数传递
  |
Service (业务处理层)
  ↑
  |  数据转换/处理
  |
Filter (输入验证/权限检查)
  ↑
  |  原始输入
  |
Source (用户可控输入)
```

**追踪要点**：
1. 标记所有中间变量赋值
2. 识别数据转换函数（如拼接、编码、过滤）
3. 检查 Filter 层的有效性
4. 确认 Source 是否用户可控

#### Step 3: 验证防护机制

检查数据流中是否存在以下防护：

**输入验证**：
- 白名单验证（推荐）
- 黑名单过滤（易绕过）
- 类型转换/强制类型

**输出编码**：
- SQL：参数化查询、预编译语句
- HTML：htmlspecialchars(), htmlentities()
- URL：urlencode(), encodeURIComponent()
- 命令：escapeshellarg(), escapeshellcmd()

**上下文隔离**：
- 沙箱执行
- 权限最小化
- 网络隔离

#### Step 4: 计算 Sink 扇出率

```
Sink 扇出率 = 实际审计的 Sink 调用点 / 代码中所有 Sink 调用点
```

**覆盖标准**：
- Deep 模式：扇出率 ≥ 30%
- Standard 模式：扇出率 ≥ 20%
- Quick 模式：扇出率 ≥ 10%（仅高危 Sink）

### 输出要求

每个 Sink-driven 漏洞必须包含：
1. **Sink 位置**：文件路径、行号、函数名
2. **Source 位置**：用户输入的入口点
3. **数据流路径**：从 Source 到 Sink 的完整调用链
4. **防护评估**：是否存在防护，防护是否有效
5. **利用难度**：是否需要绕过防护，绕过复杂度

---

## Phase 2.2 Control-driven 审计方法 (D3, D9)

### 核心逻辑

Control-driven 审计的核心是**枚举操作端点，验证安全控制是否存在**。适用于"代码缺失"的漏洞类型：
- D3 授权：IDOR、水平越权、垂直越权
- D9 业务逻辑：竞态条件、流程绕过、Mass Assignment

**关键区别**：这类漏洞的本质是"应该有的代码没有写"，Grep 搜不到"不存在的代码"，必须通过系统化的端点枚举和权限验证来发现。

### 执行步骤

#### Step 1: 枚举所有端点

**Web 层端点**：
```
- Controller 方法（Spring: @RequestMapping, @GetMapping）
- Router 定义（Express: app.get(), app.post()）
- API 端点（Django: urlpatterns）
```

**Service 层操作**：
```
- 公开方法（public methods）
- 内部调用（internal calls）
- 事件监听（event listeners）
```

**数据访问层**：
```
- Repository 方法
- DAO 层操作
- 原始 SQL 查询
```

#### Step 2: 构建端点-权限矩阵

为每个端点记录以下信息：

| 端点 | HTTP方法 | 资源类型 | 操作类型 | 需要认证? | 权限检查? | 归属验证? |
|------|---------|---------|---------|----------|----------|----------|
| /api/users/{id} | GET | User | Read | [ ] | [ ] | [ ] |
| /api/users/{id} | PUT | User | Update | [ ] | [ ] | [ ] |
| /api/users/{id} | DELETE | User | Delete | [ ] | [ ] | [ ] |
| /api/admin/users | GET | User | List | [ ] | [ ] | N/A |

#### Step 3: 验证安全控制

**D3 授权验证**：

对于每个敏感操作，检查：

1. **认证检查**：
   ```java
   // 正确示例
   @PreAuthorize("isAuthenticated()")
   public User getUser(Long id) { ... }
   
   // 错误示例 - 缺少认证检查
   public User getUser(Long id) { ... }
   ```

2. **权限检查**：
   ```java
   // 正确示例
   @PreAuthorize("hasRole('ADMIN') or @userService.isOwner(#id, authentication)")
   public void deleteUser(Long id) { ... }
   
   // 错误示例 - 仅检查登录，不检查权限
   @PreAuthorize("isAuthenticated()")
   public void deleteUser(Long id) { ... }
   ```

3. **归属验证**（针对资源操作）：
   ```java
   // 正确示例 - 验证当前用户是否有权操作该资源
   public void updateOrder(Long orderId, OrderDTO dto) {
       Order order = orderRepository.findById(orderId);
       if (!order.getUserId().equals(getCurrentUserId())) {
           throw new AccessDeniedException();
       }
       // ...
   }
   
   // 错误示例 - 不验证归属
   public void updateOrder(Long orderId, OrderDTO dto) {
       Order order = orderRepository.findById(orderId);
       // 直接更新，不检查是否是当前用户的订单
       orderRepository.save(order);
   }
   ```

**D9 业务逻辑验证**：

1. **CRUD 权限一致性**：
   - 检查同一资源的 Create/Read/Update/Delete 权限是否一致
   - 示例：可以 Read 但不能 Update 的资源，是否有合理的业务解释？

2. **流程完整性**：
   - 检查多步骤流程是否可跳过
   - 检查状态机转换是否合法
   - 示例：支付流程是否可以直接跳转到支付成功？

3. **并发安全**：
   - 检查共享资源的并发访问
   - 检查竞态条件（Race Condition）
   - 示例：库存扣减是否有并发保护？

4. **Mass Assignment**：
   - 检查是否允许批量更新敏感字段
   - 示例：用户更新接口是否允许修改 role/isAdmin 字段？

#### Step 4: 计算端点审计率

```
端点审计率 = 已审计端点数 / 总端点数
```

**覆盖标准**：
- Deep 模式：端点审计率 ≥ 50%
- Standard 模式：端点审计率 ≥ 30%

**特别注意**：
- 仅靠 Sink-driven 搜索 D3/D9 不算覆盖
- 必须系统枚举端点并验证安全控制
- 至少 3 种资源类型执行了 CRUD 权限一致性对比

### 输出要求

每个 Control-driven 漏洞必须包含：
1. **端点信息**：URL、HTTP 方法、资源类型、操作类型
2. **缺失的控制**：认证/权限/归属验证缺失
3. **利用场景**：如何绕过安全控制
4. **影响评估**：成功利用后的影响范围

---

## Phase 2.3 Config-driven 审计方法 (D2, D7, D8, D10)

### 核心逻辑

Config-driven 审计的核心是**搜索配置文件，对比安全基线**。适用于与配置相关的漏洞类型：
- D2 认证：Token 配置、Session 配置、密码策略
- D7 加密：密钥管理、算法选择、KDF 配置
- D8 配置：调试接口、CORS、错误处理
- D10 供应链：依赖版本、CVE 检查

### 执行步骤

#### Step 1: 识别配置文件

**常见配置文件位置**：
```
Spring: application.properties, application.yml
Django: settings.py
Express: config.js, .env
Laravel: config/, .env
通用: .env, config.json, *.conf
```

#### Step 2: 定义安全基线

**D2 认证基线**：
```yaml
Token:
  expiration: "<= 3600s"  # Token 过期时间不超过 1 小时
  refreshable: true       # 支持刷新
  algorithm: "HS256"      # 安全的签名算法
  
Session:
  timeout: "<= 1800s"     # Session 超时时间不超过 30 分钟
  secure_cookie: true     # Cookie 设置 Secure 标志
  http_only: true         # Cookie 设置 HttpOnly 标志
  same_site: "Strict"     # Cookie 设置 SameSite 属性
  
Password:
  min_length: 8
  complexity: "uppercase + lowercase + digit + special"
  hashing: "bcrypt/scrypt/Argon2"
  salt: "random per user"
```

**D7 加密基线**：
```yaml
KeyManagement:
  storage: "KMS/HSM"      # 密钥存储在 KMS 或 HSM
  rotation: "90days"      # 密钥定期轮换
  hardcoded: false        # 禁止硬编码密钥
  
Algorithm:
  symmetric: "AES-256-GCM"  # 对称加密
  asymmetric: "RSA-2048+ / ECC-P256+"  # 非对称加密
  hash: "SHA-256+"          # 哈希算法
  deprecated: ["MD5", "SHA1", "DES", "3DES", "RC4"]  # 禁用算法
  
KDF:
  algorithm: "PBKDF2 / scrypt / Argon2"
  iterations: ">= 10000"  # PBKDF2 迭代次数
```

**D8 配置基线**：
```yaml
Debug:
  production: false       # 生产环境关闭调试
  stack_trace: false      # 不暴露堆栈信息
  
CORS:
  origin: "specific"      # 明确指定允许的 Origin
  credentials: "careful"  # 谨慎处理凭据
  
ErrorHandling:
  detail: "generic"       # 错误信息泛化
  logging: "secure"       # 安全日志记录
```

**D10 供应链基线**：
```yaml
Dependencies:
  scan_frequency: "daily" # 每日扫描依赖
  auto_update: "security" # 自动更新安全补丁
  
Vulnerabilities:
  severity: ["Critical", "High"]  # 关注高危漏洞
  exploit_available: true         # 特别关注有利用代码的漏洞
```

#### Step 3: 对比安全基线

对于每个配置项，检查是否符合安全基线：

**示例 - D7 加密检查**：
```java
// 配置文件
encryption.key=hardcoded_key_12345  // ❌ 硬编码密钥
encryption.algorithm=AES/ECB/PKCS5Padding  // ❌ 使用 ECB 模式

// 对比基线
encryption.key: FAIL (硬编码)
encryption.algorithm: FAIL (ECB 模式不安全)
```

**示例 - D8 配置检查**：
```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: "*"  // ❌ 暴露所有 Actuator 端点

cors:
  allowed-origins: "*"  // ❌ 允许所有 Origin
```

#### Step 4: 验证配置有效性

某些配置需要在运行时验证：

**D2 Token 验证**：
```bash
# 检查 Token 是否可伪造
curl -H "Authorization: Bearer fake_token" http://target/api/user

# 检查 Token 过期是否有效
curl -H "Authorization: Bearer expired_token" http://target/api/user
```

**D8 调试接口验证**：
```bash
# 检查 Actuator 是否暴露
curl http://target/actuator/env
curl http://target/actuator/heapdump
```

### 输出要求

每个 Config-driven 漏洞必须包含：
1. **配置项**：具体的配置参数和位置
2. **当前值**：不安全的配置值
3. **安全基线**：推荐的安全配置
4. **风险说明**：为什么当前配置不安全
5. **修复建议**：如何修改配置

---

## Phase 2.4 多 Agent 协作机制

### Agent 分配策略

根据项目规模和复杂度，动态分配 Agent：

**小型项目（< 100 个文件）**：
- 1 个 Agent：Sink-driven (D1, D4, D5, D6)
- 1 个 Agent：Control-driven (D3, D9) + Config-driven (D2, D7, D8, D10)

**中型项目（100-500 个文件）**：
- 1 个 Agent：D1 注入
- 1 个 Agent：D4, D5, D6
- 1 个 Agent：D3, D9
- 1 个 Agent：D2, D7, D8, D10

**大型项目（> 500 个文件）**：
- Agent 1: D1 注入
- Agent 2: D4 反序列化
- Agent 3: D5 文件操作
- Agent 4: D6 SSRF
- Agent 5: D3 授权
- Agent 6: D9 业务逻辑
- Agent 7: D2 认证 + D7 加密
- Agent 8: D8 配置 + D10 供应链

### Agent 间信息共享

**共享数据**：
```yaml
common:
  entry_points: []      # 所有入口点
  authentication_chain: []  # 认证链
  sink_points: []       # 已发现的 Sink 点
  data_flows: []        # 已追踪的数据流
```

**避免重复**：
- 每个 Agent 负责不同的维度
- 发现重叠时，由协调 Agent 决定去重

---

## Phase 2.5 Control-driven 专项：D3 授权审计

### 授权模型识别

**RBAC（基于角色的访问控制）**：
```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) { }
```

**ABAC（基于属性的访问控制）**：
```java
@PreAuthorize("@userService.isOwner(#id, authentication)")
public void updateUser(Long id, UserDTO dto) { }
```

**ACL（访问控制列表）**：
```java
public void accessResource(Long resourceId) {
    if (!aclService.hasPermission(getCurrentUser(), resourceId, Permission.READ)) {
        throw new AccessDeniedException();
    }
}
```

### 审计检查点

**检查点 1：认证检查覆盖**
- 所有敏感端点是否都有认证要求
- 认证绕过是否可能

**检查点 2：权限粒度**
- 权限控制是否足够细粒度
- 是否存在过度授权

**检查点 3：归属验证**
- 资源操作是否验证归属关系
- 是否存在 IDOR 漏洞

**检查点 4：权限一致性**
- 同一资源的 CRUD 权限是否一致
- 权限变更是否同步

---

## Phase 2.6 Control-driven 专项：D9 业务逻辑审计

### 业务场景识别

**支付场景**：
- 金额篡改
- 重复支付
- 支付状态绕过

**订单场景**：
- 价格计算错误
- 库存超卖
- 状态机绕过

**用户场景**：
- 批量注册
- 信息泄露
- 权限提升

### 审计检查点

**检查点 1：输入验证**
- 所有业务输入是否都经过验证
- 验证逻辑是否完整

**检查点 2：流程完整性**
- 多步骤流程是否可跳过
- 状态转换是否合法

**检查点 3：并发安全**
- 共享资源是否有并发保护
- 是否存在竞态条件

**检查点 4：数据一致性**
- 关联数据是否一致
- 事务处理是否正确

---

## 质量检查清单

### 审计前检查

- [ ] 已阅读对应轨道的审计方法
- [ ] 已识别项目技术栈
- [ ] 已确定审计范围

### 审计中检查

- [ ] 按轨道方法执行审计
- [ ] 记录所有发现的 Sink/端点/配置
- [ ] 追踪完整的数据流

### 审计后检查

- [ ] 计算覆盖率（Sink 扇出率 / 端点审计率）
- [ ] 对照 coverage-matrix.md 验证覆盖
- [ ] 补充未覆盖的维度

---

**记住**：
- Sink-driven：从危险函数反向追踪
- Control-driven：枚举端点验证控制
- Config-driven：对比配置与安全基线
