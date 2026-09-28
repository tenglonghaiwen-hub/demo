---
name: "demo"
description: "Apple 启发的简洁轻玻璃与 Codex 式 Windows 工作台"
colors:
  surface: "#ffffff"
  surface-secondary: "#f4f5f7"
  surface-glass: "#f0f2f5e8"
  text: "#242831"
  text-muted: "#626874"
  border: "#dce0e6"
  hover: "#e7eaf0"
  accent: "#185cbd"
  accent-hover: "#104b9e"
  selected: "#e2ecfb"
  selected-text: "#174f9e"
  danger: "#a32727"
  danger-surface: "#fff0ef"
  warning: "#865400"
  dark-surface: "#202226"
  dark-surface-secondary: "#282b31"
  dark-surface-glass: "#272a30ed"
  dark-text: "#eef0f4"
  dark-text-muted: "#b0b6c1"
  dark-border: "#424750"
  dark-hover: "#353a43"
  dark-accent: "#97bffe"
  dark-accent-hover: "#bad3ff"
  dark-selected: "#263d60"
  dark-selected-text: "#c4daff"
  dark-danger: "#ffb2ad"
  dark-danger-surface: "#412827"
  dark-warning: "#edc47b"
typography:
  body:
    fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif'
    fontSize: "13px"
    lineHeight: 1.6
  small:
    fontSize: "12px"
  title:
    fontSize: "24px"
    fontWeight: 600
    letterSpacing: "-0.025em"
  section:
    fontSize: "15px"
    fontWeight: 600
rounded:
  small: "6px"
  control: "8px"
  panel: "14px"
  pill: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "24px"
  space-6: "32px"
  space-7: "48px"
components:
  button-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "4px 12px"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  icon-button:
    width: "34px"
    height: "34px"
    padding: "0"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.small}"
    padding: "8px"
  badge:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.small}"
    padding: "4px 8px"
  composer:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
---

# Design System: demo

## Overview

**Creative North Star: "简洁轻玻璃工作台"**

以用户指定的 Apple 启发简洁轻玻璃与 Codex 式布局为方向：会话内容优先，导航与控制层轻透，编辑内容使用实体表面。白灰蓝与中性暗色、系统字体和紧凑控件共同服务持续操作；这是一套 Windows Electron CSS 界面，不是 Apple 官方组件或原生 Liquid Glass。

本记录从已实现源码提取，刷新此前方向规范；未经过新的视觉选型。采用用户指定的 code-led 路径，没有 seed、approved comp 或 QUALITY BAR 卡片，不补造这些材料。2026-09-28 用户确认第3项界面基线，品牌定为 demo。已确认的界面布局、导航、样式及前端工程规则冻结；精确范围与文件哈希见 docs/UI-001-BASELINE.md。

**Key Characteristics:**
- 实体内容与轻透导航分层。
- 会话主区、紧凑控制与按需辅助工作面。
- 状态文字真实，键盘焦点明确，支持亮暗及减少透明度/动画。

实现来源：src/styles/tokens.css、base.css、layout.css、components.css；组件职责见 docs/FRONTEND-RULES.md。产品定位和接入边界以 PRODUCT.md 为准。七张最终截图位于 .impeccable/review（desktop、auxiliary、settings-light、settings-dark、minimum、minimum-auxiliary、minimum-settings），运行证据与限制见 docs/UI-001-INTERFACE-VALIDATION.md 和 docs/REVIEW-UI-001-INTERFACE.md。finish ship 仅为 F1 窄屏设置高度、F2 方向契约两项 resolved 的复核，不扩大结论。

## Colors

### Primary
accent 为克制蓝色，用于保存主按钮、开关与焦点；accent-hover 提供主动作悬停。selected/selected-text 成对表达会话或设置选中，选中仍配合语义属性与文字。

### Neutral
surface 是内容和编辑实底；surface-secondary 承载辅助区、分段选择底座与状态标签；surface-glass 只服务轻透层。text、text-muted 区分正文和说明；border 形成细分隔，hover 提供控件反馈。前置 tokens 中 dark-* 是 data-theme="dark" 对同名变量的实际覆盖映射，不是另一套组件 API。

danger/danger-surface 表达错误；warning 标示未保存。不要把未接入标成成功色，也不要只靠颜色说明状态。

**The 语义颜色 Rule.** 新增界面复用同一语义变量；暗色覆盖语义，不在组件内重建调色板。

## Typography

**Body Font:** 系统 Segoe UI，中文 Microsoft YaHei，最后 sans-serif；正文使用 body，辅助说明使用 small。标题使用 title（h1，继承全局行高），小节使用 section；h3 为正文大小、500 字重。没有装饰展示字体或已采用的独立等宽字体。计数使用 tabular-nums，标题允许平衡换行，路径可任意断行。

