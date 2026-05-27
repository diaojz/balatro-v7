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

    <!-- 按钮行，右边留 130px 给牌堆（PRD §4.3） -->
    <div class="btn-row">
      <button
        class="px-btn px-btn-play"
        :disabled="selectedCount === 0 || gameState !== 'playing'"
        @click="$emit('play')"
      >
        出牌 ({{ selectedCount }})
      </button>
      <button
        class="px-btn px-btn-discard"
        :disabled="selectedCount === 0 || discardsLeft <= 0 || gameState !== 'playing'"
        @click="$emit('discard')"
      >
        弃牌 ({{ discardsLeft }})
      </button>
      <button class="px-btn px-btn-sort" @click="$emit('sort-by-rank')">
        按点排序
      </button>
      <button class="px-btn px-btn-sort" @click="$emit('sort-by-suit')">
        按花排序
      </button>
      <!-- AI 出牌按钮：对局中显示 -->
      <AIButton
        v-if="gameState === 'playing'"
        :disabled="hand.length === 0"
        @ai-play="$emit('ai-play')"
        ref="aiBtnRef"
      />
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
  padding: 56px 16px 12px; /* v7.1：padding-top 56px 给选中上移 -22px + scale 留余量，overflow visible 保证选中态不被切 */
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

.btn-row {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-right: 130px; /* 给牌堆腾位置 */
  flex-wrap: wrap;
  margin-top: 8px;
}
</style>
