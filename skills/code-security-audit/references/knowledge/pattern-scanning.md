# 模式匹配知识

## 一、模式匹配的核心思想

模式匹配是Phase 2的核心任务，目的是基于规则库快速定位潜在的Sink点和高风险代码模式。

## 二、漏洞类型与检测模式

### 2.1 SQL注入

**检测模式**

**Java**
- 直接拼接SQL语句
```java
"SELECT * FROM users WHERE id = " + userId
"SELECT * FROM users WHERE id = '" + userId + "'"
```

- 不安全的ORM使用
```java
createQuery("SELECT u FROM User u WHERE u.id = " + userId)
createNativeQuery("SELECT * FROM users WHERE name LIKE '%" + keyword + "%'")
```

**Python**
- 直接拼接SQL语句
```python
sql = f"SELECT * FROM users WHERE id = {user_id}"
sql = "SELECT * FROM users WHERE name LIKE '%" + keyword + "%'"
```

- 不安全的ORM使用
```python
User.objects.raw("SELECT * FROM users WHERE id = %s" % user_id)
execute("SELECT * FROM users WHERE name LIKE '%%%s%%'" % keyword)
```

**PHP**
- 直接拼接SQL语句
```php
$sql = "SELECT * FROM users WHERE id = " . $userId;
$sql = "SELECT * FROM users WHERE id = '" . $userId . "'";
```

**Go**
- 直接拼接SQL语句
```go
sql := fmt.Sprintf("SELECT * FROM users WHERE id = %s", userId)
sql := "SELECT * FROM users WHERE id = '" + userId + "'"
```

### 2.2 命令注入

**检测模式**

**Java**
- Runtime.exec()直接拼接
```java
Runtime.getRuntime().exec("ping " + userInput)
Runtime.getRuntime().exec(new String[]{"bash", "-c", "echo " + userInput + "'"})
```

- ProcessBuilder直接拼接
```java
ProcessBuilder pb = new ProcessBuilder("bash -c", "echo " + userInput + "'");
```

**Python**
- os.system()直接拼接
```python
os.system("ping " + user_input)
os.system("bash -c 'echo " + user_input + "'")
```

- subprocess.run()使用shell=True
```python
subprocess.run("ping " + user_input, shell=True)
subprocess.run("bash -c 'echo " + user_input + "'", shell=True)
```

**PHP**
- exec()直接拼接
```php
exec("ping " . $userInput);
exec("bash -c 'echo " . $userInput . "'");
```

- shell_exec()直接拼接
```php
shell_exec("ping " . $userInput);
shell_exec("bash -c 'echo " . $userInput . "'");
```

### 2.3 XSS

**检测模式**

**Java**
- 用户输入直接输出到前端
```java
return "<div>Welcome, " + user.getName() + "!</div>";
response.getWriter().write(user.getName());
```

- 使用innerHTML
```java
element.innerHTML = userInput;
element.outerHTML = userInput;
```

**Python**
- 用户输入直接输出到前端
```python
return "<div>Welcome, " + user.name + "!</div>"
return render_template_string("Hello {{ user.name }}!", user=user)
```

**JavaScript**
- 用户输入直接输出到前端
```javascript
element.innerHTML = userInput;
document.write(userInput);
```

### 2.4 路径遍历

**检测模式**

**Java**
- 直接拼接文件路径
```java
File file = new File("/var/www/uploads/" + filename);
new FileInputStream("/var/www/uploads/" + filename);
```

- 缺少../过滤
```java
String path = request.getParameter("path");
File file = new File("/var/www/uploads/" + path);
```

**Python**
- 直接拼接文件路径
```python
file_path = "/var/www/uploads/" + filename
open("/var/www/uploads/" + filename)
```

- 缺少../过滤
```python
path = request.args.get('path')
file_path = "/var/www/uploads/" + path
```

### 2.5 SSRF

**检测模式**

**Java**
- URL可控
```java
URL url = new URL(request.getParameter("url"));
HttpURLConnection conn = (HttpURLConnection) url.openConnection();
```

- 缺少URL验证
```java
String targetUrl = request.getParameter("url");
HttpClient.execute(targetUrl);
```

**Python**
- URL可控
```python
url = request.args.get('url')
response = requests.get(url)
```

