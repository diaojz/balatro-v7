<template>
  <button class="settings-btn" @click="$emit('open')" title="设置">⚙️</button>
</template>

<script setup>
defineEmits(['open'])
</script>

<style scoped>
.settings-btn {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
  box-shadow: 0 4px 0 #92400e, 0 6px 12px rgba(245,158,11,.35), inset 0 1px 0 rgba(255,255,255,.3);
  border: 2px solid rgba(0,0,0,.35);
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.15s ease;
}
.settings-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}
.settings-btn:active {
  transform: translateY(2px);
  filter: brightness(0.9);
}
</style>
