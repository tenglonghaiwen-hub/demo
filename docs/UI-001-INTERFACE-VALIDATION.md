# UI-001 第3项界面验证

2026-09-28；本记录只覆盖第3项新界面，不能用旧骨架结果替代。第4项验收基线另行审阅，本轮不改写原 ACCEPTANCE。

## 实际运行

| 检查 | 结果与证据 |
| --- | --- |
| 主构建（含类型检查） | 通过，outputs/ui-build-20260928.log |
| 主存储测试 | 6/6通过，原有真实存储、损坏数据拒绝覆盖及边界 |
| 主首轮Electron | 11/11通过，outputs/desktop-2026-09-28T07-09-27-381Z/result.json |
| 独立类型/构建/存储 | 通过；6/6，outputs/review-build-20260928.log |
| 独立Electron回归 | 11/11通过，outputs/desktop-2026-09-28T07-13-57-909Z/result.json |
| 独立故障回归 | 9/9通过，outputs/review-failures-2026-09-28T07-17-59-732Z/result.json |
| 主边界交互 | 3/3通过，outputs/interface-edge-2026-09-28T07-20-09-070Z/result.json；脚本scripts/interface-edge-smoke.mjs |
| 最终修正后构建与回归 | build含类型检查通过，outputs/ui-final-build-20260928.log；11桌面通过，outputs/desktop-2026-09-28T07-29-22-898Z/result.json；3边界通过，outputs/interface-edge-2026-09-28T07-29-31-887Z/result.json |

Electron 11项覆盖隔离与五方法桥、创建/保存/重命名、切换和新建前自动保存、目录成功/取消、辅助标签不丢草稿与方向键、侧栏收起展开、关闭保护、设置与三偏好、最小窗口和系统主题/动画、进程重启恢复、无桥禁用。测试专用.local/qa-*隔离日常.local/app。

额外故障9项覆盖真实只读测试文件导致保存失败，保留编辑及原数据、阻止新建/切换、关闭取消、恢复写入后重试；坏JSON/未知主题/数组主题回退；Storage写入异常和重试；系统主题与减少动画变化。独立脚本在.local/review-failure-check.mjs。数组主题校验缺陷已修复后完整重跑，见BUGS UI-001-R06。

边界3项覆盖80字中文会话名、长路径、Ctrl+S真实保存；窄屏辅助面与侧栏互斥、aria-expanded和可见状态一致、Esc关闭焦点返回；设置标签方向与箭头键一致。首次边界脚本过早读取Radix激活状态失败，改为等待焦点和激活状态后通过，没有以产品补丁掩盖测试时序问题。

## 截图与设计审查

已目视上述独立Electron目录的desktop、auxiliary、settings-light、settings-dark、minimum、minimum-auxiliary、minimum-settings，以及边界目录long-content。默认1360×900、最小960×640指原生窗口尺寸，内容截图分别1344×861及944×601；不是手机适配测试。截图不含原生标题栏，源码保留系统窗口控件。

副本在.impeccable/review，均不入Git。机械检测只运行一次：outputs/ui-detector-20260928.json输出[]，但因缺HTML/CSS解析模块降级为regex，未计算对比度或完整选择器，不能宣称完整检测通过。

独立视觉finish reviewer初审disposition: fix，要求修正窄屏设置导航高度及方向契约。修正后同尺寸七图重新捕获并全部目视有效，原审查者verdict为ship：F1/F2均resolved。此结论只覆盖两项修复的复核，详见REVIEW-UI-001-INTERFACE。最终桌面脚本增加窄屏导航高度小于80px断言；源码与构建HTML完整保留方向契约。此后不再追加美化或重复检测。

## 已知限制

- 目录选择及关闭确认的原生返回值为测试替身；没有人工点选系统对话框。长目录仅为测试返回值，没有创建或读取该目录。
- Storage不可写通过测试替身抛错；保存失败是专用文件只读属性触发，不等于实测磁盘满载或断电。
- 浏览器预览是无preload的Chromium窗口，不是跨浏览器验证；未做全面屏幕阅读器审计。
- Radix包的use client指令产生构建警告；应用是本地客户端渲染，构建和实际交互均通过，不做无关依赖升级或全局压制警告。
- Codex运行核心、模型中转、电脑/浏览器控制、终端/差异/审批、视频、MCP、插件技能仍未接入；无上传、付费、账号或消息操作。
- 未验证安装包、签名、升级、跨Windows版本或全面安全审计；候选技术/目录/界面未冻结。
