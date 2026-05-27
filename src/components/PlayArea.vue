<template>
  <!-- 第 2 段：出牌区，贴段顶，position: relative 让 DeckPile absolute 锚定 -->
  <section class="play-area">
    <div class="play-header">
      <span class="play-title">出牌区</span>
    </div>

    <div class="play-cards">
      <!-- 空态提示 / 公式预览 -->
      <div v-if="playedCards.length === 0" class="empty-hint">
        <template v-if="showFormula && previewScore > 0">
          <span class="formula-preview">预估：{{ previewChips }} × {{ previewMult }} = {{ previewScore }}</span>
        </template>
        <template v-else>
          选择手牌组成牌型（1-5 张）
        </template>
      </div>

      <!-- 出牌展示：v7.22 牌型 banner 和公式分时显示（互不遮挡）
           - 出牌瞬间 → 牌型 banner 弹出，停留期间显示逐张高亮+飞字
           - 公式爆出时 → 牌型 banner 自动淡出让位
      -->
      <template v-else>
        <!-- 牌型名 banner（公式未爆出时显示） -->
        <Transition name="hand-name-pop">
          <div v-if="handName && !showFormulaOverlay" class="hand-name-banner" :key="handName">{{ handName }}</div>
        </Transition>

        <!-- 计分公式爆出（在牌上方，互斥替换牌型 banner） -->
        <Transition name="formula">
          <div v-if="showFormulaOverlay" class="formula-inline">
            <span class="formula-chips">{{ formulaChips }}</span>
            <span class="formula-x"> × </span>
            <span class="formula-mult">{{ formulaMult }}</span>
            <span class="formula-eq"> = </span>
            <span class="formula-score">{{ formulaScore }}</span>
          </div>
        </Transition>

        <div class="cards-row">
          <div
            v-for="(card, idx) in playedCards"
            :key="card.id"
            class="playing-card played"
            :class="{
              highlighting: highlightingIdx >= idx,
              'joker-hit': jokerHitIds.includes(card.id),
            }"
            :ref="el => setPlayedCardRef(idx, el)"
          >
            <!-- 飞字容器 -->
            <div v-if="flyTexts[idx]" class="fly-text chips-fly">{{ flyTexts[idx] }}</div>

            <div class="card-corner top-left" :style="{ color: suitColor(card.suit) }">
              <div class="card-rank">{{ card.rank }}</div>
              <div class="card-suit-small">{{ card.suit }}</div>
            </div>
            <div class="card-center" :style="{ color: suitColor(card.suit) }">{{ card.suit }}</div>
            <div class="card-corner bottom-right" :style="{ color: suitColor(card.suit) }">
              <div class="card-rank">{{ card.rank }}</div>
              <div class="card-suit-small">{{ card.suit }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 牌堆（absolute 内嵌，v7 关键调整） -->
    <DeckPile :deck-count="deckCount" ref="deckPileRef" />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import DeckPile from './DeckPile.vue'

const props = defineProps({
  playedCards: Array,
  handName: String,
  deckCount: Number,
  showFormula: Boolean,
  previewChips: Number,
  previewMult: Number,
  previewScore: Number,
  highlightingIdx: { type: Number, default: -1 },
  flyTexts: { type: Array, default: () => [] },
  showFormulaOverlay: Boolean,
  formulaChips: Number,
  formulaMult: Number,
  formulaScore: Number,
  jokerHitIds: { type: Array, default: () => [] },
})

const deckPileRef = ref(null)
const playedCardRefs = ref([])

function setPlayedCardRef(idx, el) {
  playedCardRefs.value[idx] = el
}

defineExpose({ deckPileRef, playedCardRefs })

function suitColor(suit) {
  return suit === '♥' || suit === '♦' ? 'var(--red)' : 'var(--card-edge)'
}
</script>

<style scoped>
.play-area {
  display: flex;
  flex-direction: column;
  align-items: stretch; /* v7.1：让 play-cards 撑满宽度，里面再居中 */
  padding: 12px 16px 8px;
  overflow: hidden;
  /* v7 关键：position: relative 让 DeckPile absolute 可以锚定 */
  position: relative;
  /* v7.23：z-index 高于 Joker 段（JokerArea overflow visible 会让空槽虚线穿到 PlayArea 顶部）*/
  z-index: 10;
  background: rgba(5,8,24,.5);
}

.play-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.play-title {
  font: 700 13px/1 var(--sans);
  color: var(--muted);
  letter-spacing: 0.5px;
}

/* v7.21：牌型名大字 banner — 出牌时同花顺/葫芦/两对 等弹出 */
.hand-name-banner {
  font: 900 42px/1 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #ffd166;
  letter-spacing: 6px;
  text-align: center;
  padding: 8px 28px;
  background: linear-gradient(135deg, rgba(255,209,102,.10), rgba(168,85,247,.08));
  border: 2px solid rgba(255,209,102,.5);
  border-radius: 14px;
  text-shadow:
    -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000,
    0 0 18px rgba(255,209,102,.95), 0 0 36px rgba(255,209,102,.55);
  box-shadow: 0 6px 24px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.2);
  /* v7.23：自身也设 z-index，双保险 */
  position: relative;
  z-index: 100;
}
.hand-name-pop-enter-active {
  animation: handNamePop calc(0.5s * var(--anim-scale)) cubic-bezier(.34,1.56,.64,1);
}
.hand-name-pop-leave-active {
  animation: handNamePopOut calc(0.25s * var(--anim-scale)) ease-in;
}
@keyframes handNamePop {
  0%   { opacity: 0; transform: scale(0.3) rotate(-4deg); }
  55%  { opacity: 1; transform: scale(1.12) rotate(1.5deg); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
}
@keyframes handNamePopOut {
  0%   { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.1); }
}

