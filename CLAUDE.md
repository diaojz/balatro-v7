# CLAUDE.md

本仓库：v7 第 1 轮一锅端实施

## 定位

Vue 3 + Vite 网页版小丑牌（Balatro 风格）。第 1 轮即完整成品：
- 核心玩法循环（8 手牌 / 4 手 / 3 弃 / 3 关盲注 / 商店）
- 6 张 Joker 候选库
- 完整 4 类动效（飞牌 / 逐张高亮飞字 / Joker 金光 / 发牌飞入）
- 设置面板（BGM/SFX 滑块 + 动画速度 + 公式预览）
- AI 出牌（本地启发式枚举，不联网）

## 硬约束（12 条，来自 PRD §10）

1. sidebar 必须真渲染
2. main-area 不加 padding-right
3. grid-template-rows: 230px 1fr 280px（不要等分）
4. 牌堆 absolute 内嵌 PlayArea（不要 fixed）
5. 大盲注通关 → won（不进商店）
6. 出牌按钮 X=选中数 / 弃牌按钮 X=剩余弃牌数
7. 背景渐变：#0a1438 → #1a2858 → #0a1438（不要偏紫）
8. 未选时 .hand-type-name 用 muted 灰色
9. 字体三类分工：中文 Inter / 数字 VT323 / 英文装饰 Press Start 2P
10. GitHub Pages workflow 模式
11. vite base 自适应：DEPLOY_TARGET === 'pages' ? '/balatro-v7/' : './'
12. npm run build 必须 0 error 0 warning

## 开发命令

```bash
npm install
npm run dev      # 本地开发
npm run build    # 打包
npm run preview  # 预览打包结果
```
