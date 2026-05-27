<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 40 40"
    class="poker-chip"
    :class="{ boss: variant === 'boss' }"
  >
    <!-- 阴影 -->
    <ellipse cx="20" cy="36" rx="14" ry="2" fill="rgba(0,0,0,.5)" />

    <!-- 外环（深色筹码边） -->
    <circle cx="20" cy="20" r="18" :fill="cfg.dark" />

    <!-- 8 个白色 dashes 装饰（德州扑克筹码边缘标志） -->
    <g stroke="#ffffff" stroke-width="3.2" stroke-linecap="butt">
      <line x1="20" y1="3.2" x2="20" y2="7.5" />
      <line x1="20" y1="32.5" x2="20" y2="36.8" />
      <line x1="3.2" y1="20" x2="7.5" y2="20" />
      <line x1="32.5" y1="20" x2="36.8" y2="20" />
      <line x1="8" y1="8" x2="11" y2="11" />
      <line x1="32" y1="8" x2="29" y2="11" />
      <line x1="8" y1="32" x2="11" y2="29" />
      <line x1="32" y1="32" x2="29" y2="29" />
    </g>

    <!-- 主色内环 -->
    <circle cx="20" cy="20" r="13.5" :fill="cfg.main" />

    <!-- 内圈描边 -->
    <circle cx="20" cy="20" r="13.5" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1" />

    <!-- 中央贴标圈 -->
    <circle cx="20" cy="20" r="7" :fill="cfg.dark" stroke="#fff" stroke-width="1.2" />

    <!-- 中央标签 -->
    <text
      x="20"
      :y="cfg.textY"
      text-anchor="middle"
      :font-size="cfg.fontSize"
      font-weight="900"
      :fill="cfg.text"
      font-family="'Inter', sans-serif"
      letter-spacing="-0.5"
    >{{ cfg.label }}</text>

    <!-- 顶部高光（立体感） -->
    <ellipse cx="20" cy="14.5" rx="9" ry="2.8" fill="rgba(255,255,255,.30)" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'blue' }, // 'blue' | 'yellow' | 'red' | 'boss'
  size: { type: Number, default: 36 },
})

// 4 种筹码：蓝（小盲注）/ 黄（大盲注）/ 红（Boss 盲注）/ 黑紫（终极 Boss）
// 仿德州扑克筹码面值习惯
const VARIANTS = {
  blue:   { main: '#2196f3', dark: '#0d47a1', text: '#fff',     label: '$1',  fontSize: 8,  textY: 23 },
  yellow: { main: '#ffc857', dark: '#b8860b', text: '#3a2914',  label: '$5',  fontSize: 8,  textY: 23 },
  red:    { main: '#ef4444', dark: '#7f1d1d', text: '#fff',     label: '$10', fontSize: 7,  textY: 23 },
  boss:   { main: '#7e22ce', dark: '#1a0833', text: '#ffd166',  label: '★',   fontSize: 11, textY: 24 },
}

const cfg = computed(() => VARIANTS[props.variant] || VARIANTS.blue)
</script>

<style scoped>
.poker-chip {
  display: inline-block;
  vertical-align: middle;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,.4));
}
/* 终极 Boss 紫色筹码加金色发光 */
.poker-chip.boss {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,.5)) drop-shadow(0 0 8px rgba(255,209,102,.6));
}
</style>
