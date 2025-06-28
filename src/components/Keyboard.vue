<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  targetKey: {
    type: String,
    default: ''
  },
  pressedKey: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['keyClick'])

// 键盘布局数据
const keyboardLayout = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
]

// 计算每个按键的状态
const getKeyState = (key) => {
  if (!props.targetKey) return 'normal'
  if (key === props.targetKey.toLowerCase()) return 'target'
  if (key === props.pressedKey.toLowerCase()) {
    return key === props.targetKey.toLowerCase() ? 'correct' : 'pressed'
  }
  return 'normal'
}

// 处理按键点击
const handleKeyClick = (key) => {
  if (props.disabled) return
  emit('keyClick', key)
}

// 获取按键的 ARIA 标签
const getAriaLabel = (key, state) => {
  const labels = {
    normal: `键盘按键 ${key}`,
    target: `当前目标按键 ${key}`,
    correct: `正确按键 ${key}`,
    pressed: `已按下的按键 ${key}`
  }
  return labels[state]
}
</script>

<template>
  <div class="keyboard-container">
    <div class="keyboard-wrapper">
      <div class="keyboard-row">
        <div v-for="key in 'qwertyuiop'" :key="key"
          class="key"
          :class="{ target: key === targetKey, pressed: key === pressedKey }"
          @click="$emit('key-click', key)"
          :disabled="disabled"
        >{{ key }}</div>
      </div>
      <div class="keyboard-row">
        <div class="spacer half"></div>
        <div v-for="key in 'asdfghjkl'" :key="key"
          class="key"
          :class="{ target: key === targetKey, pressed: key === pressedKey }"
          @click="$emit('key-click', key)"
          :disabled="disabled"
        >{{ key }}</div>
        <div class="spacer half"></div>
      </div>
      <div class="keyboard-row">
        <div class="spacer"></div>
        <div v-for="key in 'zxcvbnm'" :key="key"
          class="key"
          :class="{ target: key === targetKey, pressed: key === pressedKey }"
          @click="$emit('key-click', key)"
          :disabled="disabled"
        >{{ key }}</div>
        <div class="spacer"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.keyboard-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.keyboard-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--bg-overlay);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.key {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: var(--bg-base);
  cursor: pointer;
  user-select: none;
  text-transform: uppercase;
  transition: all 0.2s ease;
}

.key:hover {
  background: var(--bg-overlay-hover);
}

.key.target {
  background: var(--primary-color);
  color: white;
  transform: scale(1.1);
}

.key.pressed {
  background: var(--bg-overlay-hover);
  transform: scale(0.95);
}

.spacer {
  width: 40px;
}

.spacer.half {
  width: 20px;
}

/* 适配移动端 */
@media (max-width: 768px) {
  .keyboard-wrapper {
    padding: 8px;
    gap: 4px;
  }

  .keyboard-row {
    gap: 4px;
  }

  .key {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .spacer {
    width: 32px;
  }

  .spacer.half {
    width: 16px;
  }
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
  width: 100%;
}

.stat-item {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.progress {
  background-color: #e6f7ff;
  color: #1890ff;
}

.correct {
  background-color: #f6ffed;
  color: #52c41a;
}

.accuracy {
  background-color: #fff2e8;
  color: #fa541c;
}

.speed {
  background-color: #f9f0ff;
  color: #722ed1;
}
</style> 