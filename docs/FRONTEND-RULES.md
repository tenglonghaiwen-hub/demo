# 前端工程与组件规则

UI-001 第3项，2026-09-28。以下实现契约已获用户确认并冻结，精确基线见UI-001-BASELINE；不将目录或组件存在当作外部能力已实现。视觉方向见 DESIGN，参考依据见 UI-REFERENCE-NOTES，实施状态见 INTERFACE-PLAN。

## 技术方案与组件库

| 层次 | 选择 | 责任与限制 |
| --- | --- | --- |
| 桌面宿主 | Electron | 保留 Windows 原生窗口控件、安全 preload 和 IPC 边界；渲染层不直接访问 Node 或文件系统 |
| 前端实现 | React + TypeScript | 组件与有类型的状态组织；本轮不引入路由或全局状态框架 |
| 构建 | Vite | 构建本地 renderer；不承担桌面运行或权限管理 |
| 交互组件库 | radix-ui 1.6.7 | 按需采用 Tabs、Switch 等无样式可访问原语；不是前端框架或 Apple 组件库 |
| 图标库 | @radix-ui/react-icons 1.3.2 | 单一图标来源；不以 emoji 或文字字符混作控制图标 |
| 视觉系统 | 项目语义 CSS tokens + 分层 CSS | 统一主题、间距和状态；Radix 不定义产品视觉 |

Radix 两项依赖已由主 Agent 核实 MIT 并锁定版本；升级须说明实际收益与影响，维护 package-lock.json。简单按钮、输入优先语义原生元素，不为一次性代码添加依赖或包装层。

## 目录与依赖方向

| 位置 | 责任 |
| --- | --- |
| src/main.tsx | React 挂载及样式入口 |
| src/App.tsx | 工作台、活动栏及会话侧栏组装，区域可见状态；接入会话 hook，不加入供应商实现 |
| src/components/ui/IconButton.tsx | 统一图标按钮、名称和提示；不读会话存储、不调用桌面桥 |
| src/components/layout/AuxiliaryPanel.tsx | 辅助工作面及 Radix 标签，通过 props 接收动作；未将活动栏或侧栏机械拆出 |
| src/features/conversation/ConversationView.tsx、useConversation.ts | 草稿视图与桌面桥会话状态分别负责呈现和读写/保护；不构造 AI 消息或执行事件 |
| src/features/settings/SettingsView.tsx、usePreferences.ts | 分组设置及本地呈现偏好；不承担模型配置或权限授予 |
| src/i18n/zh-CN.ts | 用户可见中文文案与带参数的文本；不是已完成多语言支持的声明 |
| src/modules.ts | 保留为 zh-CN.ts 中 moduleCopy 的兼容导出入口；能力文案只有一个维护源 |
| src/styles.css | 保留为分层样式导入入口，不叠加第二套全局样式 |
| src/styles/tokens.css | 语义颜色、主题、字体、空间、圆角、边框、阴影、材质和动画变量 |
| src/styles/base.css | 基础元素、全局排版、焦点及无障碍降级 |
| src/styles/layout.css | 窗口工作区、区域尺寸、溢出及适配 |
| src/styles/components.css | 组件及状态视觉，引用 tokens |

上表已按本轮实际文件核对。后续组件文件随真实复用需求建立，禁止为了补齐目录创建空文件。features 和 layout 可依赖 ui；ui 不反向依赖业务。共享数据类型引用 shared/contracts.ts，不在 UI 复制一份协议。不为了约 300 行门槛机械拆文件；超限时检查职责、状态归属与依赖。

## 组件契约

