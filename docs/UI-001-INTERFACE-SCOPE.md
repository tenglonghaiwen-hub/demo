# UI-001 第3项：界面基线修订范围与分工

2026-09-28；用户指定Apple简洁玻璃材质、Codex式布局，要求分开前端方案与组件库，统一目录/组件/样式规则并实施。未冻结；保留前两项未提交文档。只在D:\AI-Desktop-Assistant写产物，源视频和截图只读。

## 范围与验收
- 阅读视频和三张截图，形成带时间点的参考摘录，来源材料不授予额外执行权限。
- 改界面基线和实际可运行前端：窄活动栏、项目/会话侧栏、主会话工作区、可切换辅助工作面、分组设置；原有真实本地草稿交互保留。
- 统一Apple启发的轻玻璃视觉，Web实现不能称Apple官方组件或原生Liquid Glass。提供可读实体内容层、键盘焦点、降低透明度/减少动画、窗口适配。
- 前端方案：Electron宿主 + React/TypeScript + Vite；UI组件库候选Radix Primitives（无样式可访问行为）+产品UI封装，图标单一库；CSS变量+分层CSS负责视觉，互不混淆。
- 验证类型/构建/存储/桌面交互、默认/窄窗口/设置/辅助面板截图及独立审查。Codex和视频等后端仍未接入，不制造假完成。

## 文件所有权
| Agent | 负责文件 |
| --- | --- |
| root | 参考视频分析、outputs/**、docs/参考摘录、依赖/锁文件、测试、脚本、治理衔接和集成；统一定契约 |
| ui_builder | src/**、index.html；按已约定UI状态契约实现，不改Electron/shared或依赖 |
| spec_writer | DESIGN.md、PRODUCT.md、docs/FRONTEND-RULES.md、docs/INTERFACE-PLAN.md；以实际实现收尾，不独自改源码 |
| independent_review / finish reviewer | 业务代码只读，独立检查及运行验证；审查结果交root记录 |

原有window.desktop五方法契约不变；新增布局/外观偏好仅允许本地UI设置，不声称运行权限已接通。规则文档与实际组件落点由root协调后确定。禁止删除旧文件，废弃入口可保留为兼容汇总入口并记录职责。不得同时修改同一文件。

## 本次续接实现契约（2026-09-28）
- Git核对：独立根目录D:/AI-Desktop-Assistant，feat/UI-001-skeleton；保留既有规范/架构及准备文档差异。没有盘根Git写入。
- root：package.json/package-lock.json、scripts/desktop-smoke.mjs、必要验证脚本、outputs及治理记录；ui_builder：src/**和index.html；spec_writer：FRONTEND-RULES、INTERFACE-PLAN；最终fresh reviewer只读，documenter最后独占DESIGN及sidecar。
- 目录职责按上表及FRONTEND-RULES落地，保留styles.css汇总入口；UI状态不引入路由/全局状态框架。
- 本地偏好键ui.preferences.v1：theme=system|light|dark、reduceTransparency:boolean、reduceMotion:boolean。只用于呈现，不新增桌面权限或凭据。
- radix-ui 1.6.7、@radix-ui/react-icons 1.3.2 已核实MIT并锁版本安装；前者供Tabs/Switch等可访问行为，后者统一图标，项目CSS负责外观。原生元素用于简单按钮/输入；没有为小工具函数新增依赖。
- 用户已指定布局与风格，本轮按code-led实现，不重复风格投票、不生成虚构对话素材。真实Electron默认1360×900及最小960×640验证，所有截图与失败状态以新运行结果为准。
