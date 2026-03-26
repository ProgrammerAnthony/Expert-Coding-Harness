---
name: mcp-server-patterns
description: Model Context Protocol (MCP) 服务器开发最佳实践，包含服务端设计、工具注册、上下文管理、安全控制与跨平台适配。
origin: 迁移自Everything Claude Code，适配国内企业AI开发场景
---

# MCP 服务器开发最佳实践

Model Context Protocol (MCP) 是AI Agent与外部工具、数据源交互的标准协议，本技能涵盖生产级MCP服务器的设计、开发与部署全流程规范。

## When to Activate
- 开发自定义AI Agent工具服务
- 对接企业内部系统到AI编码助手
- 构建跨平台共享的工具生态
- 实现安全可控的AI能力开放
- 优化大模型与外部系统的交互效率

## MCP 核心概念
### 协议分层
```
┌─────────────────┐
│   应用层        │  工具实现、业务逻辑
├─────────────────┤
│   协议层        │  MCP标准消息格式、序列化
├─────────────────┤
│   传输层        │  HTTP/WebSocket/gRPC
└─────────────────┘
```

### 核心组件
1. **Tool Registry**：工具元数据注册与管理
2. **Context Manager**：会话上下文持久化与管理
3. **Authorization Layer**：权限校验与访问控制
4. **Execution Engine**：工具执行与结果返回
5. **Audit Logger**：全链路审计日志

## 服务端设计模式
### 1. 轻量级HTTP服务器（推荐）
适合低并发、内部使用场景：
```typescript
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk';

const app = express();
app.use(express.json());

const mcpServer = new McpServer({
  name: 'internal-tools',
  version: '1.0.0'
});

// 注册工具
mcpServer.registerTool(
  'query_database',
  {
    description: '查询企业内部数据库',
    parameters: {
      type: 'object',
      properties: {
        sql: { type: 'string', description: 'SQL查询语句' },
        limit: { type: 'number', description: '返回结果行数', default: 100 }
      },
      required: ['sql']
    }
  },
  async (params, context) => {
    // 权限校验
    if (!context.user.permissions.includes('database:query')) {
      throw new Error('Permission denied');
    }
    
    // SQL安全扫描
    if (!isSafeSql(params.sql)) {
      throw new Error('Unsafe SQL query');
    }
    
    // 执行查询
    const result = await executeQuery(params.sql, params.limit);
    
    // 审计日志
    await logAuditEvent(context.user.id, 'query_database', params.sql);
    
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }]
    };
  }
);

// 路由
app.post('/mcp', async (req, res) => {
  const response = await mcpServer.handleRequest(req.body, {
    user: req.user
  });
  res.json(response);
});

app.listen(3000, () => {
  console.log('MCP Server running on port 3000');
});
```

### 2. 高性能gRPC服务器
适合高并发、生产环境场景：
```go
package main

import (
  "context"
  "net"

  "google.golang.org/grpc"
  "google.golang.org/grpc/codes"
  "google.golang.org/grpc/status"

  mcp "github.com/modelcontextprotocol/proto/go/mcp/v1"
)

type McpServiceImpl struct {
  mcp.UnimplementedMcpServiceServer
  toolRegistry *ToolRegistry
}

func (s *McpServiceImpl) CallTool(ctx context.Context, req *mcp.CallToolRequest) (*mcp.CallToolResponse, error) {
  // 工具存在性校验
  tool, exists := s.toolRegistry.GetTool(req.ToolName)
  if !exists {
    return nil, status.Errorf(codes.NotFound, "Tool %s not found", req.ToolName)
  }
  
  // 参数校验
  if err := tool.ValidateParameters(req.Parameters); err != nil {
    return nil, status.Errorf(codes.InvalidArgument, "Invalid parameters: %v", err)
  }
  
  // 执行工具
  result, err := tool.Execute(ctx, req.Parameters, req.Context)
  if err != nil {
    return nil, status.Errorf(codes.Internal, "Tool execution failed: %v", err)
  }
  
  return &mcp.CallToolResponse{
    Content: []*mcp.Content{
      {Type: mcp.ContentType_TEXT, Text: result},
    },
  }, nil
}

func main() {
  lis, err := net.Listen("tcp", ":50051")
  if err != nil {
    panic(err)
  }
  
  s := grpc.NewServer()
  mcp.RegisterMcpServiceServer(s, &McpServiceImpl{})
  
  if err := s.Serve(lis); err != nil {
    panic(err)
  }
}
```

