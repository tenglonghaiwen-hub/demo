# AI Desktop Assistant

独立 Windows 桌面 AI 助手的 **UI-001 候选骨架**，产品名、Electron + React + TypeScript 技术栈与界面结构尚待用户确认冻结。

## 运行

在 PowerShell 中执行：

```powershell
Set-Location D:\AI-Desktop-Assistant
npm.cmd install --no-fund
npm.cmd run dev
```

当前依赖已安装，可以直接 `npm.cmd run dev`。项目提供依赖锁文件；若后续需要清理后重装依赖，先遵循项目删除确认规则。
`dev` 完成检查和构建后打开真实 Electron 窗口；没有热更新。代码改动后关闭应用并重新执行。已有构建可运行 `npm.cmd start`。

要求：Windows 10/11 x64，Node.js 24 LTS、npm、Git。实际开发环境和验证结果见 [验收记录](docs/ACCEPTANCE.md)，不据此宣称已测试所有 Windows 版本。首次安装需联网下载 npm 包和 Electron。

## 当前可用

- 模块导航与未接入说明。
- 通过系统目录选择器指定下一会话的项目；仅记录路径，不扫描、修改所选目录。
- 本地创建、切换、重命名会话，编辑并显式保存草稿，重新启动恢复。
- 未保存内容保护、加载/失败反馈与输入长度限制。

Codex、AI 回复、终端执行、差异读取、审批执行、电脑/浏览器控制、视频生成、模型中转、MCP、插件/技能安装 **均未接入**。无需填写密钥。没有后台付费调用、发布或账户操作。

## 数据与验证

本地数据在 `.local/app/sessions.json`；Electron 缓存在同目录下。草稿为本机明文文件，请勿放入密钥。程序不会自动删除会话或损坏的数据文件。测试另用 `.local/tests` 与 `.local/qa-*`，不覆盖日常会话。

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd test
npm.cmd run test:desktop
```

先构建再跑测试；桌面验证会开启独立测试窗口并保存截图/结果到 `outputs/`。目录选择器若采用测试替身，会在结果中标明，不等于真实系统选择器人工验证。

从 [AGENTS.md](AGENTS.md) 开始开发；产品要求见 [功能规范](docs/PRODUCT-SPEC.md)，边界见 [架构](docs/ARCHITECTURE.md)，当前状态见 [交接](docs/HANDOFF.md)。不在 D:\ 根目录运行 Git 初始化。后续每个独立功能另开主会话。
