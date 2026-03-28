# 安全工具配置和使用方法

基于SKILL.md五阶段审计协议的安全工具配置和使用方法

## 1. 静态分析工具

### 1.1 SonarQube
**功能**：代码质量和安全扫描
**支持语言**：Java, Python, JavaScript, Go, PHP, C/C++
**配置示例**：
```yaml
# sonar-project.properties
sonar.projectKey=my-project
sonar.projectName=My Project
sonar.sources=src
sonar.language=java
sonar.java.binaries=target/classes
sonar.java.coveragePlugin=jacoco
sonar.java.jacoco.reportPath=target/jacoco.exec
```
**使用示例**：
```bash
# 扫描代码
sonar-scanner \
  -Dsonar.projectKey=my-project \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=admin \
  -Dsonar.password=admin
```

### 1.2 Fortify
**功能**：企业级静态代码分析
**支持语言**：Java, .NET, C/C++, PHP, Python
**配置示例**：
```bash
# Fortify扫描配置
sourceanalyzer -b my-project \
  -scan -f results \
  -Xmx4G \
  -Dcom.fortify.sca.ProjectId=my-project
```
**使用示例**：
```bash
# 执行扫描
sourceanalyzer -b my-project -scan -f results
# 生成报告
ReportGenerator -source results -format pdf -o report.pdf
```

### 1.3 Checkmarx
**功能**：SAST工具
**支持语言**：Java, .NET, C/C++, PHP, Python, JavaScript
**使用示例**：
```bash
# 启动扫描
CxConsoleCLI run \
  -project "My Project" \
  -src "/path/to/src" \
  -preset "High and Medium"
```

### 1.4 Bandit (Python)
**功能**：Python代码安全扫描
**安装**：
```bash
pip install bandit
```
**使用示例**：
```bash
# 基本扫描
bandit -r src/
# 详细报告
bandit -r src/ -f json -o report.json
# 排除测试文件
bandit -r src/ --exclude '*/tests/*'
```

### 1.5 FindSecBugs (Java)
**功能**：Java代码安全扫描
**安装**：
```bash
# Maven插件
<plugin>
  <groupId>com.h3xstream.findsecbugs</groupId>
  <artifactId>findsecbugs-plugin</artifactId>
  <version>1.12.0</version>
</plugin>
```
**使用示例**：
```bash
# Maven扫描
mvn com.h3xstream.findsecbugs:findsecbugs
# Gradle扫描
gradle findbugs
```

### 1.6 Gosec (Go)
**功能**：Go代码安全扫描
**安装**：
```bash
brew install gosec
```
**使用示例**：
```bash
# 扫描代码
gosec ./...
# 生成JSON报告
gosec -fmt json -o report.json ./...
```

### 1.7 ESLint (JavaScript)
**功能**：JavaScript代码质量和安全检查
**配置示例**：
```json
{
  "extends": ["eslint:recommended", "plugin:security/recommended"],
  "plugins": ["security"],
  "rules": {
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error"
  }
}
```
**使用示例**：
```bash
# 扫描代码
eslint src/
# 生成JSON报告
eslint src/ -f json -o report.json
```

## 2. 依赖扫描工具

### 2.1 OWASP Dependency-Check
**功能**：依赖项漏洞扫描
**Maven配置**：
```xml
<plugin>
  <groupId>org.owasp</groupId>
  <artifactId>dependency-check-maven</artifactId>
  <version>7.4.0</version>
  <executions>
    <execution>
      <goals>
        <goal>check</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```
**使用示例**：
```bash
# 命令行扫描
dependency-check --project . --out .
# 生成HTML报告
dependency-check --project . --out . --format HTML
```

### 2.2 Snyk
**功能**：第三方库安全扫描
**安装**：
```bash
npm install -g snyk
```
**使用示例**：
```bash
# 授权
snyk auth
# 扫描
snyk test
# 监控
snyk monitor
```

### 2.3 WhiteSource
**功能**：软件组成分析
**使用示例**：
```bash
# 扫描
whitesource scan --path .
# 持续监控
whitesource monitor --path .
```

### 2.4 NPM Audit (Node.js)
**使用示例**：
```bash
# 基本扫描
npm audit
# 自动修复
npm audit fix
# 严重漏洞
npm audit --audit-level=severe
```

