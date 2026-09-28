# Product
<!-- impeccable:product-schema 1 -->
## Platform
web
## Stack
Windows Electron 宿主，React + TypeScript 界面，Vite 构建。Radix Primitives 是按需采用的无样式交互组件库，不是前端框架；语义 CSS tokens 和分层 CSS 负责视觉。第3项前端方案与界面基线已于2026-09-28确认，冻结范围见docs/UI-001-BASELINE.md。
## Users
在 Windows 上使用 Codex 工作流进行编程、项目与会话管理，并在同一环境扩展视频工作的用户。
## Product Purpose
以真实 Codex 作为软件本体和核心运行能力，使用独立品牌 demo，在同一工作流加入视频。不能以模型聊天、类似界面或本地草稿替代完整能力对齐。
## Operating Context
唯一项目目录 D:\AI-Desktop-Assistant。当前是 UI-001 第3项界面基线修订，按 docs/UI-001-INTERFACE-SCOPE.md 实施；每个后续独立功能新主会话开发，确认后冻结骨架。
## Capabilities and Constraints
已有真实目录选择和本地会话草稿创建/切换/重命名/保存/恢复。本次增加布局工作面和本地外观偏好。Codex 运行核心、模型中转、终端、差异、执行审批、电脑/浏览器、视频、MCP、插件技能仍未接入，不显示虚构消息、进度或成功。保留原五个桌面接口；不索取密钥，不执行付费或账号操作。
## Product Principles
会话为中心，工具是同一工作环境的辅助工作面；设置独立分组。用户已指定 Apple 启发的简洁轻玻璃方向和 Codex 式布局：窄活动栏、项目/会话侧栏、中间会话与底部输入、可打开的辅助标签面。玻璃限于导航和控制层，内容可读实底；状态真实、未保存内容受保护、键盘可用。
## Open Decisions
品牌已确定为 demo；Codex 参考版本及接入细节、视频供应商未定。已指定的视觉方向不再作为开放问题；第3项界面已获确认；不能冒充 Apple 官方 Web 组件或原生 Liquid Glass，也不代表外部能力已实现。规范分工见 docs/FRONTEND-RULES.md，实施与验证见 docs/INTERFACE-PLAN.md。
