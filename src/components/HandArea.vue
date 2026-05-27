<template>
  <!-- 第 3 段：手牌 + 按钮 -->
  <section class="hand-area">
    <!-- 标题行 -->
    <div class="hand-header">
      <span class="hand-title">手牌</span>
      <span class="hand-count">已选 {{ selectedCount }} / 5 张</span>
    </div>

    <!-- 手牌横排 -->
    <div class="hand-cards">
      <div
        v-for="card in hand"
        :key="card.id"
        class="playing-card"
        :class="{
          selected: selectedIds.has(card.id),
          dealing: card.dealing,
        }"
        @click="$emit('toggle-select', card.id)"
        :ref="el => setCardRef(card.id, el)"
      >
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

    <!-- v7.2：方案 C 三栏 grid 布局 — 左排序图标 / 中央竖排 出牌特大+弃牌 / 右 AI -->
    <div class="btn-row">
      <!-- 左：排序图标按钮（紧凑） -->
      <div class="btn-left">
        <button class="sort-icon-btn" title="按点排序" @click="$emit('sort-by-rank')">
          <span class="sort-icon-symbol">⇅</span>
          <span class="sort-icon-label">点</span>
        </button>
        <button class="sort-icon-btn" title="按花排序" @click="$emit('sort-by-suit')">
          <span class="sort-icon-symbol">♥</span>
          <span class="sort-icon-label">花</span>
        </button>
      </div>

      <!-- 中：出牌（特大）+ 弃牌（中等）竖排 -->
      <div class="btn-center">
        <button
          class="px-btn px-btn-play big-play"
          :disabled="selectedCount === 0 || gameState !== 'playing'"
          @click="$emit('play')"
        >
          出牌 ({{ selectedCount }})
        </button>
        <button
          class="px-btn px-btn-discard mid-discard"
          :disabled="selectedCount === 0 || discardsLeft <= 0 || gameState !== 'playing'"
          @click="$emit('discard')"
        >
          弃牌 ({{ discardsLeft }})
        </button>
      </div>

      <!-- 右：AI 出牌 -->
      <div class="btn-right">
        <AIButton
          v-if="gameState === 'playing'"
          :disabled="hand.length === 0"
          @ai-play="$emit('ai-play')"
          ref="aiBtnRef"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import AIButton from './AIButton.vue'

const props = defineProps({
  hand: Array,
  selectedIds: Set,
  discardsLeft: Number,
  gameState: String,
})

defineEmits(['toggle-select', 'play', 'discard', 'sort-by-rank', 'sort-by-suit', 'ai-play', 'card-ref'])

const aiBtnRef = ref(null)
const selectedCount = computed(() => props.selectedIds?.size ?? 0)

function suitColor(suit) {
  return suit === '♥' || suit === '♦' ? 'var(--red)' : 'var(--card-edge)'
}

// 手牌 DOM refs
const cardRefs = ref({})
function setCardRef(id, el) {
  if (el) cardRefs.value[id] = el
  else delete cardRefs.value[id]
}

defineExpose({ cardRefs, aiBtnRef })
</script>

<style scoped>
.hand-area {
  display: flex;
  flex-direction: column;
  padding: 32px 16px 12px; /* v7.3：padding-top 56→32 节省顶部空白，依靠 overflow visible 让选中态不被切 */
  overflow: visible;
}

.hand-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.hand-title {
  font: 700 14px/1 var(--sans);
  color: var(--gold);
}
.hand-count {
  font: 700 13px/1 var(--sans);
  color: var(--muted);
}

.hand-cards {
  display: flex;
  justify-content: center; /* v7.1：手牌水平居中 */
  gap: 8px;
  align-items: flex-start;
  flex-wrap: nowrap;
  overflow: visible; /* v7.1：让选中态 -22px 不被切 */
  padding-bottom: 8px;
  min-height: 170px; /* 卡 145 + 选中态 -22 余量 */
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

/* v7.2：方案 C 三栏 grid — 出牌按钮居中视觉权重最大 */
.btn-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 24px;
  align-items: center;
  margin-top: 12px;
  padding: 0 8px;
}
.btn-left {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  align-items: center;
}
.btn-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.btn-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* 排序图标按钮（紧凑） */
.sort-icon-btn {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(99,102,241,.28), rgba(67,56,202,.20));
  border: 2px solid rgba(129,140,248,.55);
  color: #e0e7ff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: all 0.15s ease;
  box-shadow: 0 3px 0 rgba(67,56,202,.4);
}
.sort-icon-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.15) saturate(1.15);
}
.sort-icon-btn:active {
  transform: translateY(2px);
}
.sort-icon-symbol { font-size: 20px; line-height: 1; }
.sort-icon-label {
  font: 800 11px/1 'Inter', 'PingFang SC', sans-serif;
  letter-spacing: 0.5px;
}

/* 出牌按钮：特大居中（v7.3 紧凑：68→60） */
.big-play {
  min-width: 260px;
  min-height: 60px;
  font-size: 20px;
  letter-spacing: 3px;
  padding: 14px 32px;
}
/* 弃牌：中等（v7.3 紧凑：50→46） */
.mid-discard {
  min-width: 200px;
  min-height: 46px;
  font-size: 14px;
  padding: 10px 22px;
}
</style>
