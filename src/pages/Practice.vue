<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { COURSE_TREE, getLeafNodes, getLeafMap, buildKanaMap, getRomanList } from '../data/kana'
import { useSettingStore } from '../store/setting'
import {
  Button,
  Tag,
  Typography,
  Input,
  Radio,
  Drawer,
  Switch,
  InputNumber
} from 'ant-design-vue'
import Keyboard from '../components/Keyboard.vue'
import { soundManager } from '../utils/sound'

const { Title, Text } = Typography
const { Group: RadioGroup, Button: RadioButton } = Radio

// 课程选择
const STORAGE_KEY = 'selectedCourses'
const selected = ref([])
const isMobile = ref(window.innerWidth < 768)
const drawerOpen = ref(false)
const drawerWidth = computed(() => isMobile.value ? '80%' : '260px')

// 移动端虚拟键盘处理
const isKeyboardVisible = ref(false)
const keyboardHeight = ref(0)

// 监听虚拟键盘
function handleVisualViewportResize() {
  if (!isMobile.value) return
  const viewport = window.visualViewport
  if (!viewport) return

  const isKeyboard = viewport.height < window.innerHeight
  isKeyboardVisible.value = isKeyboard
  if (isKeyboard) {
    keyboardHeight.value = window.innerHeight - viewport.height
    // 调整内容区域的底部边距
    document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight.value}px`)
  } else {
    keyboardHeight.value = 0
    document.documentElement.style.removeProperty('--keyboard-height')
  }
}

// 监听抽屉状态变化
watch(drawerOpen, (newVal) => {
  console.log('抽屉状态变化:', newVal)
})

// 处理抽屉打开
function handleDrawerOpen() {
  drawerOpen.value = true
  // 禁止背景滚动
  document.body.style.overflow = 'hidden'
}

// 处理抽屉关闭
function handleDrawerClose() {
  drawerOpen.value = false
  // 恢复背景滚动
  document.body.style.overflow = ''
}

// 监听窗口大小变化
function handleResize() {
  const oldIsMobile = isMobile.value
  isMobile.value = window.innerWidth < 768
  
  // 如果从移动端切换到桌面端,关闭抽屉
  if (!isMobile.value && oldIsMobile && drawerOpen.value) {
    handleDrawerClose()
  }
}

const leafMap = getLeafMap()

const POOL = computed(()=>{
  let pairs=[]
  if(selected.value.length){
    selected.value.forEach(k=>{const leaf=leafMap[k];if(leaf)pairs.push(...leaf.pairs)})
  }else{
    pairs = getLeafNodes().flatMap(n=>n.pairs)
  }
  return pairs.map(p=>p[0])
})

const kanaMap = buildKanaMap()

const kanjiMap = {
  // 平假名
  'あ': '安', 'い': '以', 'う': '宇', 'え': '衣', 'お': '於',
  'か': '加', 'き': '機', 'く': '久', 'け': '計', 'こ': '己',
  'さ': '左', 'し': '之', 'す': '寸', 'せ': '世', 'そ': '曾',
  'た': '太', 'ち': '知', 'つ': '川', 'て': '天', 'と': '止',
  'な': '奈', 'に': '仁', 'ぬ': '奴', 'ね': '祢', 'の': '乃',
  'は': '波', 'ひ': '比', 'ふ': '不', 'へ': '部', 'ほ': '保',
  'ま': '末', 'み': '美', 'む': '武', 'め': '女', 'も': '毛',
  'や': '也', 'ゆ': '由', 'よ': '与',
  'ら': '良', 'り': '利', 'る': '留', 'れ': '礼', 'ろ': '吕',
  'わ': '和', 'を': '遠', 'ん': '无',
  
  // 片假名
  'ア': '阿', 'イ': '伊', 'ウ': '宇', 'エ': '江', 'オ': '於',
  'カ': '加', 'キ': '機', 'ク': '久', 'ケ': '介', 'コ': '己',
  'サ': '散', 'シ': '之', 'ス': '須', 'セ': '世', 'ソ': '曾',
  'タ': '多', 'チ': '千', 'ツ': '川', 'テ': '天', 'ト': '止',
  'ナ': '奈', 'ニ': '仁', 'ヌ': '奴', 'ネ': '祢', 'ノ': '乃',
  'ハ': '八', 'ヒ': '比', 'フ': '不', 'ヘ': '部', 'ホ': '保',
  'マ': '末', 'ミ': '三', 'ム': '牟', 'メ': '女', 'モ': '毛',
  'ヤ': '也', 'ユ': '由', 'ヨ': '與',
  'ラ': '良', 'リ': '利', 'ル': '流', 'レ': '礼', 'ロ': '吕',
  'ワ': '和', 'ヲ': '乎', 'ン': '尔'
}

function getKanjiForKana(kana) {
  return kanjiMap[kana] || '—'
}

const setting = useSettingStore()
const modeOptions = [
  { label: '罗马字输入', value: 'roman' },
  { label: '假名输入', value: 'kana' },
]

const currentKey = ref('')
const isWrong = ref(false)
const practiceCount = ref(24)
const autoRestartTimer = ref(null) // 添加定时器引用

// 处理练习数量变化
function handlePracticeCountChange(value) {
  console.log('输入值:', value, typeof value)
  // 如果是事件对象,则获取目标值
  if (value && value.target) {
    value = value.target.value
  }
  
  let num = parseInt(value)
  console.log('解析后:', num, typeof num)
  
  if (isNaN(num) || num < 1) {
    num = 1
  } else if (num > 100) {
    num = 100
  }
  
  practiceCount.value = num
  
  // 自动更新练习
  if (POOL.value.length) {
    restart()
  }
}

// 处理输入框按键事件
function handleInputKeydown(e) {
  // 允许数字键、退格键、删除键、方向键、Tab键
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab']
  if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
    e.preventDefault()
  }
}

// 处理输入框步进
function handleStep(step) {
  const newValue = practiceCount.value + step
  if (newValue >= 1 && newValue <= 100) {
    practiceCount.value = newValue
    // 自动更新练习
    if (POOL.value.length) {
      restart()
    }
  }
}

// 生成题目
function genChars(len = practiceCount.value) {
  const pool = POOL.value
  return Array.from({ length: len }, () => pool[Math.floor(Math.random() * pool.length)])
}

const chars = ref([])
const results = ref([]) // null | true | false
const idx = ref(0)
const buffer = ref('') // 当前罗马字前缀
const correct = ref(0)
const attempts = ref(0)
const finished = ref(false)
const start = ref(0)
const textInput = ref('')

function restart() {
  if(!POOL.value.length) return
  
  // 清除自动重新开始的定时器
  if (autoRestartTimer.value) {
    clearTimeout(autoRestartTimer.value)
    autoRestartTimer.value = null
  }
  
  chars.value = genChars(practiceCount.value)
  results.value = Array(chars.value.length).fill(null)
  idx.value = 0
  buffer.value = ''
  correct.value = 0
  attempts.value = 0
  finished.value = false
  start.value = Date.now()
}

async function handleKey(e) {
  if (finished.value) return
  if (setting.inputMode !== 'roman') return
  const k = e.key.toLowerCase()
  if (!/^[a-z]$/.test(k)) return // 只处理字母

  currentKey.value = k
  buffer.value += k
  const target = chars.value[idx.value]
  const options = getRomanList(target)

  const isPrefix = options.some((r) => r.startsWith(buffer.value))
  const isComplete = options.some((r) => r === buffer.value)

  if (!isPrefix) {
    // 错误
    results.value[idx.value] = false
    buffer.value = ''
    attempts.value += 1
    soundManager.playWrong()
    showWrongAnimation()
    return
  }

  if (isComplete) {
    results.value[idx.value] = true
    correct.value += 1
    attempts.value += 1
    idx.value += 1
    buffer.value = ''
    console.log('尝试播放假名音效:', target)
    await soundManager.playKana(target) // 播放当前假名的音效
    if (idx.value >= chars.value.length) {
      finished.value = true
    }
  }
}

async function handleInput(e) {
  if (finished.value) return
  if (setting.inputMode !== 'kana') return
  
  const input = textInput.value
  if (!input) return

  const target = chars.value[idx.value]
  if (input === target) {
    results.value[idx.value] = true
    correct.value += 1
    attempts.value += 1
    idx.value += 1
    textInput.value = ''
    console.log('尝试播放假名音效:', target)
    await soundManager.playKana(target) // 播放当前假名的音效
    if (idx.value >= chars.value.length) {
      finished.value = true
    }
  } else if (input.length >= target.length) {
    results.value[idx.value] = false
    attempts.value += 1
    textInput.value = ''
    soundManager.playWrong()
    showWrongAnimation()
  }
}

const accuracy = computed(() => (attempts.value ? Math.round((correct.value / attempts.value) * 100) : 100))
const wpm = computed(() => {
  if (!finished.value && correct.value === 0) return 0
  const minutes = (Date.now() - start.value) / 60000
  return Math.max(1, Math.round(correct.value / minutes))
})

// 当前目标假名及罗马音展示
const currentKana = computed(() => (idx.value < chars.value.length ? chars.value[idx.value] : ''))
const currentRoman = computed(() => {
  const k = currentKana.value
  if (!k) return ''
  return getRomanList(k)[0] // 取首个罗马音作为展示
})

function toggleCourse(key){
  if(selected.value.includes(key)){
    selected.value = selected.value.filter(k=>k!==key)
  }else{
    selected.value = [...selected.value, key]
  }
}

function startPractice(){} // no longer needed

watch(selected, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  restart()
}, {deep:true})

// restore
const saved = localStorage.getItem(STORAGE_KEY)
if (saved) {
  try { selected.value = JSON.parse(saved) } catch {}
}

onMounted(() => {
  console.log('组件挂载完成')

  window.addEventListener('keydown', handleKey)
  window.addEventListener('resize', handleResize)
  
  // 移动端虚拟键盘监听
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleVisualViewportResize)
  }
})

// 显示错误动画
function showWrongAnimation() {
  isWrong.value = true
  setTimeout(() => {
    isWrong.value = false
  }, 200)
}

// 获取当前目标按键
const targetKey = computed(() => {
  if (!currentRoman.value || !setting.inputMode === 'roman') return ''
  return currentRoman.value[buffer.value.length] || ''
})

onBeforeUnmount(() => {
  if (autoRestartTimer.value) {
    clearTimeout(autoRestartTimer.value)
    autoRestartTimer.value = null
  }
  
  window.removeEventListener('keydown', handleKey)
  window.removeEventListener('resize', handleResize)
  
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleVisualViewportResize)
  }
  
  // 确保恢复body的overflow
  document.body.style.overflow = ''
})

// 监听音效设置变化
watch(() => setting.isSoundEnabled, (newValue) => {
  soundManager.setEnabled(newValue)
}, { immediate: true })

// 处理键盘点击
function handleKeyboardClick(key) {
  if (finished.value) return
  if (setting.inputMode !== 'roman') return
  
  // 模拟键盘事件
  handleKey({ key: key })
}

// 监听练习完成状态
watch(finished, (newVal) => {
  if (newVal) {
    // 显示完成信息
    const accuracy = attempts.value ? Math.round((correct.value / attempts.value) * 100) : 0
    const message = `练习完成！\n正确率：${accuracy}%\n尝试次数：${attempts.value}`
    console.log(message)
    
    // 3秒后自动重新开始
    autoRestartTimer.value = setTimeout(() => {
      if (autoRestartTimer.value) { // 检查定时器是否还存在（没有被手动重启清除）
        restart()
      }
    }, 3000)
  }
})
</script>

<template>
  <div class="practice-container" :class="{ 'keyboard-visible': isKeyboardVisible }">
    <!-- Left: practice -->
    <section class="card practice-section">
      <!-- top details -->
      <div v-if="chars.length" class="kana-details">
        <div class="kana-box" :class="{ wrong: isWrong }">
          <span class="kana-text">{{ currentKana }}</span>
        </div>
        <div class="kana-info">
          <div class="info-row">
            <span class="info-label">罗马字:</span>
            <b>{{ currentRoman }}</b>
          </div>
          <div class="info-row">
            <span class="info-label">汉字的草书:</span>
            <b>{{ getKanjiForKana(currentKana) }}</b>
          </div>
        </div>
      </div>

      <div v-if="!chars.length" class="empty-hint">请在右侧选择至少一个课程行</div>

      <!-- 题目显示 -->
      <div v-if="chars.length" class="char-display">
        <span
          v-for="(c,i) in chars"
          :key="i"
          class="char-item"
          :class="{
            'correct': i < idx,
            'current': i === idx,
            'wrong': results[i]===false
          }"
        >
          <div>{{ c }}</div>
          <small class="char-hint">{{ kanaMap[c] }}</small>
        </span>
      </div>

      <!-- 完成信息显示 -->
      <div v-if="finished" class="completion-info">
        <div class="completion-message">
          <h3>练习完成！</h3>
          <p>正确率：{{ attempts ? Math.round((correct / attempts) * 100) : 0 }}%</p>
          <p>尝试次数：{{ attempts }}</p>
          <p class="auto-restart-hint">3秒后自动重新开始...</p>
        </div>
        <button class="restart-button" @click="restart">立即重新开始</button>
      </div>

      <!-- 当前输入缓冲显示 / 输入框 -->
      <div class="input-area">
        <div v-if="setting.inputMode==='roman'" class="roman-input">
          <template v-if="currentRoman">
            <span 
              v-for="(ch,i) in currentRoman.split('')" 
              :key="i" 
              class="roman-char"
              :class="{
                'typed': i < buffer.length,
                'current': i === buffer.length,
                'remaining': i > buffer.length
              }"
            >{{ ch }}</span>
          </template>
        </div>
        <Input
          v-if="setting.inputMode==='kana'"
          id="practice-input"
          v-model:value="textInput"
          @input="handleInput"
          size="large"
          class="kana-input"
          placeholder="输入假名"
          role="textbox"
          aria-label="假名输入框"
        />

        <!-- 输入模式切换 -->
        <div class="input-mode-switch" role="group" aria-label="输入模式选择">
          <RadioGroup 
            v-model:value="setting.inputMode" 
            button-style="solid"
          >
            <RadioButton 
              value="roman" 
              role="radio" 
              aria-checked="setting.inputMode === 'roman'"
            >罗马字输入</RadioButton>
            <RadioButton 
              value="kana" 
              role="radio" 
              aria-checked="setting.inputMode === 'kana'"
            >假名输入</RadioButton>
          </RadioGroup>

          <!-- 添加练习数量输入框 -->
          <div class="practice-count-input">
            <div class="count-control">
              <button 
                class="step-button" 
                @click="handleStep(-1)"
                :disabled="practiceCount <= 1"
              >-</button>
              <InputNumber
                v-model:value="practiceCount"
                :min="1"
                :max="100"
                size="small"
                style="width: 60px"
                :controls="false"
                @change="handlePracticeCountChange"
                @keydown="handleInputKeydown"
              />
              <button 
                class="step-button" 
                @click="handleStep(1)"
                :disabled="practiceCount >= 100"
              >+</button>
            </div>
            <span class="count-suffix">字</span>
          </div>
        </div>
      </div>

      <!-- 键盘显示 -->
      <Keyboard
        v-if="setting.inputMode === 'roman'"
        :target-key="targetKey"
        :pressed-key="currentKey"
        :disabled="finished"
        @keyClick="handleKeyboardClick"
        class="virtual-keyboard"
      />

      <!-- 统计信息 -->
      <div class="stats-container">
        <div class="stat-item progress">
          进度 {{ idx }}/{{ chars.length }}
        </div>
        <div class="stat-item correct">
          正确 {{ correct }}
        </div>
        <div class="stat-item accuracy">
          准确率 {{ accuracy }}%
        </div>
        <div class="stat-item speed">
          速度 {{ wpm }} WPM
        </div>
      </div>

      <!-- 移动端底部安全区域 -->
      <div class="bottom-safe-area"></div>
    </section>

    <!-- Right: course panel (desktop) -->
    <aside v-if="!isMobile" class="card course-panel">
      <div class="course-list custom-scrollbar">
        <template v-for="top in COURSE_TREE" :key="top.key">
          <div class="course-section">
            <div class="course-title">{{ top.title }}</div>
            <div v-for="mid in top.children" :key="mid.key">
              <div class="course-subtitle">{{ mid.title }}</div>
              <div class="course-buttons">
                <button
                  v-for="leaf in mid.children"
                  :key="leaf.key"
                  class="course-button"
                  :class="{ selected: selected.includes(leaf.key) }"
                  @click="toggleCourse(leaf.key)"
                  role="checkbox"
                  :aria-checked="selected.includes(leaf.key)"
                  :aria-label="'选择课程: ' + leaf.title"
                >{{ leaf.title }}</button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </aside>

    <!-- Mobile drawer button -->
    <Button
      v-if="isMobile"
      type="primary"
      shape="circle"
      class="fab"
      @click="handleDrawerOpen"
      role="button"
      aria-label="打开课程选择"
    >課</Button>

    <!-- 自定义抽屉实现 -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="isMobile && drawerOpen" class="custom-drawer-container">
          <!-- 遮罩层 -->
          <div class="custom-drawer-mask" @click="handleDrawerClose"></div>
          
          <!-- 抽屉内容 -->
          <div class="custom-drawer-content" :style="{ width: drawerWidth }">
            <div class="custom-drawer-header">
              <Typography.Title :level="4" style="margin: 0">课程章节</Typography.Title>
              <Button 
                type="text" 
                @click="handleDrawerClose"
                role="button"
                aria-label="关闭课程选择"
              >
                <span style="font-size: 20px">×</span>
              </Button>
            </div>
            
            <div class="custom-drawer-body">
              <div class="course-list">
                <template v-for="top in COURSE_TREE" :key="top.key">
                  <div class="course-section">
                    <div class="course-title">{{ top.title }}</div>
                    <div v-for="mid in top.children" :key="mid.key">
                      <div class="course-subtitle">{{ mid.title }}</div>
                      <div class="course-buttons">
                        <button
                          v-for="leaf in mid.children"
                          :key="leaf.key"
                          class="course-button"
                          :class="{ selected: selected.includes(leaf.key) }"
                          @click="toggleCourse(leaf.key)"
                          role="checkbox"
                          :aria-checked="selected.includes(leaf.key)"
                          :aria-label="'选择课程: ' + leaf.title"
                        >{{ leaf.title }}</button>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
@import '../styles/practice.css';

/* 自定义单选按钮组样式 */
:deep(.ant-radio-group-solid) {
  .ant-radio-button-wrapper {
    color: #1677ff;
    border-color: #1677ff;
    background: transparent;
    
    &:hover {
      color: #4096ff;
      border-color: #4096ff;
    }
    
    &.ant-radio-button-wrapper-checked {
      color: #ffffff !important;
      background: #1677ff;
      border-color: #1677ff;
      
      &:hover {
        color: #ffffff !important;
        background: #4096ff;
        border-color: #4096ff;
      }

      &:focus-within {
        color: #ffffff !important;
      }
    }

    &:focus-within {
      color: #1677ff;
    }
  }
}

.completion-info {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-overlay);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.completion-message {
  margin-bottom: 1.5rem;
}

.completion-message h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.completion-message p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
}

.auto-restart-hint {
  font-size: 0.9rem;
  color: var(--text-tertiary);
  margin-top: 1rem;
}

.restart-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.restart-button:hover {
  background: var(--primary-color-hover);
}

/* 练习数量输入框样式 */
.practice-count-input {
  display: flex;
  align-items: center;
  gap: 8px;
  
  :deep(.ant-input-number) {
    width: 60px;
    
    .ant-input-number-input {
      text-align: center;
      padding: 0 4px;
      font-size: 14px;
    }
    
    &:hover {
      border-color: var(--primary-color);
    }
    
    &.ant-input-number-focused {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
    }
  }
}
</style> 