### 2.5 Pip-audit (Python)
**安装**：
```bash
pip install pip-audit
```
**使用示例**：
```bash
# 扫描
pip-audit
# 检查特定包
pip-audit package-name
```

### 2.6 Safety (Python)
**安装**：
```bash
pip install safety
```
**使用示例**：
```bash
# 扫描依赖
safety check
# 生成JSON报告
safety check --json --output report.json
```

## 3. 动态分析工具

### 3.1 OWASP ZAP
**功能**：Web应用渗透测试
**使用示例**：
```bash
# 启动ZAP
zap.sh
# 自动化扫描
zap-cli quick-scan --self-contained --start-options "-config api.disablekey=true" http://example.com
# API扫描
zap-cli api-scan -t http://example.com/api -f report.html
```

### 3.2 Burp Suite
**功能**：Web应用安全测试
**使用示例**：
```bash
# 启动Burp Suite
java -jar burpsuite.jar
# 命令行扫描
burpsuite --headless --project=my-project
```

### 3.3 SQLmap
**功能**：SQL注入测试
**使用示例**：
```bash
# 基本扫描
sqlmap -u "http://example.com/page.php?id=1"
# 深度扫描
sqlmap -u "http://example.com/page.php?id=1" --dbs
# POST请求
sqlmap -u "http://example.com/login" --data="username=admin&password=admin"
```

### 3.4 Nikto
**功能**：Web服务器扫描
**使用示例**：
```bash
# 基本扫描
nikto -h example.com
# 详细扫描
nikto -h example.com -Display V
# 指定端口
nikto -h example.com -p 8080
```

### 3.5 Nmap
**功能**：网络扫描
**使用示例**：
```bash
# 基本扫描
nmap -sV example.com
# 全面扫描
nmap -A -T4 example.com
# 端口扫描
nmap -p 80,443,8080 example.com
```

## 4. 配置扫描工具

### 4.1 Trufflehog
**功能**：秘密信息扫描
**安装**：
```bash
brew install trufflehog
```
**使用示例**：
```bash
# 扫描Git仓库
trufflehog git https://github.com/example/repo
# 扫描目录
trufflehog filesystem /path/to/directory
```

### 4.2 GitLeaks
**功能**：源代码中的秘密检测
**安装**：
```bash
brew install gitleaks
```
**使用示例**：
```bash
# 扫描仓库
gitleaks --repo-url=https://github.com/example/repo
# 扫描本地目录
gitleaks --source=/path/to/repo
```

### 4.3 YARA
**功能**：恶意代码和模式检测
**使用示例**：
```bash
# 扫描文件
yara -r rules.yara /path/to/file
# 扫描目录
yara -r rules.yara /path/to/directory
```

### 4.4 OSQuery
**功能**：系统配置和状态监控
**使用示例**：
```bash
# 查询系统信息
osqueryi "SELECT * FROM users;"
# 查询进程
osqueryi "SELECT * FROM processes;"
# 查询网络连接
osqueryi "SELECT * FROM listening_ports;"
```

## 5. 容器安全工具

### 5.1 Trivy
**功能**：容器镜像和文件系统扫描
**安装**：
```bash
brew install trivy
```
**使用示例**：
```bash
# 扫描镜像
trivy image nginx:latest
# 扫描目录
trivy fs .
# 扫描Git仓库
trivy repo https://github.com/example/repo
# 扫描运行中容器
trivy image --format json nginx:latest
```

### 5.2 Docker Bench for Security
**使用示例**：
```bash
docker run -it --net host --pid host --userns host --cap-add audit_control \
-v /var/lib:/var/lib \
-v /var/run/docker.sock:/var/run/docker.sock \
-v /etc:/etc --label docker_bench_security \
docker/docker-bench-security
```

### 5.3 Clair
**功能**：容器静态分析
**使用示例**：
```bash
# 扫描镜像
clairctl analyze nginx:latest
# 扫描本地镜像
clairctl analyze --local nginx:latest
```

### 5.4 Falco
**功能**：容器运行时安全监控
**安装**：
```bash
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update
helm install falco falcosecurity/falco
```
**使用示例**：
```bash
# 查看事件
falcoctl event
# 导出事件
falcoctl event --output json
```

## 6. 云原生安全工具

### 6.1 Kube-bench
**使用示例**：
```bash
# 运行检查
docker run --rm -v /var/lib:/var/lib -v /etc:/etc aquasec/kube-bench
# 指定命名空间
kube-bench --namespace default
```

