<template>
  <div class="end-overlay">
    <div class="end-card">
      <div class="end-icon">{{ state === 'won' ? '🎉' : '💀' }}</div>
      <h2 class="end-title" :class="state === 'won' ? 'won-title' : 'lost-title'">
        {{ state === 'won' ? '通关全部' : '失败' }}
      </h2>

      <p v-if="state === 'lost'" class="end-desc">
        卡在第 {{ blindIndex + 1 }} 关
      </p>
      <p v-else class="end-desc won-desc">恭喜通过全部 3 关！</p>

      <!-- 显示最终金币 + 持有 Joker -->
      <div class="end-stats">
        <div class="end-stat-row">
          <span class="end-stat-label">金币</span>
          <span class="end-stat-val">${{ coins }}</span>
        </div>
        <div v-if="ownedJokers.length > 0" class="end-jokers">
          <span class="end-stat-label">持有的 Joker</span>
          <div class="end-joker-list">
            <span v-for="j in ownedJokers" :key="j.id" class="end-joker-badge">
              {{ j.art }} {{ j.name }}
            </span>
          </div>
        </div>
      </div>

      <button class="px-btn px-btn-restart" @click="$emit('restart')">
        重新开始
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  state: String,
  blindIndex: Number,
  coins: Number,
  ownedJokers: Array,
})

defineEmits(['restart'])
</script>

<style scoped>
.end-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5,8,24,.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(6px);
}

.end-card {
  background: linear-gradient(180deg, #1a2858 0%, #0d1a40 100%);
  border: 2px solid var(--sb-blue);
  border-radius: 16px;
  padding: 48px 60px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-width: 360px;
}

.end-icon { font-size: 72px; line-height: 1; }

.end-title {
  font: 900 32px/1 var(--sans);
  margin: 0;
}
.won-title { color: var(--gold); }
.lost-title { color: var(--red); }

.end-desc {
  font: 600 16px/1.4 var(--sans);
  color: var(--text-dim);
  margin: 0;
}
.won-desc { color: var(--green); }

.end-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}
.end-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.end-stat-label {
  font: 600 13px/1 var(--sans);
  color: var(--muted);
}
.end-stat-val {
  font: 700 20px/1 'VT323', monospace;
  color: var(--gold);
}

.end-jokers {
  text-align: left;
}
.end-joker-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.end-joker-badge {
  font: 600 13px/1 var(--sans);
  color: var(--text-dim);
  background: rgba(74,107,255,.15);
  border: 1px solid rgba(74,107,255,.3);
  border-radius: 6px;
  padding: 4px 8px;
}
</style>
