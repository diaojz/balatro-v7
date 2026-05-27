<template>
  <aside class="sidebar">
    <!-- 1. Logo -->
    <div class="logo-block">
      <span class="logo-text">🃏 小丑牌</span>
    </div>

    <!-- 2. 盲注大面板（v7.11：含 Ante + 关数 信息） -->
    <div class="sb-panel blind-panel">
      <div class="ante-badge">底注 {{ blind?.ante ?? 1 }} / 共 {{ totalAntes }} 底注</div>
      <div class="hud-label">第 {{ blindIndex + 1 }} / {{ totalBlinds }} 关</div>
      <div class="blind-main">
        <PokerChip :variant="blind.chip || 'blue'" :size="36" />
        <span class="blind-name">{{ blind.name }}</span>
      </div>
      <div class="hud-label" style="margin-top:8px">目标分</div>
      <div class="inset-num" style="text-align:center;width:100%">
        <span class="target-score">{{ blind.target }}</span>
      </div>
      <div class="reward-text">奖励 ${{ rewardPreview }}</div>
    </div>

    <!-- 3. Round Score + 进度条 -->
    <div class="sb-panel">
      <div class="hud-label">当前分</div>
      <div class="inset-num" style="width:100%;text-align:center">
        <span class="round-score" :class="{ bumping: scoreBumping }" ref="scoreEl">{{ displayScore }}</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <!-- 4. HAND 计分块 -->
    <div class="sb-panel">
      <div class="hand-type-name" :class="{ empty: !handName }">{{ handName || '— 选牌出牌 —' }}</div>
      <div class="score-row">
        <div class="chips-block" :class="{ bumping: chipsBumping }" ref="chipsEl">
          <div class="score-num">{{ handChips }}</div>
          <div class="score-label">筹码</div>
        </div>
        <span class="times-sign">×</span>
        <div class="mult-block" :class="{ bumping: multBumping }" ref="multEl">
          <div class="score-num">{{ handMult }}</div>
          <div class="score-label">倍率</div>
        </div>
      </div>
    </div>

    <!-- 5. Hands / Discards -->
    <div class="sb-panel hand-discard-row">
      <div class="hd-panel">
        <div class="hud-label">手数</div>
        <div class="inset-num" style="text-align:center">
          <span class="hd-num green">{{ handsLeft }}</span>
        </div>
      </div>
      <div class="hd-panel">
        <div class="hud-label">弃牌</div>
        <div class="inset-num" style="text-align:center">
          <span class="hd-num red">{{ discardsLeft }}</span>
        </div>
      </div>
    </div>

    <!-- 6. 金币 -->
    <div class="sb-panel coins-panel">
      <div class="hud-label">金币</div>
      <div class="coins-display">
        <span class="coins-dollar">$</span>
        <span class="coins-num">{{ coins }}</span>
      </div>
    </div>

    <!-- 7. 关卡 / 回合（v7.11：用总关数 10） -->
    <div class="sb-panel ante-round">
      <span class="ante-text">关 {{ blindIndex + 1 }} / {{ totalBlinds }}</span>
      <span class="sep">·</span>
      <span class="round-text">回合 {{ round }}</span>
    </div>

    <!-- 8. 重新开始 -->
    <button class="px-btn px-btn-restart restart-btn" @click="$emit('restart')">
      重新开始
    </button>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { STARTING_HANDS } from '../config/constants.js'
import { TOTAL_BLINDS, TOTAL_ANTES } from '../config/blinds.js'
import PokerChip from './PokerChip.vue'

const props = defineProps({
  blindIndex: Number,
  blind: Object,
  blindScore: Number,
  handsLeft: Number,
  discardsLeft: Number,
  coins: Number,
  round: Number,
  handName: String,
  handChips: Number,
  handMult: Number,
})

const totalBlinds = TOTAL_BLINDS
const totalAntes = TOTAL_ANTES

defineEmits(['restart'])