- 缺少URL验证
```python
target_url = request.form.get('url')
requests.post(target_url)
```

### 2.6 CSRF

**检测模式**

**Java**
- 缺少CSRF Token
```java
@PostMapping("/delete-user")
public String deleteUser(@RequestParam Long userId) {
    userService.deleteUser(userId);
    return "redirect:/users";
}
```

- Token验证不完整
```java
@PostMapping("/delete-user")
public String deleteUser(@RequestParam Long userId, @RequestParam String csrfToken) {
    if (!csrfToken.equals(session.getAttribute("csrfToken"))) {
        return "CSRF Token验证失败";
    }
    userService.deleteUser(userId);
    return "redirect:/users";
}
```

**Python**
- 缺少CSRF Token
```python
@app.route('/delete-user', methods=['POST'])
def delete_user():
    user_id = request.form.get('user_id')
    user_service.delete_user(user_id)
    return redirect('/users')
```

- Token验证不完整
```python
@app.route('/delete-user', methods=['POST'])
def delete_user():
    user_id = request.form.get('user_id')
    csrf_token = request.form.get('csrf_token')
    if not validate_csrf_token(csrf_token):
        return "CSRF Token验证失败", 403
    user_service.delete_user(user_id)
    return redirect('/users')
```

### 2.7 XXE

**检测模式**

**Java**
- DocumentBuilder使用
```java
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
DocumentBuilder builder = factory.newDocumentBuilder();
Document doc = builder.parse(new InputSource(new StringReader(xml)));
```

- XMLReader使用
```java
XMLReader reader = XMLReaderFactory.createXMLReader();
reader.parse(new InputSource(new StringReader(xml)));
```

**Python**
- xml.etree.ElementTree使用
```python
import xml.etree.ElementTree as ET
tree = ET.fromstring(xml)
```

- lxml使用
```python
from lxml import etree
tree = etree.fromstring(xml)
```

### 2.8 反序列化

**检测模式**

**Java**
- readObject()使用
```java
ObjectInputStream ois = new ObjectInputStream(new FileInputStream("data.ser"));
Object obj = ois.readObject();
```

- XMLDecoder使用
```java
XMLDecoder decoder = new XMLDecoder(new FileInputStream("data.xml"));
Object obj = decoder.readObject();
```

**Python**
- pickle.loads()使用
```python
import pickle
obj = pickle.loads(data)
```

- yaml.load()使用
```python
import yaml
obj = yaml.load(data)
```

### 2.9 SSTI

**检测模式**

**Java**
- SpEL使用
```java
@Value("#{" + userInput + "}")
public String getValue() {
    return value;
}
```

- OGNL使用
```java
@Value("${" + userInput + "}")
public String getValue() {
    return value;
}
```

**Python**
- Jinja2使用
```python
from jinja2 import Template
template = Template("Hello {{ user.name }}!")
template.render(user=user)
```

- render_template_string使用
```python
from flask import render_template_string
return render_template_string("Hello {{ user.name }}!", user=user)
```

### 2.10 RCE

**检测模式**

**Java**
- eval()使用
```java
ScriptEngineManager manager = new ScriptEngineManager();
ScriptEngine engine = manager.getEngineByName("js");
engine.eval(userInput);
```

**Python**
- eval()使用
```python
eval(user_input)
```

- exec()使用
```python
exec(user_input)
```

**PHP**
- eval()使用
```php
eval($userInput);
```

- assert()使用
```php
assert($userInput);
```

### 2.11 IDOR

**检测模式**

**Java**
- 直接使用用户输入查询
```java
@GetMapping("/users/{id}")
public User getUserById(@PathVariable Long id) {
    return userRepository.findById(id);
}
```

- 缺少权限检查
```java
@GetMapping("/users/{id}")
public User getUserById(@PathVariable Long id) {
    User currentUser = getCurrentUser();
    User targetUser = userRepository.findById(id);
    if (!currentUser.getId().equals(targetUser.getId())) {
        throw new AccessDeniedException("无权限访问");
    }
    return targetUser;
}
```

**Python**
- 直接使用用户输入查询
```python
@app.route('/users/<int:user_id>')
def get_user(user_id):
    return user_service.get_user_by_id(user_id)
```

