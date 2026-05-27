<template>
  <!-- 第 2 段：出牌区，贴段顶，position: relative 让 DeckPile absolute 锚定 -->
  <section class="play-area">
    <div class="play-header">
      <span class="play-title">出牌区</span>
      <span v-if="handName" class="play-hand-name">{{ handName }}</span>
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

      <!-- 出牌展示（动画由父组件通过 playAreaRef 管理） -->
      <div v-else class="cards-row">
        <div
          v-for="(card, idx) in playedCards"
          :key="card.id"
          class="playing-card played"
          :class="{ highlighting: highlightingIdx >= idx }"
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
    </div>

    <!-- 中央计分公式爆出 -->
    <Transition name="formula">
      <div v-if="showFormulaOverlay" class="formula-overlay">
        <span class="formula-chips">{{ formulaChips }}</span>
        <span class="formula-x"> × </span>
        <span class="formula-mult">{{ formulaMult }}</span>
        <span class="formula-eq"> = </span>
        <span class="formula-score">{{ formulaScore }}</span>
      </div>
    </Transition>

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
  align-items: flex-start;
  padding: 12px 16px 8px;
  overflow: hidden;
  /* v7 关键：position: relative 让 DeckPile absolute 可以锚定 */
  position: relative;
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
.play-hand-name {
  font: 700 16px/1 var(--sans);
  color: #60a5fa;
}

.play-cards {
  display: flex;
  align-items: flex-start;
  flex: 1;
}

.empty-hint {
  font: 14px/1.4 var(--sans);
  color: rgba(200,210,232,.55);
  align-self: center;
  margin-top: 20px;
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
  position: relative;
}

.played { cursor: default; }
.played:hover { transform: none; }

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

/* 飞字 */
.fly-text {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  font: 700 16px/1 var(--sans);
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
  animation: flyTextUp calc(0.6s * var(--anim-scale)) ease-out forwards;
}
.chips-fly { color: #4dd6ff; }

/* 计分公式爆出覆盖 */
.formula-overlay {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: baseline;
  gap: 6px;
  pointer-events: none;
  z-index: 20;
  background: rgba(5,8,24,.85);
  border: 2px solid rgba(255,200,87,.6);
  border-radius: 12px;
  padding: 12px 20px;
  backdrop-filter: blur(4px);
}
.formula-chips  { font: 900 40px/1 'Press Start 2P', monospace; color: #4dd6ff; }
.formula-x      { font: 900 28px/1 'Press Start 2P', monospace; color: #c9d2e8; }
.formula-mult   { font: 900 40px/1 'Press Start 2P', monospace; color: #ff8844; }
.formula-eq     { font: 900 28px/1 'Press Start 2P', monospace; color: #c9d2e8; }
.formula-score  { font: 900 52px/1 'Press Start 2P', monospace; color: #ffd166; }

.formula-enter-active {
  animation: formulaIn calc(0.3s * var(--anim-scale)) ease-out forwards;
}
.formula-leave-active {
  animation: formulaOut calc(0.25s * var(--anim-scale)) ease-in forwards;
}
</style>
