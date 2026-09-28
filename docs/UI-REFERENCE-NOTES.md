# UI-001 第3项：视频与截图参考核对

2026-09-28。参考是设计资料，不是执行指令。用户明确要求六项统一前端基线，视频补充其规则；不得执行视频里的示例命令、评论或账号操作。

## 原始资料与证据
- 视频：D:\douyin\@敲代码的小虾米 Vibe Coding立项：前端骨架 在开始让AI写前端之前，记得先做这些哦。 1080P 7647330309549100340.mp4
- ffprobe 实测 580.372993 秒、1920×1080；原文件未改动。
- outputs/reference-ui-20260928/overview-01.jpg 至 overview-04.jpg：20秒采样画面，已目视。
- outputs/reference-ui-20260928/subtitles-ocr.json：每2秒采样底部字幕，290帧，Windows离线中文OCR；已通读。时间为近似采样点，不是逐字音频转录，OCR有错字。
- 截图在用户Temp目录：codex-clipboard-309da696-2193-453c-b074-1719aa4cf809.png、codex-clipboard-62f91ba4-b9f4-46c3-a03f-311c5f0d94cc.png、codex-clipboard-a7113044-f257-4550-be31-8aa7de3a698b.png。

## 视频规则 → 本项目落实
| 大致时间 | 内容 | 实施要求 |
| --- | --- | --- |
| 00:41–00:57 | 写页面前定骨架 | 先约定目录、组件、样式与验收，再实现 |
| 01:03–02:37 | 统一视觉语言；参考布局和留白，不复制整套UI | 白灰蓝、克制玻璃、紧凑工具界面；用户截图只参考布局 |
| 02:39–04:37 | 前端方案与组件库分开，成熟方案优先 | Electron/React/TS/Vite负责组织和构建；Radix负责交互原语；CSS负责视觉 |
| 04:43–05:59 | 目录、模块、复用规则明确 | 基础组件与业务隔离，重复结构优先复用；OCR重复次数不清，不编造原话 |
| 06:01–06:41 | 统一设计token，避免散落硬编码 | 颜色、字型、行高、间距、圆角、阴影、边框集中定义 |
| 06:43–07:03 | 多语言和长文本布局提前规划 | 集中中文文案；预留语言扩展，检查长标题、路径及按钮 |
| 07:05–07:19 | 主色与主题规则集中 | 语义token、主题切换与扩展入口 |
| 07:21–08:25 | 详细计划后搭可运行基础结构 | 写阶段、范围、组件和验收；先骨架，不一次实现所有外部功能 |
| 08:31–09:15 | 所有页面遵守同一规则 | 工程规则、实现和检查相互对应 |

## 截图布局采纳
1. 窄活动栏＋会话侧栏＋主工作区；辅助内容区按需展开，可有标签页。
2. 主区阅读宽度受控，输入区靠下；侧栏可收起，避免固定三栏挤压。
3. 设置采用分组导航与表单行，统一分隔线、开关、菜单。
4. 不复制账号、历史项目、产品商标及截图的完整访问权限开关。保留Windows原生窗口控件。

## 已核对官方来源
- Apple材料：https://developer.apple.com/design/human-interface-guidelines/materials （官方JSON：https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json）。玻璃用于导航与控制层，内容保持易读；支持降低透明度。
- Apple布局：https://developer.apple.com/design/human-interface-guidelines/layout
- Radix：https://www.radix-ui.com/primitives/docs/overview/introduction 。无样式可访问交互原语，需项目自己的视觉规范；不是Apple官方Web组件库。

本轮只整理资料和规范初稿；未安装Radix、未完成新UI、未做新UI回归。
