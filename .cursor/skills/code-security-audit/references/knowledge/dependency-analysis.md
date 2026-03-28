# 依赖分析知识

## 一、依赖分析的核心思想

依赖分析是Phase 1/2的核心任务，目的是识别项目使用的第三方库及其已知漏洞。

## 二、包管理器识别

### 2.1 常见包管理器

**Node.js**
- package.json - npm包管理器
- package-lock.json - npm锁文件
- yarn.lock - yarn锁文件
- pnpm-lock.yaml - pnpm锁文件

**Python**
- requirements.txt - pip包管理器
- Pipfile - pip包管理器
- poetry.lock - poetry锁文件
- pyproject.toml - poetry配置文件
- setup.py - setuptools包管理器

**Java**
- pom.xml - Maven包管理器
- build.gradle - Gradle包管理器
- build.gradle.kts - Gradle Kotlin DSL

**PHP**
- composer.json - Composer包管理器
- composer.lock - Composer锁文件

**Ruby**
- Gemfile - Bundler包管理器
- Gemfile.lock - Bundler锁文件

**Go**
- go.mod - Go模块
- go.sum - Go校验和

**Rust**
- Cargo.toml - Cargo包管理器
- Cargo.lock - Cargo锁文件

### 2.2 识别方法

通过扫描项目目录，查找上述包管理器文件，确定项目使用的包管理器类型。

## 三、依赖项分析

### 3.1 分析方法

**解析依赖文件**
- 读取包管理器文件
- 解析依赖项列表
- 提取包名和版本信息

**分类依赖项**
- 生产依赖
- 开发依赖
- 可选依赖

### 3.2 依赖项信息

对于每个依赖项，记录以下信息：
- 包名
- 版本号
- 依赖类型（生产/开发）
- 包管理器类型

## 四、漏洞扫描

### 4.1 已知漏洞数据库

依赖项的已知漏洞信息来源于：
- NVD (National Vulnerability Database)
- GitHub Advisory Database
- npm audit数据库
- pip audit数据库
- Snyk漏洞数据库

### 4.2 漏洞扫描方法

**自动化扫描**
- npm audit - 扫描npm依赖
- pip audit - 扫描pip依赖
- npm audit - 扫描npm依赖
- pip-audit - 扫描pip依赖

**手动查询**
- 查询NVD数据库
- 查询GitHub Advisory Database
- 查询Snyk漏洞数据库

### 4.3 漏洞信息

对于每个发现的漏洞，记录以下信息：
- 漏洞ID (CVE编号)
- 受影响的包名
- 受影响的版本范围
- 漏洞描述
- 严重程度 (CVSS评分)
- 修复版本
- 修复建议

## 五、缺失lock文件检查

### 5.1 lock文件的重要性

lock文件记录了依赖项的确切版本，确保不同环境使用相同的依赖项版本，避免依赖项冲突和版本不一致。

### 5.2 检查方法

对比包管理器文件和对应的lock文件：
- 有package.json但没有package-lock.json
- 有requirements.txt但没有poetry.lock
- 有pom.xml但没有对应的lock文件

### 5.3 风险评估

缺失lock文件可能导致：
- 依赖项版本不一致
- 环境间依赖项差异
- 安全漏洞扫描不准确

## 六、分析报告

### 6.1 报告内容

依赖分析报告应包含：
- 使用的包管理器类型
- 依赖项列表
- 已知漏洞列表
- 缺失lock文件列表
- 风险评估

### 6.2 报告格式

建议使用JSON格式，便于后续处理：
```json
{
  "scan_date": "2024-01-01T00:00:00Z",
  "target_directory": "/path/to/project",
  "package_managers": ["npm", "pip"],
  "dependencies": [
    {
      "manager": "npm",
      "name": "express",
      "version": "4.18.2",
      "type": "production"
    }
  ],
  "vulnerabilities": [
    {
      "manager": "npm",
      "vulnerability_id": "CVE-2023-12345",
      "package": "express",
      "severity": "high",
      "title": "Express vulnerability",
      "url": "https://nvd.nist.gov/vuln/detail/CVE-2023-12345"
    }
  ],
  "missing_lock_files": [
    {
      "manager": "npm",
      "lock_file": "package-lock.json"
    }
  ],
  "summary": {
    "total_dependencies": 100,
    "total_vulnerabilities": 5,
    "missing_lock_files": 1
  }
}
```

## 七、最佳实践

### 7.1 依赖管理

- 定期更新依赖项到最新稳定版本
- 使用lock文件确保依赖项版本一致性
- 定期扫描依赖项的已知漏洞
- 及时修复发现的漏洞

### 7.2 安全配置

- 使用最小权限原则配置依赖项
- 避免使用过时的依赖项
- 定期审查依赖项的使用情况
- 移除不再使用的依赖项

### 7.3 开发流程

- 在CI/CD流程中集成依赖项扫描
- 在代码合并前检查依赖项漏洞
- 在部署前验证依赖项安全性
- 建立依赖项更新和修复流程