# 架构图模板

基于SKILL.md Mermaid建模规范的架构图模板

## 1. 业务流程图模板

### 1.1 基本业务流程图
```mermaid
flowchart TD
    A[用户请求] --> B[API网关]
    B --> C{认证检查}
    C -->|已认证| D[业务服务层]
    C -->|未认证| E[认证服务]
    E --> D
    D --> F[数据访问层]
    F --> G[数据库]
    D --> H[返回响应]
    
    subgraph 安全控制点
        B
            J[输入验证]
            K[权限检查]
    end
    
    D --> J
    D --> K
```

### 1.2 复杂业务流程图
```mermaid
flowchart TD
    subgraph 客户端
        A[用户浏览器] -->|HTTP请求| B[前端应用]
    end
    
    subgraph 前端逻辑层
        B -->|用户操作| C1[登录模块]
        B -->|用户操作| C2[注册模块]
        B -->|用户操作| C3[仪表盘模块]
        B -->|用户操作| C4[数据管理模块]
    end
    
    subgraph API网关层
        C1 -->|API请求| D1[认证API]
        C2 -->|API请求| D2[数据API]
        C3 -->|API请求| D3[用户API]
    end
    
    subgraph 业务逻辑层
        D1 -->|调用认证服务| E1[认证服务]
        D2 -->|调用数据服务| E2[数据服务]
        D3 -->|调用用户服务| E3[用户服务]
    end
    
    subgraph 数据访问层
        E1 -->|查询用户数据| F1[用户数据库]
        E2 -->|查询业务数据| F2[业务数据库]
        E3 -->|查询设置数据| F3[设置数据库]
    end
    
    subgraph 存储层
        F1 -->|存储| G1[用户数据库]
        F2 -->|存储| G2[业务数据库]
        F3 -->|存储| G3[设置数据库]
    end
    
    D1 --> E1
    D2 --> E2
    D3 --> E3
    E1 --> F1
    E2 --> F2
    E3 --> F3
    F1 --> G1
    F2 --> G2
    F3 --> G3
```

## 2. 数据流图模板

### 2.1 基本数据流图
```mermaid
flowchart LR
    A[用户输入] --> B[输入验证]
    B --> C[业务处理]
    C --> D[权限检查]
    D --> E[数据存储]
    E --> F[数据查询]
    F --> G[数据返回]
    
    subgraph 安全控制点
        B[输入验证]
        D[权限检查]
    end
    
    B --> A
    D --> C
```

### 2.2 复杂数据流图
```mermaid
flowchart LR
    subgraph 输入层
        A1[HTTP请求] -->|提交代码| B1[代码仓库]
        A2[表单提交] -->|拉取代码| B1
        A3[API调用] -->|静态分析| B2[静态代码分析]
        A4[文件上传] -->|部署运行| B2[动态应用]
    end
    
    subgraph 分析层
        B1 -->|分析结果| C1[架构梳理]
        B1 -->|分析结果| C2[依赖关系分析]
        B2 -->|分析结果| C3[漏洞识别]
    end
    
    subgraph 处理层
        C1 -->|数据流分析| D1[网络流量分析]
        C2 -->|数据流分析| D2[API调用分析]
        C3 -->|数据流分析| D3[日志分析]
    end
    
    subgraph 输出层
        D1 -->|高风险漏洞| E1[环境模拟]
        D1 -->|低风险漏洞| E2[静态验证]
        D1 -->|漏洞复现| E3[渗透测试]
        D1 -->|确认漏洞| E4[风险评估]
    end
    
    C1 --> D1
    C2 --> D2
    C3 --> D3
    D1 --> E1
    D2 --> E2
    D3 --> E3
    E1 --> E4
```

## 3. 攻击路径图模板

### 3.1 基本攻击路径图
```mermaid
flowchart TD
    A[攻击者] --> B[入口点]
    B --> C[漏洞点1]
    B --> D[漏洞点2]
    B --> E[漏洞点3]
    C --> F[权限提升]
    D --> G[数据泄露]
    E --> H[系统访问]
    F --> I[数据窃取]
    G --> J[完整系统控制]
    H --> K[数据篡改]
    I --> L[系统破坏]
    
    subgraph 攻击链
        F --> G
        G --> J
    end
    
    classDef attack fill:#f99,stroke:#000,stroke-width:2px,color:#000
    classDef vuln fill:#ff9,stroke:#000,stroke-width:2px,color:#000
    classDef impact fill:#fcf,stroke:#000,stroke-width:2px,color:#000
```

