import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingStore = defineStore('setting', () => {
  const inputMode = ref('roman') // 'roman' | 'kana'
  const isSoundEnabled = ref(false)
  const isDarkMode = ref(false)
  const isStreakMode = ref(false)

  // 检测系统主题
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
  
  // 应用主题
  const applyTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
    }
  }

  // 从本地存储加载设置
  const loadSettings = () => {
    const savedSound = localStorage.getItem('jtype-sound-enabled')
    const savedTheme = localStorage.getItem('jtype-dark-mode')
    
    if (savedSound !== null) {
      isSoundEnabled.value = savedSound === 'true'
    }
    
    // 如果没有保存的主题设置，则跟随系统
    if (savedTheme === null) {
      isDarkMode.value = prefersDark.matches
    } else {
      isDarkMode.value = savedTheme === 'true'
    }
    
    // 立即应用主题
    applyTheme(isDarkMode.value)
  }

  // 监听系统主题变化
  prefersDark.addEventListener('change', (e) => {
    // 只有在没有本地存储的情况下才跟随系统
    if (localStorage.getItem('jtype-dark-mode') === null) {
      isDarkMode.value = e.matches
      applyTheme(e.matches)
    }
  })

  // 监听设置变化并保存
  watch(isSoundEnabled, (val) => {
    localStorage.setItem('jtype-sound-enabled', val.toString())
  })

  watch(isDarkMode, (val) => {
    localStorage.setItem('jtype-dark-mode', val.toString())
    applyTheme(val)
  })

  // 初始化加载设置
  loadSettings()

  return {
    inputMode,
    isSoundEnabled,
    isDarkMode,
    isStreakMode,
    toggleSound() {
      this.isSoundEnabled = !this.isSoundEnabled
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
    },
    toggleStreak() {
      this.isStreakMode = !this.isStreakMode
    },
    setInputMode(mode) {
      this.inputMode = mode
    },
  }
}) 