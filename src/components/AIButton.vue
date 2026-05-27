<template>
  <button
    class="px-btn px-btn-ai"
    :class="{ thinking: isThinking }"
    :disabled="isThinking || disabled"
    @click="handleClick"
  >
    {{ isThinking ? '🤔 AI 思考中…' : label }}
  </button>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  label: { type: String, default: '🤖 AI 出牌' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['ai-play'])

const isThinking = ref(false)

function handleClick() {
  if (isThinking.value || props.disabled) return
  isThinking.value = true
  // 800ms 思考动画后触发事件，父组件再延迟 200ms 调 handlePlay
  setTimeout(() => {
    isThinking.value = false
    emit('ai-play')
  }, 800)
}

// 允许父组件外部重置思考态
function resetThinking() {
  isThinking.value = false
}

defineExpose({ resetThinking })
</script>

<style scoped>
/* 样式继承全局 .px-btn-ai，此处无需额外覆盖 */
</style>