.play-cards {
  display: flex;
  flex-direction: column;      /* 公式在上 / 牌在下（DOM 顺序） */
  align-items: center;         /* 水平居中 */
  justify-content: flex-end;   /* v7.6：贴底！牌位置固定，公式弹出时只占牌上方空间，不挤牌 */
  gap: 18px;
  flex: 1;
  min-height: 0;
  padding: 0 0 16px;
}

.empty-hint {
  font: 14px/1.4 var(--sans);
  color: rgba(200,210,232,.55);
}

.formula-preview {
  font: 700 16px/1 'Press Start 2P', monospace;
  color: #ffd166;
  letter-spacing: 1px;
}

.cards-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  justify-content: center; /* v7.1：牌水平居中 */
  position: relative;
}

.played { cursor: default; }
.played:hover { transform: none; }

/* v7.28：被 Joker 命中的牌 — 快速敲击式特效（脆+猛，0.35s 单张敲一下）
   节奏与 App.vue 每张 400ms 间隔同步，让"3 张梅花依次响应"看得清清楚楚 */
.playing-card.played.joker-hit {
  animation: jokerHitExplosion calc(0.35s * var(--anim-scale, 1)) cubic-bezier(.22, 1.5, .42, 1);
  z-index: 5;
}
@keyframes jokerHitExplosion {
  0%   {
    transform: scale(1) translateY(0) rotate(0);
    box-shadow: 0 4px 0 rgba(0,0,0,.5);
    filter: brightness(1) saturate(1);
  }
  35%  {
    /* 高潮：scale 1.5 + 上跳 36px + 多层金边 + 强发光 + 滤镜爆 */
    transform: scale(1.5) translateY(-36px) rotate(-6deg);
    box-shadow:
      0 0 0 5px rgba(255,209,102,1),
      0 0 0 9px rgba(255,209,102,.55),
      0 0 48px rgba(255,209,102,1),
      0 0 96px rgba(255,209,102,.7),
      0 0 160px rgba(255,200,87,.4);
    filter: brightness(1.8) saturate(1.7) drop-shadow(0 0 16px gold);
  }
  100% {
    /* 立刻回落（脆感） */
    transform: scale(1) translateY(0) rotate(0);
    box-shadow: 0 4px 0 rgba(0,0,0,.5);
    filter: none;
  }
}

