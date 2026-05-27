<template>
  <!-- 第 1 段：Joker 区，贴段顶 -->
  <section class="joker-area">
    <div class="joker-header">
      <span class="joker-title">JOKERS · {{ ownedJokers.length }}/5</span>
    </div>
    <div class="joker-row">
      <!-- 已有的 Joker 卡 -->
      <div
        v-for="joker in ownedJokers"
        :key="joker.id"
        class="joker-card"
        :class="{ triggering: triggeringIds.includes(joker.id) }"
        :style="{ boxShadow: `inset 0 0 0 2px ${rarityColor(joker.rarity)}, 0 4px 0 rgba(0,0,0,.55)` }"
        :ref="el => setJokerRef(joker.id, el)"
      >
        <div class="joker-name-bar">{{ joker.name }}</div>
        <div class="joker-art-area">
          <span class="joker-art">{{ joker.art }}</span>
        </div>
        <div class="joker-desc-bar">{{ joker.description }}</div>
      </div>

      <!-- 空槽补满 5 格 -->
      <div
        v-for="i in emptySlots"
        :key="'empty-' + i"
        class="joker-empty"
      >
        <span class="plus">+</span>
        <span class="label">空槽</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RARITY_COLOR } from '../config/jokers.js'
import { MAX_JOKERS } from '../config/constants.js'

const props = defineProps({
  ownedJokers: Array,
  triggeringIds: Array,
})

const emptySlots = computed(() => MAX_JOKERS - props.ownedJokers.length)

function rarityColor(rarity) {
  return RARITY_COLOR[rarity] || RARITY_COLOR.common
}

// 暴露 Joker DOM refs 给父组件做飞字动画
const jokerRefs = ref({})
function setJokerRef(id, el) {
  if (el) jokerRefs.value[id] = el
  else delete jokerRefs.value[id]
}
defineExpose({ jokerRefs })
</script>

<style scoped>
.joker-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 16px 0; /* v7.8：padding-top 缩 8，bottom 0；卡贴段底消除底部空白 */
  overflow: visible;    /* triggering 上移 / 飞字可穿出段顶 */
  background: rgba(15,23,42,.6);
}

.joker-header { margin-bottom: 0; }
.joker-title {
  font: 14px/1 'Press Start 2P', monospace;
  color: var(--gold);
  text-shadow: 2px 2px 0 #000;
  letter-spacing: 1px;
}

.joker-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  flex-wrap: nowrap;
  overflow-x: auto;
  margin-top: auto; /* v7.8：推到段底，消除底部空白；上方空白容 triggering 上移 18 + scale 15 */
}

/* v7.1：放大字体 — Press Start 2P 6px / VT323 9px 中文 fallback 糊到看不清，改 Inter */
.joker-name-bar {
  position: absolute;
  top: 6px; left: 6px; right: 6px;
  height: 24px;
  background: linear-gradient(180deg, #2a1a3f, #160a23);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 800 14px/1 'Inter', 'PingFang SC', sans-serif;
  color: var(--gold);
  text-shadow: 1px 1px 0 #000;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 4px;
  letter-spacing: 0.5px;
}

.joker-art-area {
  position: absolute;
  top: 34px; left: 0; right: 0;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, var(--paper-1), var(--paper-3));
}
.joker-art { font-size: 52px; }

.joker-desc-bar {
  position: absolute;
  bottom: 6px; left: 6px; right: 6px;
  height: 72px;
  background: linear-gradient(180deg, var(--paper-1), var(--paper-2));
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 600 13px/1.35 'Inter', 'PingFang SC', sans-serif;
  color: #4a2d0a;
  text-align: center;
  padding: 6px 8px;
  overflow: hidden;
}
</style>