### 6.2 Kubescape
**安装**：
```bash
curl -s https://raw.githubusercontent.com/kubescape/kubescape/master/install.sh | /bin/bash
```
**使用示例**：
```bash
# 扫描集群
kubescape scan framework nsa
# 扫描特定资源
kubescape scan workload --namespace default
```

### 6.3 TFSec (Terraform)
**安装**：
```bash
brew install tfsec
```
**使用示例**：
```bash
# 扫描
tfsec .
# 生成JSON报告
tfsec . --format json --out report.json
# 指定工作目录
tfsec --tfvars-file terraform.tfvars .
```

### 6.4 Checkov
**功能**：基础设施即代码安全扫描
**安装**：
```bash
pip install checkov
```
**使用示例**：
```bash
# 扫描所有配置
checkov -d .
# 扫描Terraform
checkov -f terraform .
# 扫描Kubernetes
checkov -f kubernetes .
```

## 7. CI/CD安全工具

### 7.1 GitHub Actions
**配置示例**：
```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on: [push, pull_request]
jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Bandit
        run: pip install bandit && bandit -r src/
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
```

### 7.2 GitLab CI
**配置示例**：
```yaml
# .gitlab-ci.yml
stages:
  - security
security_scan:
  stage: security
  image: python:3.8
  script:
    - pip install bandit
    - bandit -r src/
  artifacts:
    reports:
      report.json
```

### 7.3 Jenkins
**配置示例**：
```groovy
// Jenkinsfile
pipeline {
    agent any
    stages {
        stage('Security Scan') {
            steps {
                sh 'pip install bandit && bandit -r src/'
                archiveArtifacts artifacts: 'report.json', fingerprint: 'report.json'
            }
        }
    }
}
```

## 8. 自动化测试集成方案

### 8.1 本地开发环境集成
- 配置pre-commit钩子，在提交代码前执行安全扫描
- 使用IDE插件实时检测安全问题
- 集成到代码编辑器中

### 8.2 CI/CD流程集成
- **GitHub Actions**：配置安全扫描工作流
- **GitLab CI**：配置安全扫描流水线
- **Jenkins**：配置安全扫描任务
- **CircleCI**：配置安全扫描流程
- **Travis CI**：配置安全扫描任务

### 8.3 安全监控集成
- 部署运行时安全监控工具
- 配置安全事件告警
- 建立安全事件响应机制

### 8.4 自动化测试报告
- 生成统一的安全测试报告
- 建立漏洞跟踪系统
- 定期安全状态评估

## 9. 工具集成最佳实践

### 9.1 集成策略
- **左移安全**：将安全扫描集成到开发早期
- **分层扫描**：结合多种工具进行全面扫描
- **自动化触发**：通过CI/CD管道自动触发
- **结果聚合**：集中管理和分析扫描结果

### 9.2 性能优化
- **增量扫描**：只扫描变更的文件
- **并行执行**：同时运行多个扫描工具
- **缓存机制**：缓存扫描结果，避免重复工作
- **优先级调度**：优先扫描高风险区域

### 9.3 结果管理
- **漏洞分类**：按类型、严重程度分类
- **误报处理**：建立误报过滤机制
- **趋势分析**：跟踪安全状况的变化趋势
- **知识库更新**：将新发现的漏洞模式加入知识库

## 10. 工具选择指南

### 10.1 根据项目类型选择
- **Web应用**：OWASP ZAP, Burp Suite, Nikto, SQLmap
- **API服务**：Postman, OWASP ZAP API扫描
- **移动应用**：MobSF, Drozer
- **桌面应用**：Fortify, Checkmarx

### 10.2 根据技术栈选择
- **Java项目**：SonarQube, FindSecBugs, SpotBugs
- **Python项目**：Bandit, Safety, PyLint
- **JavaScript项目**：ESLint, npm audit, Snyk
- **Go项目**：Gosec, Staticcheck
- **PHP项目**：RIPS, Psalm, PHPStan

### 10.3 根据审计阶段选择
- **Phase 1**：依赖扫描工具（Snyk, OWASP Dependency-Check）
- **Phase 2**：静态分析工具（SonarQube, Bandit）
- **Phase 3**：数据流分析工具（自定义脚本）
- **Phase 4**：动态测试工具（OWASP ZAP, Burp Suite）
- **Phase 5**：报告生成工具（自定义脚本）