/* v7.28：粒子爆炸（伪元素）— 8 道金光放射，0.4s 内完成 */
.playing-card.played.joker-hit::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle, gold, transparent 70%);
  transform: translate(-50%, -50%);
  animation: hitBurst calc(0.4s * var(--anim-scale, 1)) ease-out forwards;
  pointer-events: none;
  z-index: -1;
}
@keyframes hitBurst {
  0%   { opacity: 0; box-shadow: 0 0 0 0 gold; }
  30%  {
    opacity: 1;
    box-shadow:
      0   -45px 0 5px gold,
      32  -32px 0 5px #ffd166,
      45    0  0 5px gold,
      32   32px 0 5px #ffd166,
      0    45px 0 5px gold,
      -32  32px 0 5px #ffd166,
      -45   0  0 5px gold,
      -32 -32px 0 5px #ffd166;
  }
  100% {
    opacity: 0;
    box-shadow:
      0   -100px 0 0 gold,
      70  -70px  0 0 #ffd166,
      100   0    0 0 gold,
      70   70px  0 0 #ffd166,
      0    100px 0 0 gold,
      -70  70px  0 0 #ffd166,
      -100  0    0 0 gold,
      -70 -70px  0 0 #ffd166;
  }
}

.card-corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}
.top-left { top: 6px; left: 7px; }
.bottom-right { bottom: 6px; right: 7px; transform: rotate(180deg); }
.card-rank { font: 700 14px/1 var(--sans); }
.card-suit-small { font-size: 12px; line-height: 1; }
.card-center {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 36px;
  opacity: 0.35;
  line-height: 1;
}

/* v7.13：飞字缩到 48px（v7.12 72 太大），保留 v7.12 的厚描边 + 强发光 */
.fly-text {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  font: 900 48px/1 var(--sans);
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
  letter-spacing: 2px;
  animation: flyTextUp calc(0.7s * var(--anim-scale)) ease-out forwards;
}
.chips-fly {
  color: #4dd6ff;
  text-shadow:
    -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000,
    0 0 18px rgba(77,214,255,1), 0 0 36px rgba(77,214,255,.7);
}

/* v7.1：计分公式 inline 显示（在牌上方），不再 absolute */
.formula-inline {
  display: flex;
  align-items: baseline;
  gap: 6px;
  background: rgba(5,8,24,.85);
  border: 2px solid rgba(255,200,87,.6);
  border-radius: 12px;
  padding: 12px 20px;
  pointer-events: none;
  z-index: 20;
  backdrop-filter: blur(4px);
}
.formula-chips  { font: 900 40px/1 'Press Start 2P', monospace; color: #4dd6ff; }
.formula-x      { font: 900 28px/1 'Press Start 2P', monospace; color: #c9d2e8; }
.formula-mult   { font: 900 40px/1 'Press Start 2P', monospace; color: #ff8844; }
.formula-eq     { font: 900 28px/1 'Press Start 2P', monospace; color: #c9d2e8; }
.formula-score  { font: 900 52px/1 'Press Start 2P', monospace; color: #ffd166; }

/* v7.1：inline 公式的 transition（不带 translate 中心校正，因为已经是文档流） */
.formula-enter-active {
  animation: formulaInline calc(0.3s * var(--anim-scale)) ease-out forwards;
}
.formula-leave-active {
  animation: formulaInlineOut calc(0.25s * var(--anim-scale)) ease-in forwards;
}
@keyframes formulaInline {
  0%   { opacity: 0; transform: scale(0.5); }
  60%  { opacity: 1; transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes formulaInlineOut {
  0%   { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.15); }
}
</style>
