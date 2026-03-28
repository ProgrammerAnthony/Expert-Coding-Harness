# SQL注入检测规则

基于SKILL.md漏洞检测规则案例库的SQL注入检测规则

## 1. 检测模式

### 1.1 字符串拼接模式
```regex
# Java
SELECT\s+.*FROM.*WHERE.*=\s*["']?\s*\+
INSERT\s+INTO.*VALUES\s*\(.*["']?\s*\+
UPDATE\s+.*SET.*=.*["']?\s*\+
DELETE\s+.*FROM.*WHERE.*=.*["']?\s*\+

# Python
SELECT\s+.*FROM.*WHERE.*=\s*["']?\s*%\+
INSERT\s+INTO.*VALUES\s*\(.*["']?\s*%\+
UPDATE\s+.*SET.*=.*["']?\s*%\+
DELETE\s+.*FROM.*WHERE.*=.*["']?\s*%\+

# PHP
SELECT\s+.*FROM.*WHERE.*=\s*["']?\s*\.
INSERT\s+INTO.*VALUES\s*\(.*["']?\s*\.
UPDATE\s+.*SET.*=.*["']?\s*\.
DELETE\s+.*FROM.*WHERE.*=.*["']?\s*\.

# Go
SELECT\s+.*FROM.*WHERE.*=\s*["']?\s*\+
INSERT\s+INTO.*VALUES\s*\(.*["']?\s*\+
UPDATE\s+.*SET.*=.*["']?\s*\+
DELETE\s+.*FROM.*WHERE.*=.*["']?\s*\+
```

### 1.2 不安全API使用
```regex
# Java - 不安全JDBC使用
jdbcTemplate\.query\s*\(\s*["']?\s*\+
jdbcTemplate\.update\s*\(\s*["']?\s*\+
jdbcTemplate\.execute\s*\(\s*["']?\s*\+

# Java - 不安全ORM使用
createQuery\s*\(\s*["']?\s*\+
createNativeQuery\s*\(\s*["']?\s*\+

# Python - 不安全数据库操作
cursor\.execute\s*\(\s*["']?\s*%\+
execute\s*\(\s*["']?\s*%\+

# PHP - 不安全数据库操作
mysql_query\s*\(\s*["']?\s*\.
mysqli_query\s*\(\s*["']?\s*\.
```

### 1.3 存储过程参数注入
```regex
# Java
prepareCall\s*\(\s*["']?\s*\+
callableStatement\s*\(\s*["']?\s*\+

# Python
cursor\.callproc\s*\(\s*["']?\s*%\+
```

## 2. 高风险函数

### 2.1 Java
- `Runtime.getRuntime().exec()`
- `ProcessBuilder()`
- `jdbcTemplate.query()`
- `jdbcTemplate.update()`
- `jdbcTemplate.execute()`
- `createQuery()`
- `createNativeQuery()`

### 2.2 Python
- `cursor.execute()`
- `execute()`
- `executemany()`
- `engine.execute()`

### 2.3 PHP
- `mysql_query()`
- `mysqli_query()`
- `pg_query()`
- `sqlite_query()`

### 2.4 Go
- `db.Query()`
- `db.Exec()`
- `db.ExecContext()`

## 3. 修复建议

### 3.1 使用参数化查询
```java
// 修复前
String sql = "SELECT * FROM users WHERE id = " + userId;
List<User> users = jdbcTemplate.query(sql, new UserRowMapper());

// 修复后
String sql = "SELECT * FROM users WHERE id = ?";
List<User> users = jdbcTemplate.query(sql, new Object[]{userId}, new UserRowMapper());
```

```python
# 修复前
sql = f"SELECT * FROM users WHERE id = {user_id}"
users = db.execute(sql).fetchall()

# 修复后
sql = "SELECT * FROM users WHERE id = %s"
users = db.execute(sql, (user_id,)).fetchall()
```

### 3.2 使用ORM框架
```java
// 使用JPA
@Query("SELECT u FROM User u WHERE u.id = :userId")
List<User> findById(@Param("userId") Long userId);

// 使用MyBatis
@Select("SELECT * FROM users WHERE id = #{userId}")
List<User> findById(Long userId);
```

### 3.3 输入验证
```java
public User getUserById(Long userId) {
    if (!isValidUserId(userId)) {
        throw new IllegalArgumentException("Invalid user ID");
    }
    return userRepository.findById(userId);
}
```

### 3.4 白名单验证
```java
private static final Set<String> ALLOWED_COLUMNS = Set.of("id", "name", "email");

public List<User> searchByColumn(String column, String value) {
    if (!ALLOWED_COLUMNS.contains(column)) {
        throw new IllegalArgumentException("Invalid column name");
    }
    return userRepository.findByColumn(column, value);
}
```

## 4. 测试Payload

### 4.1 基础注入
```bash
# 联合查询注入
curl -X GET "http://example.com/api/users/1' OR '1'='1"

# 盲注
curl -X GET "http://example.com/api/users/1 AND SLEEP(5)"

# 时间盲注
curl -X GET "http://example.com/api/users/1 AND IF(SUBSTRING(database(),1,1)='a',SLEEP(5),0)"

# 布尔盲注
curl -X GET "http://example.com/api/users/1 AND IF(1=1,SLEEP(5),0)"
```

### 4.2 高级注入
```bash
# 堆叠查询注入
curl -X GET "http://example.com/api/users/1; DROP TABLE users--"

# 二次注入注入
curl -X GET "http://example.com/api/users/1' UNION SELECT username, password FROM admin_users--"

# 错误注入注入
curl -X GET "http://example.com/api/users/1' AND 1=CONVERT(int,(SELECT SUBSTRING(password,1,1) FROM admin_users LIMIT 1))--"
```

## 5. 误报处理

### 5.1 常见误报场景
- 使用参数化查询但参数来自用户输入
- 使用存储过程但参数经过严格验证
- 使用ORM框架但使用了原生SQL查询

### 5.2 误报排除规则
- 排除测试代码中的SQL语句
- 排除已修复的代码
- 排除使用了输入验证的代码