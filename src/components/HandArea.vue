<template>
  <!-- 第 3 段：手牌 + 按钮 -->
  <section class="hand-area">
    <!-- 标题行（v7.9：AI 全自动 toggle 挪到标题行最右，不再占按钮区高度撑爆段） -->
    <div class="hand-header">
      <span class="hand-title">手牌</span>
      <span class="hand-count">已选 {{ selectedCount }} / 5 张</span>
      <button
        class="ai-auto-toggle"
        :class="{ on: aiAutoMode }"
        @click="$emit('toggle-auto')"
        :title="aiAutoMode ? '点击关闭 AI 全自动托管' : '点击开启 AI 全自动托管'"
      >
        <span class="auto-dot"></span>
        <span class="auto-label">{{ aiAutoMode ? '全自动 ON' : '全自动 OFF' }}</span>
      </button>
    </div>

    <!-- 手牌横排（v7.25：TransitionGroup 让排序时牌平滑滑到新位置 + 蓝光闪烁）-->
    <TransitionGroup
      name="hand-sort"
      tag="div"
      class="hand-cards"
      :class="{ 'is-sorting': isSorting }"
    >
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
    </TransitionGroup>

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

      <!-- v7.5：中央改横排出牌+弃牌，节省顶部空间 -->
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

      <!-- 右：AI 出牌（v7.9：toggle 已挪到标题行，这里只剩单按钮） -->
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
  aiAutoMode: { type: Boolean, default: false },
  isSorting: { type: Boolean, default: false },
})

defineEmits(['toggle-select', 'play', 'discard', 'sort-by-rank', 'sort-by-suit', 'ai-play', 'card-ref', 'toggle-auto'])

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
  padding: 8px 16px 28px; /* v7.18：padding-bottom 12→28 给按钮底部呼吸空间，不再贴 viewport 底 */
  overflow: visible;
}

.hand-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
/* v7.9：让全自动 toggle 推到标题行最右 */
.hand-header .ai-auto-toggle {
  margin-left: auto;
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

/* v7.25：TransitionGroup move 让牌排序时平滑滑到新位置（弹性 cubic-bezier） */
.hand-sort-move {
  transition: transform calc(0.55s * var(--anim-scale, 1)) cubic-bezier(.34, 1.36, .64, 1);
}

/* v7.25：排序瞬间，所有牌短暂蓝色发光 + 微微上浮再回落 */
.hand-cards.is-sorting .playing-card {
  animation: cardSortPulse calc(0.6s * var(--anim-scale, 1)) ease-out;
}
@keyframes cardSortPulse {
  0%   { box-shadow: 0 4px 0 rgba(0,0,0,.5); transform: translateY(0); }
  35%  {
    box-shadow: 0 10px 0 rgba(0,0,0,.5), 0 0 28px rgba(77,214,255,.95), 0 0 12px rgba(77,214,255,.7);
    transform: translateY(-12px);
  }
  100% { box-shadow: 0 4px 0 rgba(0,0,0,.5); transform: translateY(0); }
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
/* v7.5：横排出牌+弃牌，节省垂直空间 */
.btn-center {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}
.btn-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* v7.7：AI 全自动快捷 toggle 按钮 */
.ai-auto-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(168, 85, 247, 0.10);
  border: 2px solid rgba(168, 85, 247, 0.35);
  color: #c9aafe;
  font: 800 12px/1 'Inter', 'PingFang SC', sans-serif;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.ai-auto-toggle:hover {
  filter: brightness(1.2);
  transform: translateY(-1px);
}
.ai-auto-toggle.on {
  background: linear-gradient(135deg, #c084fc, #7e22ce);
  color: #fff;
  border-color: #a855f7;
  box-shadow: 0 0 18px rgba(168,85,247,.55), 0 3px 0 #581c87;
  text-shadow: 0 1px 2px rgba(0,0,0,.4);
}
.ai-auto-toggle .auto-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(168, 85, 247, 0.4);
  transition: all 0.2s ease;
}
.ai-auto-toggle.on .auto-dot {
  background: #fff;
  box-shadow: 0 0 10px #fff;
  animation: autoDotPulse 1s ease-in-out infinite;
}
@keyframes autoDotPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.6; transform: scale(0.85); }
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

/* v7.5：出牌+弃牌横排，出牌仍是视觉主角（更宽更亮） */
.big-play {
  min-width: 240px;
  min-height: 60px;
  font-size: 20px;
  letter-spacing: 3px;
  padding: 14px 28px;
}
.mid-discard {
  min-width: 160px;
  min-height: 60px;
  font-size: 16px;
  padding: 14px 20px;
}
</style>