- 同一语义动作复用名称、图标、状态和键盘规则。按钮使用 button，文本输入有 label，图标按钮有 accessible name，装饰图标对辅助技术隐藏。
- Radix 管理采用组件的基础键盘行为；应用仍负责受控值、标签、禁用理由、焦点回归和产品语义。标签页使用正确的选中态和方向键行为，开关与可见说明关联。
- 本轮实际使用 Tabs、RadioGroup、Switch；由布局/设置组件直接组合，没有为各原语增加仅转发 props 的包装器。基础图标按钮独立复用。
- 业务状态由最接近使用位置的单一所有者管理，通过 props 传递；不同时维护多个会话草稿副本作为事实来源。
- 布局展开/收起、工具标签和设置导航不能清空草稿。保存失败保留当前编辑和会话上下文；只在保存成功后继续切换或新建。
- 未接入能力显示真实边界，不提供假连接、假终端输出、假生成进度或虚构模型回复。

## 样式与窗口规则

颜色按用途命名，如表面、正文、次要文本、边界、强调、错误，不按某一页面或具体色值命名。亮/暗模式覆盖同一组语义变量；组件不自行建立局部主题。设计取值集中在 tokens，布局必要比例和媒体查询属于 layout，避免把每个结构数值也抽成无意义变量。

实际 token 入口包括 --surface/--surface-secondary/--surface-glass、--text/--text-muted、--border/--hover、--accent/--selected、--danger/--warning，及 --space-1 至 --space-7、--radius-*、--font-*、--line-height、--duration/--ease/--blur/--shadow。状态相关颜色使用同文件定义的语义扩展；不得在功能页另建调色板。

轻玻璃只用于导航和控制层，内容及编辑区域使用易读实体表面。减少透明度或 backdrop-filter 不可用时，以实体表面和边界维持层次。动效仅用于短时状态反馈；减少动画时停止非必要过渡，不使用持续装饰运动。

窗口默认 1360×900、最小 960×640 为本轮原生窗口尺寸，保留 Windows 原生窗口控制。内容区宽度不等于含边框的窗口宽度。内容视口不超过980px时，辅助面与侧栏互斥：打开辅助面隐藏侧栏，再展开侧栏会关闭辅助面；可见状态与 aria-expanded 同步。辅助面内 Esc 关闭并把焦点还给触发器。设置导航在不超过1150px时转横向，Radix orientation 同步改变，方向键与视觉排列一致。长中文标题、路径和错误可换行或截断且不遮挡操作，不用整页缩放掩盖溢出。

## 本地偏好与数据边界

偏好使用 localStorage 键 `ui.preferences.v1`，仅包含：

```ts
type UiPreferences = {
  theme: 'system' | 'light' | 'dark';
  reduceTransparency: boolean;
  reduceMotion: boolean;
};
```

默认 theme 为 system，两个减少选项为 false；系统减少动画/透明度偏好仍须尊重，应用勾选相当于额外启用，不能以未勾选强行覆盖系统辅助设置。实现监听系统主题、减少动画和减少透明度变化。读取校验字段类型与取值，只返回三个白名单字段；读取失败使用默认值并显示错误提示。写入失败保留旧偏好，不应用新选择，同时显示错误；不冒充已持久化。禁止在此键存凭据、账号、权限或会话正文。

会话仍通过原有 `window.desktop` 五方法：getState、chooseProject、createSession、renameSession、saveDraft。LocalSession 的 id/title/draft/projectPath/updatedAt、AppState schemaVersion=1 及原限制不变；偏好不得写入 sessions.json。选择目录仍仅记录路径，不扫描或修改目录。没有桌面桥时明确说明可用范围，不伪装桌面调用成功。

## 文案、验证与后续变更

中文文案集中并采用稳定语义键；长文本与未来语言扩展需要布局余量，但本轮不安装翻译框架、不声称支持其他语言。用户内容和来自桌面层的真实错误保持原义，不改写成成功状态。所有页面共享相同 token、控件与错误表达，禁止新增页面自行选择组件库或独立配色。

每次新增界面检查键盘可达、焦点可见、加载/空/失败/禁用态和长文本；涉及会话的修改回归未保存保护与重启恢复。类型及构建通过不能替代真实 Electron 截图与交互检查。详细验收和独立审查以 INTERFACE-PLAN 为准；未验证项必须保留。冻结后改变技术栈、顶层结构、组件责任或视觉基线，按开发必读第6节先获用户确认。
