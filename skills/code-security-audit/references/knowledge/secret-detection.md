# 敏感信息检测知识

## 一、敏感信息检测的核心思想

敏感信息检测是Phase 2的核心任务，目的是识别代码中硬编码的凭证和敏感信息。

## 二、敏感信息类型

### 2.1 密码

**检测模式**

**Java**
```java
private static final String PASSWORD = "admin123";
private static final String DB_PASSWORD = "password123";
```

**Python**
```python
PASSWORD = "admin123"
DB_PASSWORD = "password123"
```

**JavaScript**
```javascript
const PASSWORD = "admin123";
const DB_PASSWORD = "password123";
```

**风险**：攻击者可以直接使用这些密码访问系统

### 2.2 API密钥

**检测模式**

**Java**
```java
private static final String API_KEY = "sk-1234567890";
private static final String SECRET_KEY = "secret123";
```

**Python**
```python
API_KEY = "sk-1234567890"
SECRET_KEY = "secret123"
```

**JavaScript**
```javascript
const API_KEY = "sk-1234567890";
const SECRET_KEY = "secret123";
```

**风险**：攻击者可以直接使用这些密钥访问API

### 2.3 Token

**检测模式**

**Java**
```java
private static final String TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
```

**Python**
```python
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
```

**JavaScript**
```javascript
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
```

**风险**：攻击者可以直接使用这些Token访问系统

### 2.4 数据库凭证

**检测模式**

**MySQL**
```java
private static final String DB_URL = "jdbc:mysql://user:password@localhost:3306/db";
```

**PostgreSQL**
```java
private static final String DB_URL = "jdbc:postgresql://user:password@localhost:5432/db";
```

**MongoDB**
```java
private static final String DB_URL = "mongodb://user:password@localhost:27017/db";
```

**风险**：攻击者可以直接访问数据库

### 2.5 AWS凭证

**检测模式**

**Access Key**
```java
private static final String AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
private static final String AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
```

**Session Token**
```java
private static final String AWS_SESSION_TOKEN = "FwoGZXIvYXdzEB1Yd0tBkFwTmBmCQEXAMPLE";
```

**风险**：攻击者可以直接访问AWS资源

### 2.6 其他敏感信息

**检测模式**

**用户名**
```java
private static final String USERNAME = "admin";
private static final String ADMIN_USER = "root";
```

**私钥**
```java
private static final String PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----";
```

**OAuth凭证**
```java
private static final String OAUTH_CLIENT_ID = "1234567890";
private static final String OAUTH_CLIENT_SECRET = "abcdefghij";
```

## 三、检测方法

### 3.1 静态分析

**方法**：通过代码静态分析，识别硬编码的敏感信息

**步骤**
1. 扫描代码文件
2. 匹配敏感信息模式
3. 记录发现的位置和内容
4. 评估风险等级

### 3.2 模式匹配

**方法**：使用正则表达式匹配敏感信息模式

**常见模式**
- `password\s*=\s*["\']([^"\']{8,})["\']`
- `api[_-]?key\s*=\s*["\']([^"\']{8,})["\']`
- `token\s*=\s*["\']([^"\']{8,})["\']`
- `jdbc:[^"\']+:[^"\']+@`
- `mongodb://[^"\']+:[^"\']+@`

### 3.3 上下文分析

**方法**：分析敏感信息的上下文，判断是否真的敏感

**考虑因素**
- 是否在测试代码中
- 是否在注释中
- 是否在示例代码中
- 是否在配置文件中

### 3.4 误报过滤

**方法**：过滤误报，提高准确性

**过滤规则**
- 排除测试代码中的敏感信息
- 排除注释中的敏感信息
- 排除示例代码中的敏感信息
- 排除环境变量引用

## 四、风险等级评估

### 4.1 高风险

**标准**：生产代码中的硬编码凭证

**示例**
- 数据库密码
- API密钥
- AWS凭证
- 私钥

### 4.2 中风险

**标准**：配置文件中的敏感信息

**示例**
- 配置文件中的密码
- 配置文件中的密钥
- 配置文件中的Token

### 4.3 低风险

**标准**：测试代码或示例代码中的敏感信息

**示例**
- 测试代码中的密码
- 示例代码中的密钥
- 注释中的敏感信息

## 五、修复建议

### 5.1 使用环境变量

**修复前**
```java
private static final String DB_PASSWORD = "password123";
```

**修复后**
```java
private static final String DB_PASSWORD = System.getenv("DB_PASSWORD");
```

### 5.2 使用密钥管理系统

**修复前**
```java
private static final String API_KEY = "sk-1234567890";
```

**修复后**
```java
private static final String API_KEY = getApiKeyFromKMS();
```

### 5.3 使用配置文件

**修复前**
```java
private static final String DB_PASSWORD = "password123";
```

**修复后**
```java
private static final String DB_PASSWORD = loadPasswordFromConfig();
```

### 5.4 使用加密存储

**修复前**
```java
private static final String DB_PASSWORD = "password123";
```

**修复后**
```java
private static final String DB_PASSWORD = decrypt(encryptedPassword);
```

## 六、最佳实践

### 6.1 敏感信息管理

- 不在代码中硬编码敏感信息
- 使用环境变量或密钥管理系统
- 使用配置文件存储敏感信息
- 定期轮换敏感信息
- 限制敏感信息的访问权限

### 6.2 开发流程

- 在CI/CD流程中检查敏感信息
- 在代码合并前扫描敏感信息
- 在部署前验证敏感信息配置
- 建立敏感信息泄露告警机制

### 6.3 安全培训

- 培训开发人员敏感信息管理
- 建立敏感信息管理规范
- 定期进行敏感信息审计
- 建立敏感信息泄露应急响应流程