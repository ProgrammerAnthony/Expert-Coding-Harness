# React Hooks 速查表

## useState
```tsx
// 基础用法
const [count, setCount] = useState<number>(0)
// 函数式更新（依赖之前的状态）
setCount(prev => prev + 1)
// 复杂状态拆分，避免单个state过于复杂
const [name, setName] = useState('')
const [age, setAge] = useState(0)
```
**最佳实践**：
- 状态粒度适中，避免过于复杂的state对象
- 不需要渲染的状态不要放在useState中，使用useRef存储
- 初始值计算昂贵时使用函数式初始化：useState(() => heavyComputation())

## useEffect
```tsx
// 组件挂载时执行一次
useEffect(() => {
  // 副作用逻辑
  return () => {
    // 清理逻辑（组件卸载时执行）
  }
}, [])

// 依赖变化时执行
useEffect(() => {
  fetchData(id)
}, [id])
```
**最佳实践**：
- 依赖数组必须完整，避免逻辑错误和无限循环
- 及时清理副作用（定时器、事件监听、订阅）
- 避免在useEffect中做可以同步执行的逻辑

## useMemo / useCallback
```tsx
// 缓存计算结果，避免重复计算
const total = useMemo(() => {
  return list.reduce((sum, item) => sum + item.price, 0)
}, [list])

// 缓存函数引用，避免子组件不必要重渲染
const handleClick = useCallback((id: string) => {
  deleteItem(id)
}, [deleteItem])
```
**最佳实践**：
- 只在需要的时候使用，避免过度优化
- 优先优化重渲染的根源，而不是盲目加memo
- 不要用来处理业务逻辑，只做性能优化

## useRef
```tsx
// 存储DOM引用
const inputRef = useRef<HTMLInputElement>(null)
// 存储不需要触发重渲染的可变值
const countRef = useRef(0)
countRef.current = 1
```
**最佳实践**：
- 不要在渲染过程中修改ref.current
- DOM相关操作统一放到useEffect或事件回调中
- 替代instance变量存储组件内部状态

## 自定义Hooks
```tsx
// 命名必须以use开头
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  })

  const setStoredValue = (newValue: T) => {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }

  return [value, setStoredValue] as const
}
```
**最佳实践**：
- 抽象复用的状态逻辑，保持组件简洁
- 自定义Hooks内部可以调用其他Hooks
- 返回值语义化，方便使用