**The 系统字体 Rule.** 使用平台已有字体与中文回退，不下载或假设安装 Apple 字体。

## Layout

本轮实现为窄活动栏（56px）、可收起会话侧栏（236px）、可伸缩主区和按需辅助面（300px）。顶部上下文栏高58px；会话最大宽820px、设置与模块说明最大宽900px。主区内部滚动，侧栏列表和辅助面各自可滚动；会话介绍区伸展使草稿输入靠近底部。间距只沿用前置 space-1 至 space-7 的现有尺度。

内容视口不超过1150px时，侧栏208px、辅助面250px，设置导航从纵向转横向并换行，其 flex-basis 为 auto，不能被组件层140px纵向宽度规则覆盖。不超过980px时设置行可换行，App使辅助面与侧栏互斥，设置Radix方向随1150px断点同步。不超过700px的CSS还有190px侧栏、48px活动栏和220px辅助面等降级，但它不是已验证的手机布局。高度不超过700px时压缩会话引导留白。

实际审阅原生窗口1360×900和960×640，对应内容截图1344×861和944×601。保留Windows原生标题栏；不要按内容截图尺寸反推窗口尺寸，不用整页缩放掩盖溢出。

## Elevation & Depth

.glass 使用 surface-glass 与18px背景模糊；内容不透明，区域靠1px边界和表面层次分开。减少透明度时改用 surface-secondary 并将模糊置零。当前CSS没有单独的 @supports 模糊回退，模糊不可用时仍有高不透明度背景和边界，不能声称已实现额外的实体回退分支。

实际使用阴影仅为选中的分段按钮（0 1px 3px #0000001a）。tokens.css 定义 --shadow，但当前组件未引用；它是预留值，不是已使用的浮层规范。按钮背景和开关位移沿用170ms与 cubic-bezier(0.16, 1, 0.3, 1)；应用减少动画或系统 prefers-reduced-motion 时持续时间为0ms。

**The 内容实体 Rule.** 玻璃限于导航与控制层；编辑区域保持实体表面，边界优先于装饰阴影。

## Shapes

small 用于输入和状态标签，control 用于普通按钮和反馈条，panel 用于草稿容器，pill 用于开关。不要由现有圆角推导不存在的卡片体系。图标按钮34×34px；开关38×24px，圆点18px，选中位移14px。普通按钮最小高度34px，分段按钮最小高度30px。

## Components

- 按钮：基础语义 button，默认细边框；主保存按钮复用 accent，图标按钮透明底且提供 aria-label/title。禁用透明度0.48；hover与active遵循实际级联。焦点为2px accent轮廓、外偏移3px，不能移除。
- 输入：重命名使用细边框实体 input；草稿 textarea 位于单一圆角容器内，最小高130px、最大高300px、行高1.8，可纵向调整。草稿保存是本地保存语义，不伪装消息发送。
- 导航：会话按钮允许标题截断并保留次要说明；活动栏用 aria-current 表示当前位置。辅助Tabs和设置Tabs直接组合Radix，不新增只转发props的包装层。辅助面Esc关闭并返回触发器焦点。
- 外观设置：RadioGroup构成系统/浅色/深色分段选项，Switch控制减少透明度/动画；选中分段为实体表面加轻阴影。设置导航的方向、键盘规则和视觉排列一致。
- 反馈与容器：badge是说明性状态标签，不是可点击筛选器；错误条用语义错误配色与真实文本。composer是本地草稿容器，不泛化成装饰卡片。

实际复用入口是 src/components/ui/IconButton.tsx 与 src/components/layout/AuxiliaryPanel.tsx；会话和设置在 src/features，中文文案在 src/i18n。App组装活动栏与侧栏。styles.css按 tokens → base → layout → components 导入，媒体规则必须考虑后加载组件级联。sidecar示例仅展示视觉，不代替React/Radix行为实现。

## Do's and Don'ts

### Do:
- Do 复用语义 tokens、现有图标按钮和 Radix 行为原语；新增抽象必须有实际复用需求。
- Do 在最小桌面窗口检查换行、滚动、焦点、标签方向和草稿保护。
- Do 用明确文字表达未接入、未保存和失败，保留用户内容。

### Don't:
- Don't 将占位辅助面写成已接入终端、差异或视频能力。
- Don't 在消息、编辑区叠加玻璃、装饰背景或大面积阴影。
- Don't 将当前候选或有限审查结论当作冻结基线、完整无障碍认证或原生 Apple 实现。
