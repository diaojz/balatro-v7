// 设置面板状态持久化
// localStorage key = 'balatro.settings'

const LS_KEY = 'balatro.settings'

export const DEFAULT_SETTINGS = {
  bgmVolume: 50,
  sfxVolume: 70,
  animSpeed: 'normal', // 'slow' | 'normal' | 'fast'
  showFormula: true,
  aiAutoMode: false,   // v7.2：AI 全自动托管（开启后自动出牌 / 跳过商店连打整局）
}

// 动画速度倍率映射（CSS 变量 --anim-scale）
export const ANIM_SCALE = {
  slow: 1.5,
  normal: 1,
  fast: 0.6,
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
    }
  } catch {
    // 解析失败时静默返回默认值
  }
  return { ...DEFAULT_SETTINGS }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(settings))
  } catch {
    // localStorage 写失败时静默忽略
  }
}

// 把 --anim-scale 写到 :root，全局动画时长通过 calc(Xms * var(--anim-scale)) 使用
export function applyAnimScale(speed) {
  const scale = ANIM_SCALE[speed] ?? 1
  document.documentElement.style.setProperty('--anim-scale', String(scale))
}
