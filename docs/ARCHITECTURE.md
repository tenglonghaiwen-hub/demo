# UI-001 架构与模块边界

状态：候选实现，尚未由用户确认冻结。代码契约以 `shared/contracts.ts` 为单一来源。

## 实际结构
| 路径 | 职责 |
| --- | --- |
| `electron/main.ts` | Windows 窗口、资源协议、目录选择、IPC 来源和参数检查 |
| `electron/preload.ts` | 隔离桥，只暴露 `DesktopApi` 的五个方法 |
| `electron/store.ts` | 会话校验与 JSON 持久化，不承担模型或执行任务 |
| `shared/contracts.ts` | 会话数据、桥接接口和输入限额 |
| `src/` | React 页面、局部交互与样式，不直接接触系统能力 |
| `scripts/` | 本地启动与桌面验证脚本 |
| `tests/` | 可重复的目标测试 |
| `docs/` | 范围、规范、任务、问题、验收与交接 |
| `PRODUCT.md` / `DESIGN.md` | 前端设计简报与视觉规范；功能要求以 PRODUCT-SPEC 为准 |
| `dist/` / `.local/` | 构建输出 / 本地数据与验证产物，均不入 Git |

不为未来集成创建空服务层或空模块目录；下文未来边界是设计约束，不代表已有实现。

## 进程与信任边界
React renderer → 隔离 preload → 白名单主进程 IPC → 原生目录选择器 / SessionStore。

候选技术栈是 Electron + React + TypeScript；Vite 负责前端构建。renderer 关闭 Node 集成并启用上下文隔离与沙箱；preload 不暴露原始 `ipcRenderer`。主进程校验调用来源为当前主窗口及主 frame，并验证输入。资源通过本地 `app://desktop/` 提供；外部导航、新窗口、webview 和权限请求默认拒绝。前端 CSP 与主进程限制共同形成边界，不能以按钮禁用替代主进程检查。

参考依据：[Electron 安全清单](https://www.electronjs.org/docs/latest/tutorial/security)、[Vite 官方指南](https://vite.dev/guide/)。适用行为须以安装版本及真实验证为准；采用这些配置不等于完成全面安全审计。

## 当前接口
| DesktopApi | 语义和错误边界 |
| --- | --- |
| `getState(): Promise<AppState>` | 读取 schemaVersion=1 的本地会话；格式损坏或读取失败则拒绝，不覆盖 |
| `chooseProject(): Promise<string \| null>` | 原生目录选择，取消返回 null；选择不是目录操作授权 |
| `createSession(projectPath): Promise<LocalSession>` | null 或本次主进程目录选择器返回的路径；不接受前端任意路径 |
| `renameSession(id, title): Promise<LocalSession>` | 有效会话 ID，名称 trim 后 1–80 字符；成功返回已保存记录 |
| `saveDraft(id, draft): Promise<LocalSession>` | 有效会话 ID，最多 20000 字符；成功返回已保存记录 |

所有失败均通过 Promise 拒绝传给界面；不存在通用命令、任意文件读写或网络请求接口。后续接口变更需同步契约、主进程校验、前端状态与测试。

## 本地数据
日常数据为 `.local/app/sessions.json`，Chromium 数据在 `.local/app/chromium`。测试使用独立的 `.local/tests`、`.local/qa-*` 路径，不能复用日常数据。当前项目目录需可写，不代表已解决安装版的用户数据目录策略。

写入先生成同目录临时文件，再替换目标；失败保留原文件及可能的临时文件。读取校验版本、字段、限额和重复 ID，禁止损坏数据静默重置。UI-001 不实现迁移、云同步、删除或备份管理；未来版本更改 schema 必须另设可回退迁移方案。

## 未来逻辑边界
| 边界 | 职责 / 禁止跨界事项 |
| --- | --- |
| Agent / Codex 适配 | 将官方事件映射为会话与工具状态；不得把模型建议视为操作授权 |
| 模型与视频适配 | 协议、请求、取消、状态和错误转换；计费操作在提交前完成确认 |
| 审批与执行 | 审批绑定具体操作参数、目标及有效期；执行前重新校验，不接受前端声明“已批准” |
| 本机 / 浏览器工具 | 仅执行授权能力，提供目标与结果证据，支持停止；无任意兜底执行 |
| MCP / 插件 / 技能 | 发现、来源、权限、生命周期和调用；外部描述是不可信数据 |
| 素材与产物 | 保留原素材，输出另存，记录来源、任务和真实结果 |
| 秘密与日志 | 系统安全存储、最小暴露和脱敏；不得进入 renderer 状态、仓库或交接 |

以上模块未来落地前须明确契约和失败路径。当前没有审批器、执行器或真实供应商适配器。

## 依赖与可恢复基线
具体锁定版本及依赖用途、许可证核实记录由主 Agent 在 README/变更记录维护，本文件不重复一份版本清单。运行步骤以 README 为准。

用户确认之前，只建立可审阅候选基线。确认后记录提交或文件哈希、日期与确认范围，冻结技术栈、顶层目录、模块职责、进程通信和前端布局。回退采用 Git 中明确基线恢复或最小反向修改；任何文件删除仍须先列明路径、数量和影响取得确认。
