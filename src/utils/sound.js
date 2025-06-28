// 音效管理器
class SoundManager {
  constructor() {
    this.enabled = true
    this.audioCache = new Map()
    this.audioContext = null
    this.wrongBuffer = null
    this.currentAudio = null // 添加当前正在播放的音频引用
    
    // 初始化音频上下文
    this.init()
  }

  init() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) {
        console.warn('当前环境不支持 Web Audio API')
        return
      }
      
      this.audioContext = new AudioContext()
      
      // 生成错误音效（高音短叮声）
      this.generateWrongSound()
    } catch (error) {
      console.warn('音效初始化失败:', error)
    }
  }

  async generateWrongSound() {
    try {
      const duration = 0.1 // 持续时间 100ms
      const sampleRate = this.audioContext.sampleRate
      const numSamples = duration * sampleRate
      const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate)
      const data = buffer.getChannelData(0)

      // 生成一个衰减的正弦波
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate
        // 1760Hz（高音A）
        data[i] = Math.sin(2 * Math.PI * 1760 * t) * Math.exp(-15 * t)
      }

      this.wrongBuffer = buffer
    } catch (error) {
      console.warn('生成错误音效失败:', error)
    }
  }

  async playSound(buffer) {
    if (!this.audioContext || !buffer) return
    
    try {
      // 如果上下文被挂起，则恢复
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      
      // 添加增益节点来控制音量
      const gainNode = this.audioContext.createGain()
      gainNode.gain.value = 0.3 // 设置音量为 30%
      
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      source.start()
    } catch (error) {
      console.warn('播放音效失败:', error)
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled
  }

  async playKana(kana) {
    if (!this.enabled) return
    
    try {
      const romaji = this.kanaToRomaji(kana)
      if (!romaji) {
        console.log('无法找到对应的罗马字:', kana)
        return
      }
      
      // 如果有正在播放的音频，先停止它
      if (this.currentAudio) {
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
      }
      
      let audio = this.audioCache.get(romaji)
      
      if (!audio) {
        const audioPath = new URL(`../assets/audio/${romaji}.mp3`, import.meta.url).href
        console.log('加载音频文件:', audioPath)
        audio = new Audio(audioPath)
        
        // 添加音频事件监听
        audio.addEventListener('loadeddata', () => {
          console.log('音频加载成功:', romaji)
        })
        
        audio.addEventListener('error', (e) => {
          console.error('音频加载失败:', romaji, e.target.error)
        })
        
        audio.addEventListener('play', () => {
          console.log('开始播放音频:', romaji)
        })
        
        audio.addEventListener('ended', () => {
          console.log('音频播放结束:', romaji)
          if (this.currentAudio === audio) {
            this.currentAudio = null
          }
        })
        
        this.audioCache.set(romaji, audio)
      }
      
      try {
        // 更新当前播放的音频引用
        this.currentAudio = audio
        audio.currentTime = 0 // 确保从头开始播放
        await audio.play()
      } catch (error) {
        console.error('音频播放失败:', error)
        // 尝试重新加载并播放
        audio.load()
        await audio.play()
      }
    } catch (error) {
      console.error('播放假名音效时出错:', error)
    }
  }

  async playCorrect() {
    if (!this.enabled) return
    // 可以添加正确答案的音效
  }

  async playWrong() {
    if (!this.enabled) return
    await this.playSound(this.wrongBuffer)
  }

  // 将假名转换为罗马字
  kanaToRomaji(kana) {
    const kanaMap = {
      // 平假名-清音
      'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
      'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
      'さ': 'sa', 'し': 'si', 'す': 'su', 'せ': 'se', 'そ': 'so',
      'た': 'ta', 'ち': 'ci', 'つ': 'cu', 'て': 'te', 'と': 'to',
      'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
      'は': 'ha', 'ひ': 'hi', 'ふ': 'hu', 'へ': 'he', 'ほ': 'ho',
      'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
      'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
      'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
      'わ': 'wa', 'を': 'wo', 'ん': 'n',
      
      // 平假名-浊音
      'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
      'ざ': 'za', 'じ': 'zi', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
      'だ': 'da', 'ぢ': 'di', 'づ': 'du', 'で': 'de', 'ど': 'do',
      'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
      
      // 平假名-半浊音
      'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
      
      // 平假名-拗音
      'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
      'しゃ': 'sya', 'しゅ': 'syu', 'しょ': 'syo',
      'ちゃ': 'cya', 'ちゅ': 'cyu', 'ちょ': 'cyo',
      'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
      'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
      'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
      'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
      'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
      'じゃ': 'zya', 'じゅ': 'zyu', 'じょ': 'zyo',
      'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
      'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',

      // 片假名-清音
      'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
      'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
      'サ': 'sa', 'シ': 'si', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
      'タ': 'ta', 'チ': 'ci', 'ツ': 'cu', 'テ': 'te', 'ト': 'to',
      'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
      'ハ': 'ha', 'ヒ': 'hi', 'フ': 'hu', 'ヘ': 'he', 'ホ': 'ho',
      'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
      'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
      'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
      'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n',
      
      // 片假名-浊音
      'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
      'ザ': 'za', 'ジ': 'zi', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
      'ダ': 'da', 'ヂ': 'di', 'ヅ': 'du', 'デ': 'de', 'ド': 'do',
      'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
      
      // 片假名-半浊音
      'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
      
      // 片假名-拗音
      'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
      'シャ': 'sya', 'シュ': 'syu', 'ショ': 'syo',
      'チャ': 'cya', 'チュ': 'cyu', 'チョ': 'cyo',
      'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
      'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
      'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
      'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
      'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
      'ジャ': 'zya', 'ジュ': 'zyu', 'ジョ': 'zyo',
      'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
      'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo'
    }
    
    return kanaMap[kana]
  }
}

// 创建单例实例
export const soundManager = new SoundManager() 