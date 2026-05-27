<template>
  <!-- 背景遮罩：点击关闭 -->
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <h2 class="modal-title">设置</h2>

      <div class="settings-list">
        <!-- BGM 音量 -->
        <div class="setting-row">
          <label class="setting-label">BGM 音量</label>
          <div class="slider-wrap">
            <input
              type="range"
              min="0" max="100"
              :value="settings.bgmVolume"
              @input="update('bgmVolume', +$event.target.value)"
              class="slider"
            />
            <span class="slider-val">{{ settings.bgmVolume }}</span>
          </div>
        </div>

        <!-- SFX 音量 -->
        <div class="setting-row">
          <label class="setting-label">SFX 音量</label>
          <div class="slider-wrap">
            <input
              type="range"
              min="0" max="100"
              :value="settings.sfxVolume"
              @input="update('sfxVolume', +$event.target.value)"
              class="slider"
            />
            <span class="slider-val">{{ settings.sfxVolume }}</span>
          </div>
        </div>

        <!-- 动画速度 -->
        <div class="setting-row">
          <label class="setting-label">动画速度</label>
          <div class="radio-group">
            <button
              v-for="opt in speedOpts"
              :key="opt.value"
              class="radio-btn"
              :class="{ active: settings.animSpeed === opt.value }"
              @click="update('animSpeed', opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- 显示出牌公式预览 -->
        <div class="setting-row">
          <label class="setting-label">显示出牌公式预览</label>
          <button
            class="toggle-btn"
            :class="{ on: settings.showFormula }"
            @click="update('showFormula', !settings.showFormula)"
          >
            <span class="toggle-knob"></span>
          </button>
        </div>
      </div>

      <button class="px-btn px-btn-skip close-btn" @click="$emit('close')">关闭</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  settings: Object,
})

const emit = defineEmits(['close', 'update'])

const speedOpts = [
  { label: '慢', value: 'slow' },
  { label: '普通', value: 'normal' },
  { label: '快', value: 'fast' },
]

function update(key, value) {
  emit('update', { ...props.settings, [key]: value })
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(4px);
}

.modal-card {
  width: 380px;
  max-width: 90vw;
  background: linear-gradient(180deg, #1e3068 0%, #0a1438 100%);
  border: 2px solid #4a6bff;
  border-radius: 14px;
  padding: 24px 24px 20px;
  box-shadow: 0 12px 32px rgba(0,0,0,.6);
}

.modal-title {
  font: 800 24px/1 var(--sans);
  color: var(--gold);
  text-align: center;
  margin-bottom: 20px;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.setting-label {
  font: 600 13px/1 var(--sans);
  color: var(--text-dim);
  flex-shrink: 0;
}

.slider-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.slider {
  width: 130px;
  accent-color: #4dd6ff;
  cursor: pointer;
}
.slider-val {
  font: 600 12px/1 var(--sans);
  color: var(--text-dim);
  min-width: 24px;
  text-align: right;
}

.radio-group {
  display: flex;
  gap: 4px;
}
.radio-btn {
  padding: 4px 12px;
  border-radius: 5px;
  background: rgba(74,107,255,.15);
  border: 1px solid rgba(74,107,255,.3);
  font: 600 12px/1 var(--sans);
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s ease;
}
.radio-btn.active {
  background: #4a6bff;
  border-color: #4a6bff;
  color: #fff;
}

.toggle-btn {
  width: 42px;
  height: 24px;
  border-radius: 12px;
  background: rgba(74,107,255,.3);
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;
}
.toggle-btn.on {
  background: #4a6bff;
}
.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s ease;
}
.toggle-btn.on .toggle-knob {
  transform: translateX(18px);
}

.close-btn {
  width: 100%;
  font-size: 15px;
}
</style>