- 缺少权限检查
```python
@app.route('/users/<int:user_id>')
def get_user(user_id):
    current_user = get_current_user()
    target_user = user_service.get_user_by_id(user_id)
    if current_user.id != target_user.id:
        return "无权限访问", 403
    return target_user
```

### 2.12 认证绕过

**检测模式**

**Java**
- 逻辑错误
```java
if (password.equals(correctPassword)) {
    return "登录成功";
}
```

- 配置错误
```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http
        .authorizeRequests()
            .antMatchers("/api/admin/**").permitAll()  // 管理接口未认证
            .anyRequest().authenticated()
        .and()
        .formLogin();
}
```

**Python**
- 逻辑错误
```python
if password == correct_password:
    return "登录成功"
```

- 配置错误
```python
@app.before_request
def before_request():
    if request.path.startswith('/api/admin/'):
        return  # 管理接口未认证
```

### 2.13 敏感数据

**检测模式**

**硬编码密码**
```java
private static final String PASSWORD = "admin123";
private static final String DB_PASSWORD = "password123";
```

**硬编码API密钥**
```java
private static final String API_KEY = "sk-1234567890";
private static final String SECRET_KEY = "secret123";
```

**数据库连接串**
```java
private static final String DB_URL = "jdbc:mysql://user:password@localhost:3306/db";
private static final String DB_URL = "postgresql://user:password@localhost:5432/db";
```

### 2.14 文件上传

**检测模式**

**缺少文件类型验证**
```java
@PostMapping("/upload")
public String uploadFile(@RequestParam MultipartFile file) {
    String filename = file.getOriginalFilename();
    File dest = new File("/var/www/uploads/" + filename);
    file.transferTo(dest);
    return "上传成功";
}
```

**缺少文件大小限制**
```java
@PostMapping("/upload")
public String uploadFile(@RequestParam MultipartFile file) {
    String filename = file.getOriginalFilename();
    File dest = new File("/var/www/uploads/" + filename);
    file.transferTo(dest);
    return "上传成功";
}
```

**缺少文件内容验证**
```java
@PostMapping("/upload")
public String uploadFile(@RequestParam MultipartFile file) {
    String filename = file.getOriginalFilename();
    File dest = new File("/var/www/uploads/" + filename);
    file.transferTo(dest);
    return "上传成功";
}
```

## 三、模式匹配方法

### 3.1 静态分析

通过静态代码分析，识别潜在的安全模式：
- 使用正则表达式匹配危险代码模式
- 使用抽象语法树分析代码结构
- 使用数据流分析追踪数据流向

### 3.2 动态分析

通过动态运行时分析，识别实际的安全问题：
- 使用污点分析追踪数据流向
- 使用符号执行分析代码行为
- 使用模糊测试发现隐藏漏洞

### 3.3 混合分析

结合静态和动态分析，提高检测准确性：
- 先用静态分析快速定位问题
- 再用动态分析验证问题真实性
- 最后用人工审计确认问题细节

## 四、优先级决策

### 4.1 高优先级模式

以下模式应优先审计：
- 认证绕过
- SQL注入
- 命令注入
- 文件上传漏洞
- 路径遍历

### 4.2 中优先级模式

以下模式应次优先审计：
- XSS
- SSRF
- CSRF
- XXE
- 反序列化

### 4.3 低优先级模式

以下模式可以后优先审计：
- SSTI
- RCE
- IDOR
- 敏感数据泄露

## 五、误报处理

### 5.1 常见误报场景

- 使用参数化查询但参数来自用户输入
- 使用存储过程但参数经过严格验证
- 使用ORM框架但使用了原生SQL查询

### 5.2 误报排除规则

- 排除测试代码中的安全模式
- 排除已修复的代码
- 排除使用了输入验证的代码
- 排除使用了白名单验证的代码

## 六、最佳实践

### 6.1 模式匹配原则

- 全面覆盖：确保覆盖所有常见的漏洞模式
- 准确性优先：优先减少误报
- 效率优先：使用自动化工具提高效率
- 可扩展性：支持自定义规则和模式

### 6.2 持续改进

- 定期更新检测模式
- 收集误报案例优化规则
- 学习新的漏洞模式
- 分享最佳实践