// 暴露 DOM refs 给父组件用于飞字动画
const chipsEl = ref(null)
const multEl = ref(null)
const scoreEl = ref(null)

defineExpose({ chipsEl, multEl, scoreEl })

// blindScore 用 RAF 数字插值跳动 + scoreBump 视觉动画
const displayScore = ref(0)
const scoreBumping = ref(false)
const chipsBumping = ref(false)
const multBumping = ref(false)
let rafId = null
let scoreBumpTimer = null
let chipsBumpTimer = null
let multBumpTimer = null

watch(() => props.blindScore, (newVal, oldVal) => {
  if (rafId) cancelAnimationFrame(rafId)
  const start = oldVal ?? 0
  const end = newVal
  if (start === end) return
  const duration = 600 * (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--anim-scale') || '1'))
  const startTime = performance.now()

  // v7.1：触发夸张 bump（scale 1.4 + 金色脉冲）
  if (scoreBumpTimer) clearTimeout(scoreBumpTimer)
  scoreBumping.value = false
  requestAnimationFrame(() => { scoreBumping.value = true })
  scoreBumpTimer = setTimeout(() => { scoreBumping.value = false }, duration + 200)

  function tick(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - (1 - progress) ** 3
    displayScore.value = Math.round(start + (end - start) * eased)
    if (progress < 1) {
      rafId = requestAnimationFrame(tick)
    } else {
      displayScore.value = end
      rafId = null
    }
  }
  rafId = requestAnimationFrame(tick)
})

// v7.1：chips / mult 变化时也触发 bump（scale 1.15）
watch(() => props.handChips, (newVal, oldVal) => {
  if (newVal === oldVal || newVal === 0) return
  if (chipsBumpTimer) clearTimeout(chipsBumpTimer)
  chipsBumping.value = false
  requestAnimationFrame(() => { chipsBumping.value = true })
  chipsBumpTimer = setTimeout(() => { chipsBumping.value = false }, 400)
})
watch(() => props.handMult, (newVal, oldVal) => {
  if (newVal === oldVal || newVal === 0) return
  if (multBumpTimer) clearTimeout(multBumpTimer)
  multBumping.value = false
  requestAnimationFrame(() => { multBumping.value = true })
  multBumpTimer = setTimeout(() => { multBumping.value = false }, 400)
})

const progressPercent = computed(() => {
  if (!props.blind?.target) return 0
  return Math.min(100, (props.blindScore / props.blind.target) * 100)
})

// v7.11：奖励 = 5 + 剩余手数 + (ante - 1) * 2
const rewardPreview = computed(() => {
  const ante = props.blind?.ante ?? 1
  return 5 + props.handsLeft + (ante - 1) * 2
})
</script>

<style scoped>
.logo-block {
  padding: 8px 4px;
  text-align: center;
}
.logo-text {
  font: 18px/1 'Press Start 2P', monospace;
  color: #ffd166;
  text-shadow: 2px 2px 0 #000;
  letter-spacing: 2px;
}

/* v7.11：Ante 徽章 */
.ante-badge {
  display: inline-block;
  font: 800 11px/1 'Press Start 2P', monospace;
  color: #050818;
  background: linear-gradient(135deg, #ffd166, #f59e0b);
  padding: 4px 8px;
  border-radius: 4px;
  letter-spacing: 1px;
  margin-bottom: 6px;
  box-shadow: 0 2px 0 rgba(0,0,0,.4);
}

.blind-panel .blind-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 6px 0 4px;
}
.blind-name {
  font: 700 18px/1 var(--sans);
  color: var(--text);
}
.target-score {
  font: 700 28px/1 'VT323', monospace;
  color: var(--red);
}
.reward-text {
  font: 700 13px/1 var(--sans);
  color: var(--gold);
  margin-top: 6px;
}

.round-score {
  font: 700 48px/1 'VT323', monospace;
  color: var(--red);
  display: inline-block;
  transition: color .2s ease, text-shadow .2s ease, transform .2s ease;
  transform-origin: center;
}
/* v7.1：blindScore 跳动夸张动画 */
.round-score.bumping {
  animation: scoreBump calc(0.8s * var(--anim-scale, 1)) cubic-bezier(.34,1.56,.64,1);
}
@keyframes scoreBump {
  0%   { transform: scale(1); color: var(--red); text-shadow: none; }
  15%  { transform: scale(1.5); color: var(--gold); text-shadow: 0 0 24px var(--gold), 0 0 12px var(--gold); }
  40%  { transform: scale(1.25); color: var(--gold); text-shadow: 0 0 20px var(--gold); }
  70%  { transform: scale(1.1);  color: var(--gold); text-shadow: 0 0 12px var(--gold); }
  100% { transform: scale(1);    color: var(--red); text-shadow: none; }
}

/* v7.1：chips/mult 块跳动 */
.chips-block, .mult-block {
  transition: transform .15s ease;
  transform-origin: center;
}
.chips-block.bumping {
  animation: blockBumpChips calc(0.4s * var(--anim-scale, 1)) cubic-bezier(.34,1.56,.64,1);
}
.mult-block.bumping {
  animation: blockBumpMult calc(0.4s * var(--anim-scale, 1)) cubic-bezier(.34,1.56,.64,1);
}
@keyframes blockBumpChips {
  0%   { transform: scale(1); box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 3px 0 rgba(0,0,0,.4); }
  40%  { transform: scale(1.18); box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 3px 0 rgba(0,0,0,.4), 0 0 24px var(--chips-from); }
  100% { transform: scale(1); box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 3px 0 rgba(0,0,0,.4); }
}
@keyframes blockBumpMult {
  0%   { transform: scale(1); box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 3px 0 rgba(0,0,0,.4); }
  40%  { transform: scale(1.18); box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 3px 0 rgba(0,0,0,.4), 0 0 24px var(--mult-from); }
  100% { transform: scale(1); box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 3px 0 rgba(0,0,0,.4); }
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,.1);
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--chips-from), var(--red));
  border-radius: 4px;
  transition: width .3s ease;
}

