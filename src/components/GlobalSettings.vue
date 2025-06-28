<script setup>
import { useSettingStore } from '../store/setting'
import { SoundOutlined, SoundFilled, BulbOutlined, BulbFilled } from '@ant-design/icons-vue'

const setting = useSettingStore()
</script>

<template>
  <div 
    class="global-settings" 
    role="toolbar" 
    aria-label="全局设置"
  >
    <div 
      class="setting-item" 
      @click="setting.toggleSound()"
      role="switch"
      :aria-checked="setting.isSoundEnabled"
      aria-label="音效开关"
    >
      <component 
        :is="setting.isSoundEnabled ? SoundFilled : SoundOutlined"
        :class="{ active: setting.isSoundEnabled }"
        aria-hidden="true"
      />
    </div>
    <div 
      class="setting-item" 
      @click="setting.toggleDarkMode()"
      role="switch"
      :aria-checked="setting.isDarkMode"
      aria-label="深色模式开关"
    >
      <component 
        :is="setting.isDarkMode ? BulbFilled : BulbOutlined"
        :class="{ active: setting.isDarkMode }"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<style scoped>
.global-settings {
  position: fixed;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 12px;
  z-index: 1000;
}

.setting-item {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--bg-overlay);
  backdrop-filter: blur(8px);
  transition: var(--transition-base);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-1);
}

.setting-item:hover {
  background: var(--bg-overlay-hover);
  transform: translateY(-1px);
  border-color: var(--primary-color);
  box-shadow: var(--shadow-2);
}

.setting-item:active {
  transform: translateY(1px);
  box-shadow: var(--shadow-1);
}

:deep(.anticon) {
  font-size: 18px;
  color: var(--text-secondary);
  transition: var(--transition-base);
}

:deep(.anticon.active) {
  color: var(--primary-color);
}

/* 移除焦点样式但保留键盘可访问性 */
.setting-item:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--primary-color);
}

.setting-item:focus:not(:focus-visible) {
  box-shadow: var(--shadow-1);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .global-settings {
    top: 12px;
    right: 12px;
    gap: 8px;
  }

  .setting-item {
    width: 28px;
    height: 28px;
  }

  :deep(.anticon) {
    font-size: 16px;
  }
}
</style> 