### 3.2 复杂攻击路径图
```mermaid
flowchart TD
    subgraph 第一阶段攻击
        A1[攻击者] --> B1[SQL注入]
        B1 --> C1[绕过认证]
        C1 --> D1[获取管理员权限]
    end
    
    subgraph 第二阶段攻击
        D1 --> E1[文件上传漏洞]
        E1 --> F1[上传WebShell]
        F1 --> G1[执行系统命令]
    end
    
    subgraph 第三阶段攻击
        G1 --> H1[SSRF漏洞]
        H1 --> I1[访问内网服务]
        I1 --> J1[获取敏感数据]
    end
    
    subgraph 最终影响
        J1 --> K1[数据泄露]
        J1 --> L1[系统完全控制]
    end
    
    C1 --> D1
    D1 --> E1
    E1 --> F1
    F1 --> G1
    G1 --> H1
    H1 --> I1
    I1 --> J1
    J1 --> K1
    J1 --> L1
```

## 4. 架构组件关系图模板

### 4.1 微服务架构图
```mermaid
graph TD
    subgraph 客户端层
        A[Web浏览器] -->|HTTPS| B[负载均衡器]
        C[移动应用] -->|HTTPS| B
        D[桌面应用] -->|HTTPS| B
    end
    
    subgraph API网关层
        B --> E[API网关]
        E -->|路由| F[认证服务]
        E -->|路由| G[授权服务]
        E -->|路由| H[限流服务]
    end
    
    subgraph 业务服务层
        F --> I[用户服务]
        F --> J[订单服务]
        F --> K[支付服务]
        F --> L[产品服务]
    end
    
    subgraph 数据服务层
        I --> M[用户数据库]
        J --> N[订单数据库]
        K --> O[支付数据库]
        L --> P[产品数据库]
    end
    
    subgraph 外部服务层
        I --> Q[第三方认证]
        K --> R[支付网关]
        J --> S[物流服务]
    end
    
    classDef client fill:#ccf,stroke:#000,stroke-width:2px,color:#000
    classDef gateway fill:#cff,stroke:#000,stroke-width:2px,color:#000
    classDef service fill:#cfc,stroke:#000,stroke-width:2px,color:#000
    classDef database fill:#fcf,stroke:#000,stroke-width:2px,color:#000
    classDef external fill:#f9c,stroke:#000,stroke-width:2px,color:#000
```

### 4.2 分层架构图
```mermaid
graph TD
    subgraph 表现层
        A[Web前端] -->|REST API| B[API网关]
        C[移动应用] -->|REST API| B
        D[桌面应用] -->|REST API| B
    end
    
    subgraph 业务逻辑层
        B --> E[认证服务]
        B --> F[授权服务]
        B --> G[业务服务]
    end
    
    subgraph 数据访问层
        E --> H[数据访问对象]
        F --> H
        G --> H
    end
    
    subgraph 数据存储层
        H --> I[关系数据库]
        H --> J[NoSQL数据库]
        H --> K[缓存]
        H --> L[文件存储]
    end
    
    classDef presentation fill:#ccf,stroke:#000,stroke-width:2px,color:#000
    classDef business fill:#cff,stroke:#000,stroke-width:2px,color:#000
    classDef data fill:#cfc,stroke:#000,stroke-width:2px,color:#000
    classDef storage fill:#fcf,stroke:#000,stroke-width:2px,color:#000
```

## 5. 使用说明

### 5.1 节点样式
- **Source（数据输入点）**：使用蓝色填充，蓝色边框
- **Filter（安全控制点）**：使用青色填充，青色边框
- **Service（业务处理点）**：使用绿色填充，绿色边框
- **Sink（数据输出点）**：使用红色填充，红色边框
- **Risk（风险点）**：使用黄色填充，黄色边框

### 5.2 连接线样式
- **数据流**：使用实线，箭头表示数据流向
- **攻击路径**：使用虚线，箭头表示攻击路径
- **依赖关系**：使用点线，表示组件依赖

### 5.3 子图使用
- 使用 `subgraph` 关键字创建逻辑分组
- 为每个子图添加描述性标签
- 使用不同的颜色区分不同层级

### 5.4 最佳实践
1. **保持简洁**：避免过度复杂的图表
2. **使用标准符号**：使用Mermaid标准符号
3. **添加注释**：为关键节点添加注释说明
4. **颜色一致性**：在整个图表中保持颜色方案一致
5. **可读性优先**：确保图表易于理解