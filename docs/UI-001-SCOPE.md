# UI-001 实施范围（2026-09-28）

状态：工程实施与验证完成，候选骨架待用户确认，未经确认不得称为冻结。证据及未验证边界见 ACCEPTANCE。

## 授权与范围
本轮新授权覆盖上一轮“仅建立文档”限制。唯一目录 D:\AI-Desktop-Assistant；不修改其他项目、不删除文件、不调用模型或付费接口。
用户追加确认：技术栈/工程结构与界面布局、导航、基础组件和交互同步开发、同一应用集成与交叉验证，一起交付审阅，用户确认后一起冻结；不能拆成先文档或仅静态界面。
采用候选 Electron + React + TypeScript，Vite 只负责前端构建。目标是可运行 Windows 外壳、真实本地项目选择及会话草稿持久化、模块导航和诚实的未接入状态。无 AI 回复模拟、无终端执行、无电脑控制、无插件安装。

## 验收
1. 独立 Git 仓库、依赖锁文件、可重复类型检查和构建。
2. Windows Electron 启动；本地草稿创建、切换、重命名、编辑与重启恢复；项目选择取消与成功处理。
3. 导航覆盖编程工作台、电脑/浏览器、视频素材、模型中转、MCP、插件技能；未接入动作不能伪装成功。
4. 隔离 renderer，白名单 preload/IPC，输入校验，禁止任意执行与远程导航。
5. 产品规范、架构/接口边界、后续任务、实际验证和独立审查证据齐全。

## 文件所有权（禁止交叉修改）
| Agent | 职责 | 可写文件 |
| --- | --- | --- |
| root | 集成、Electron/IPC/存储、构建、治理记录 | electron/**、shared/**、scripts/**、tests/**、根目录配置、README.md、docs/HANDOFF.md、TASKS.md、BUGS.md、CHANGES.md、本文件、开发必读.md |
| ui_builder | 前端设计实现 | src/**、index.html、PRODUCT.md、DESIGN.md、.impeccable/** |
| spec_writer | 功能要求与架构规范 | docs/PRODUCT-SPEC.md、docs/ARCHITECTURE.md、docs/ACCEPTANCE.md |
| independent_review | 非实现者独立审查与运行检查 | docs/REVIEW-UI-001.md（其他文件只读） |

## 共享契约
见 shared/contracts.ts，由 root 创建。window.desktop API：getState、chooseProject、createSession、renameSession、saveDraft；所有异步调用返回 Promise。无原始 IPC 暴露。浏览器预览无桌面桥时明确提示需启动桌面版，禁用持久化动作。
前端：左侧导航+会话列表，中间工作台/模块详情，右侧上下文；浅灰暖白底、深绿强调、系统中文字体，无营销装饰。

## 限制
本轮验证开发运行和构建，不承诺安装包、代码签名、自动升级、供应商联调或 Codex 完整兼容。确认骨架后才记录冻结提交。
