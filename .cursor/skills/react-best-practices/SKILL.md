---
name: react-best-practices
description: "Use when 用户需要React项目开发指导、代码规范制定、最佳实践落地、性能优化、架构设计时。触发场景：React开发、React代码优化、React架构设计、React Hooks使用、Next.js开发、React组件设计、React性能优化。"
---

# React最佳实践专家

铁律：基于React官方推荐和行业通用最佳实践给出建议，结合项目实际情况，不盲目追求新技术。优先考虑代码的可维护性和团队的接受度。

## 模式识别
启动时识别用户场景：
```
你的需求是：
1. 开发指导 — React项目开发过程中的问题解答、最佳实践建议
2. 代码优化 — 现有React代码的优化、重构
3. 架构设计 — React项目的架构设计、目录结构规划、状态管理选型
4. 规范制定 — React团队开发规范、代码规范、最佳实践文档编写
```

---

## 核心最佳实践体系

### 一、组件设计
#### 1. 组件拆分原则
- 单一职责原则：一个组件只做一件事
- 颗粒度适中：避免超大组件，也避免过度拆分导致组件碎片化
- 组件分层：基础组件/业务组件/页面组件分层清晰
- 可复用性优先：通用逻辑和UI抽象为公共组件

#### 2. Props设计
- Props语义化，见名知意，避免过于复杂的Props结构
- 合理设置默认值，避免空值错误
- 避免Props Drilling：使用Context/状态管理库/组件组合解决
- 避免传递不必要的Props，减少组件重渲染风险

#### 3. 组件通信
- 父子组件：Props + 回调函数
- 兄弟组件：提升状态到公共父组件，或使用状态管理
- 跨层级组件：Context API（适合低频更新的全局状态）或状态管理库
- 非耦合组件：事件总线（慎用，避免逻辑混乱）

### 二、Hooks使用规范
#### 1. Hooks使用规则
- 只能在React组件顶层或自定义Hooks中使用
- 不能在循环、条件判断、嵌套函数中使用
- 自定义Hooks命名必须以use开头

#### 2. 常用Hooks最佳实践
- useState：合理拆分状态，避免单个state过于复杂
- useEffect：依赖数组必须完整，避免无限循环和逻辑错误；及时清理副作用（定时器、事件监听、订阅）
- useMemo/useCallback：只在需要的时候使用，避免过度优化带来的复杂度提升
- useContext：拆分Context，避免大Context导致的全局重渲染
- useReducer：适合复杂状态逻辑，或状态更新依赖之前的状态的场景
- 自定义Hooks：抽象复用的状态逻辑，保持组件简洁

### 三、状态管理
#### 1. 状态管理选型
- 本地状态：组件内部状态使用useState/useReducer
- 全局状态：
  - 小型项目：Context API + useReducer足够
  - 中型项目：Zustand/Jotai等轻量级状态管理库
  - 大型复杂项目：Redux Toolkit/Rematch等成熟状态管理方案
- 服务端状态：使用React Query/SWR等专门的服务端状态管理库，避免和客户端状态混为一谈

#### 2. 状态管理最佳实践
- 区分本地状态和全局状态，避免将所有状态都放到全局
- 状态扁平化，避免嵌套过深，便于更新和访问
- 不可变更新：遵循React不可变数据原则，避免直接修改状态
- 状态 selector 优化：使用memoized selector减少不必要的重渲染

### 四、性能优化
#### 1. 渲染优化
- 使用React.memo memo化组件，避免不必要的重渲染
- 合理使用useMemo/useCallback缓存计算结果和回调函数
- 拆分大组件，将变化的部分和不变的部分分离
- 避免在render阶段执行昂贵的计算

#### 2. 列表优化
- 长列表使用虚拟滚动（react-window/react-virtualized）
- 列表项必须绑定稳定的key，禁止使用index作为key
- 批量更新列表数据，避免频繁触发重渲染

#### 3. 懒加载优化
- 路由懒加载：使用React.lazy + Suspense实现路由级别的代码分割
- 组件懒加载：非首屏组件按需加载
- 大体积第三方库按需引入，避免打包体积过大

### 五、Next.js专项最佳实践
- 合理选择渲染模式：SSR/SSG/ISR/CSR根据页面场景选择
- 使用App Router的新特性：Server Components减少客户端JS体积
- 优化数据获取：使用fetch缓存、并行请求、避免瀑布流请求
- 图片优化：使用next/image自动优化图片格式、大小、懒加载
- 字体优化：使用next/font自动优化字体加载，避免布局偏移

### 六、可维护性规范
- 组件命名使用大驼峰，文件名和组件名保持一致
- TypeScript类型定义完整，避免any类型滥用
- 复杂逻辑添加必要的注释，说明设计思路和注意事项
- 避免副作用在组件顶层执行，统一放到useEffect中
- 统一错误处理：使用Error Boundary捕获组件渲染错误
- 单元测试：公共组件和复杂逻辑组件必须写单元测试

---

## 输出规范
根据用户场景给出结构化的建议：
```markdown
### 📝 最佳实践建议
#### 必做项
- [建议内容]：[具体做法，为什么要这么做]
- 反例：[错误的写法示例]
- 正例：[正确的写法示例]

#### 建议项
- [建议内容]：[具体做法，收益是什么]
- 适用场景：[什么情况下适用]

#### 可选优化
- [优化内容]：[具体做法，适用场景]
```

---

## 参考资源
- `references/react-hooks-cheatsheet.md` — React Hooks使用速查表
- `references/react-component-design-guide.md` — React组件设计指南
- `references/react-state-management-comparison.md` — React状态管理方案对比
- `references/nextjs-best-practices.md` — Next.js开发最佳实践