.hand-type-name {
  font: 900 20px/1.1 'Inter', 'PingFang SC', sans-serif;
  color: #ffd166;
  margin-bottom: 10px;
  min-height: 22px;
  letter-spacing: 2px;
  text-align: center;
  text-shadow:
    -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000,
    0 0 12px rgba(255,209,102,.7);
  transition: transform .2s ease;
  transform-origin: center;
}
/* v7.21：选中后牌型名 bump 弹出 */
.hand-type-name:not(.empty) {
  animation: handTypePulse calc(0.5s * var(--anim-scale)) ease-out;
}
@keyframes handTypePulse {
  0%   { transform: scale(0.7); opacity: 0; }
  60%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
/* 未选牌时灰色 + 无描边发光 + 无 pulse */
.hand-type-name.empty {
  color: var(--muted);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 1px;
  text-shadow: none;
}
.score-row {
  display: flex;
  align-items: center;
  gap: 0;
}

.hand-discard-row {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
}
.hd-panel {
  flex: 1;
  text-align: center;
}
.hd-num {
  font: 700 34px/1 'VT323', monospace;
}
.hd-num.green { color: var(--green); }
.hd-num.red   { color: var(--red); }

.coins-panel { text-align: center; }
.coins-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  background: #050818;
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(74,107,255,.3);
}
.coins-dollar {
  font: 700 14px/1 'Press Start 2P', monospace;
  color: var(--money);
}
.coins-num {
  font: 700 44px/1 'VT323', monospace;
  color: var(--money);
}

.ante-round {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.ante-text {
  font: 600 13px/1 var(--sans);
  color: var(--gold);
}
.sep { color: var(--muted); }
.round-text {
  font: 600 13px/1 var(--sans);
  color: #60a5fa;
}

.restart-btn {
  width: 100%;
  margin-top: auto;
}
</style>
