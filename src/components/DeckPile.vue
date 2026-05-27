<template>
  <!-- v7：absolute 内嵌 PlayArea 右下角，不再 fixed -->
  <div class="deck-pile" ref="pileEl">
    <div class="deck-layer"></div>
    <div class="deck-layer"></div>
    <div class="deck-layer"></div>
    <div class="deck-count">{{ deckCount }}/52</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  deckCount: Number,
})

const pileEl = ref(null)

// 暴露 DOM ref 给 App.vue 用于发牌动画 getBoundingClientRect()
defineExpose({ pileEl })
</script>

<style scoped>
.deck-pile {
  /* v7 关键：absolute 内嵌 PlayArea，不用 fixed */
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 90px;
  height: 130px;
  z-index: 2;
  pointer-events: none;
}
.deck-layer {
  position: absolute;
  inset: 0;
  width: 90px;
  height: 130px;
  background: linear-gradient(135deg, #6b3ec9 0%, #4a2599 50%, #2d0d6e 100%);
  border: 2px solid #1a0f24;
  border-radius: 8px;
}
.deck-layer:nth-child(1) { transform: translate(-6px, 6px); opacity: .55; }
.deck-layer:nth-child(2) { transform: translate(-3px, 3px); opacity: .8; }
.deck-layer:nth-child(3) { transform: translate(0, 0); }
.deck-count {
  position: absolute;
  left: 50%;
  bottom: -22px;
  transform: translateX(-50%);
  font: 14px/1 'VT323', monospace;
  color: var(--gold);
  white-space: nowrap;
}
</style>
