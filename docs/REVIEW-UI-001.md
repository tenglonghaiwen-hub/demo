# UI-001 独立审查

审查者：independent_review（非实现者）；2026-09-28。独占本文；业务源码、配置及实现者测试保持只读。测试只写本项目独立 `.local` 夹具与 `outputs` 证据，未操作日常数据或其他项目。

## 结论
当前源码独立类型检查、构建、6 个存储测试、9 项真实 Electron 自动化及 3 项额外失败交互检查通过。本次范围内未发现未解决的 P0/P1/P2 源码问题。最终治理与验收文档已独立复核，清楚区分工程完成、替身验证及未接入功能；候选 Git 提交由主 Agent 收尾登记。这不代表用户已确认或冻结骨架。

## 范围与边界
按 AGENTS.md 读序核对治理、交接、任务、问题、变更、UI-001-SCOPE 与 Git 状态。审查 Electron 主进程、preload、存储、共享契约、前端交互、CSP、配置、脚本、产品与架构文档，并阅读 DESIGN、目视桌面与最小窗口截图。

- 仓库根为 D:/AI-Desktop-Assistant，分支 feat/UI-001-skeleton；不在 D:/ 初始化。
- sandbox/contextIsolation 开启，nodeIntegration 关闭，桥只提供五个明确方法。IPC 验证主窗口、主 frame 与地址；运行测试验证 renderer 无 Node 及非法参数拒绝。非法来源拒绝仅做代码审查，未宣称攻击面全覆盖。
- CSP 禁止连接和嵌入；远程导航、新窗口、webview 与权限默认拒绝。未提供任意命令执行、供应商调用或扩展安装入口。
- 项目路径只接受本次原生选择结果；仅保存路径。字段、长度、schema、重复 ID 与会话上限有校验。
- 同步存储写唯一临时文件后替换；读取失败拒绝覆盖。单实例降低并发写入风险；未验证断电恢复或全面安全审计。
- 前端切换/新建先保存脏草稿，失败阻止切换；关闭有 beforeunload 保护。未接入能力明确说明，无虚构 AI 回复、任务进度或连接成功。

## 发现与复核
| 编号 | 级别/状态 | 证据、影响与结果 |
| --- | --- | --- |
| R01 | P2 / 已修复复核 | index.html 初版缺 CSP、与架构描述不符；现已限制 default/script/style 为 self、connect/frame/object 为 none，独立构建与桌面执行通过 |
| R02 | 阶段阻塞 / 已解决 | 初次 typecheck 因 styles.css 尚未完成报 TS2882；CSS 与声明落地后独立 typecheck/build 均 exit 0 |
| R03 | 验证夹具 / 已解决 | smoke 根路径尾分隔符可能使 mock 路径断言不一致；现以 path.resolve 规范化，独立 smoke 通过 |
| R04 | 文档 / 已复核 | HANDOFF/TASKS/BUGS/CHANGES/ACCEPTANCE 已同步 UI-001 实际结果和限制；README 入库时间措辞已要求主 Agent 改为“提供锁文件”，最终候选提交由其登记，不等于冻结 |

无 P3 源码问题需要新增冻结；未将缺少供应商集成视为本轮 Bug。

## 独立运行证据
| 验证 | 实际结果 |
| --- | --- |
| npm.cmd run typecheck | exit 0 |
| npm.cmd run build | exit 0；Vite 8.3.1，18 modules，renderer JS 230.65 kB |
| npm.cmd test | 6/6 通过；包括 Unicode/换行持久化、无效参数、损坏文件、重复 ID、写失败、200 会话上限 |
| npm.cmd run test:desktop | exit 0，9 项通过，pageErrors=[]；outputs/desktop-2026-09-28T06-03-13-654Z/result.json |
| 独立 200 会话夹具 | 第 201 次创建拒绝且原 JSON 字节不变；.local/review-524a6666-a89c-4c1b-8f09-5caa0abd7770/cap.json |
| 独立失败交互 | 3 项通过；.local/review-failure-114c85f6-179c-4fec-a424-7c6435550166/review-result.json |

9 项桌面检查：启动与隔离、创建编辑保存重命名、切换/新建自动保存与非法参数拒绝、目录选择成功/取消、五个未接入模块导航、刷新触发的未保存离开保护、最小窗口/键盘焦点、真实进程重启恢复、无桥预览禁用动作。目录选择及关闭确认返回值使用测试替身；离开保护通过 webContents.reload 触发共用 beforeunload 分支，未人工点击系统关闭按钮；浏览器预览使用无 preload 的 Chromium 窗口，不是人工原生对话框点选。

额外失败交互由审查者独立编写并执行：在专用测试数据中制造损坏 JSON，确认自动保存失败时仍停在原会话且保留未保存草稿；重启显示错误、禁用新建并保留坏文件；恢复仅本次测试夹具后重试读取恢复可用。没有模拟物理磁盘满载，不能宣称该故障已实测。

亲自查看同一独立 smoke 的 desktop.png 与 minimum.png：三栏层级清楚，已保存/未接入/项目上下文可辨；最小窗口需要纵向滚动但关键操作可达，没有横向溢出，绿色焦点环可见。该截图是滚动全页截图，不能将整页高度解释为 640px 可视范围。

## 限制
未人工操作原生目录选择/关闭确认；未验证不同 Windows 版本、安装包、签名、升级、断电恢复或全面安全攻击。Codex、模型中转、电脑/浏览器控制、视频、MCP、插件技能均未接入，测试不代表其联调通过。候选结构、技术栈和前端仍需用户确认后才能冻结。

## 交付前启动可见性修复复核
主 Agent 在候选提交 `7f12d6d` 后以真实 npm 启动器检查，发现隐藏启动终端下应用进程存在但主窗口句柄为 0，可能影响用户启动使用；未将该现象静默作为通过交付。最小补丁只在首轮 loadURL 后调用 show/focus，并在 second-instance 恢复时补 show，不变更数据或 IPC。

本审查者重新读取该差异，独立运行 `npm.cmd run test:desktop`：exit 0，9/9 通过；证据 `outputs/desktop-2026-09-28T06-09-53-990Z/result.json`。另只读检查真实 launcher 留下的本项目 Electron 主进程 PID 9796，窗口标题为“AI 桌面助手”，MainWindowHandle=461122（非零），确认当前实际窗口存在。没有操作 `.local/app`、关闭日常窗口或修改业务文件。该复核支持本次可见性修复和原流程回归；不扩展为不同启动器/系统版本的兼容性承诺。