## 工具注册最佳实践
### 工具元数据规范
```typescript
interface ToolDefinition {
  name: string;           // 小写字母+连字符，全局唯一
  description: string;    // 清晰描述工具功能，包含适用场景
  parameters: {
    type: 'object';
    properties: Record<string, ParameterDefinition>;
    required: string[];   // 明确必填参数
  };
  permissions?: string[]; // 所需权限列表
  rateLimit?: {
    limit: number;        // 单位时间调用次数限制
    windowMs: number;     // 时间窗口（毫秒）
  };
  timeout?: number;       // 执行超时时间（毫秒）
}
```

### 工具命名规范
```
✅ GOOD:
database_query, email_send, invoice_generate, user_info_get

❌ BAD:
queryDB, sendMail, get_user_info, query-the-database
```

## 上下文管理模式
### 1. 无状态模式（推荐）
每个请求携带完整上下文，适合横向扩展：
```typescript
// 请求上下文结构
interface RequestContext {
  sessionId: string;      // 会话ID
  userId: string;         // 用户ID
  permissions: string[];  // 用户权限列表
  metadata: Record<string, any>; // 额外元数据
}
```

### 2. 有状态模式
服务端保存上下文，适合复杂交互场景：
```typescript
class ContextManager {
  private cache = new Map<string, ContextData>();
  
  async saveContext(sessionId: string, data: ContextData, ttl: number = 3600000) {
    this.cache.set(sessionId, data);
    setTimeout(() => this.cache.delete(sessionId), ttl);
  }
  
  async getContext(sessionId: string): Promise<ContextData | undefined> {
    return this.cache.get(sessionId);
  }
}
```

## 安全控制最佳实践
### 1. 多层权限校验
```typescript
async function validateAccess(
  user: User,
  tool: ToolDefinition,
  params: Record<string, any>
): Promise<boolean> {
  // 1. 接口权限校验
  if (!user.permissions.includes(tool.name)) {
    return false;
  }
  
  // 2. 数据权限校验
  if (tool.name === 'query_user_info' && params.userId !== user.id && !user.isAdmin) {
    return false;
  }
  
  // 3. 敏感操作校验
  if (tool.isSensitive && !user.mfaVerified) {
    return false;
  }
  
  return true;
}
```

### 2. 输入输出 sanitization
```typescript
function sanitizeInput(input: string): string {
  // 移除潜在的注入攻击向量
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
}

function sanitizeOutput(output: string): string {
  // 移除敏感信息
  return output
    .replace(/(password|secret|token|key)\s*[:=]\s*[^\s]+/gi, '$1=***')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '***@example.com');
}
```

### 3. 限流与熔断
```typescript
import RateLimiter from 'express-rate-limit';
import CircuitBreaker from 'opossum';

// 限流
const limiter = RateLimiter({
  windowMs: 60 * 1000, // 1分钟
  max: 100, // 每个用户最多100次请求
  standardHeaders: true,
  legacyHeaders: false,
});

// 熔断
const breaker = new CircuitBreaker(toolExecute, {
  timeout: 5000, // 5秒超时
  errorThresholdPercentage: 50, // 50%错误率触发熔断
  resetTimeout: 30000, // 30秒后尝试恢复
});
```

## 跨平台适配
### 主流平台支持
| 平台 | 适配方式 |
|------|----------|
| Claude Code | 原生支持MCP，直接配置服务地址 |
| Cursor | 通过配置文件添加MCP服务器 |
| OpenClaw | 内置MCP客户端，一键对接 |
| 自定义Agent | 集成MCP SDK调用 |

### 配置文件示例（Cursor）
```json
// .cursor/mcp.json
{
  "mcpServers": {
    "internal-tools": {
      "url": "https://mcp.example.com",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

## 部署最佳实践
### 1. 容器化部署
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node
CMD ["node", "dist/server.js"]
```

### 2. Kubernetes部署
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mcp-server
  template:
    metadata:
      labels:
        app: mcp-server
    spec:
      containers:
      - name: mcp-server
        image: mcp-server:v1.0.0
        ports:
        - containerPort: 3000
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "256Mi"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: mcp-server
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: mcp-server
```

## MCP开发检查清单
- [ ] 工具元数据清晰准确，描述包含适用场景与限制
- [ ] 所有参数有明确的类型定义与校验规则
- [ ] 实现多层权限校验，最小权限原则
- [ ] 输入输出做sanitization，防止注入攻击
- [ ] 配置限流与熔断机制，防止服务雪崩
- [ ] 全链路审计日志，包含用户、工具、参数、结果
- [ ] 超时时间合理配置，避免长时间阻塞
- [ ] 服务健康检查接口完备，支持监控告警
- [ ] 文档完善，包含工具使用示例与常见问题
- [ ] 压测达标，满足预期并发量要求
