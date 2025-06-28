// 假名与罗马音课程树
export const COURSE_TREE = [
  {
    key: 'hiragana',
    title: '五十音 · 平假名',
    children: [
      {
        key: 'hiragana_seion',
        title: '清音',
        children: [
          { key: 'hiragana_a', title: 'あ行', pairs: [['あ','a'],['い','i'],['う','u'],['え','e'],['お','o']] },
          { key: 'hiragana_ka', title: 'か行', pairs: [['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko']] },
          { key: 'hiragana_sa', title: 'さ行', pairs: [['さ','sa'],['し','shi'],['す','su'],['せ','se'],['そ','so']] },
          { key: 'hiragana_ta', title: 'た行', pairs: [['た','ta'],['ち','chi'],['つ','tsu'],['て','te'],['と','to']] },
          { key: 'hiragana_na', title: 'な行', pairs: [['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no']] },
          { key: 'hiragana_ha', title: 'は行', pairs: [['は','ha'],['ひ','hi'],['ふ','fu'],['へ','he'],['ほ','ho']] },
          { key: 'hiragana_ma', title: 'ま行', pairs: [['ま','ma'],['み','mi'],['む','mu'],['め','me'],['も','mo']] },
          { key: 'hiragana_ya', title: 'や行', pairs: [['や','ya'],['ゆ','yu'],['よ','yo']] },
          { key: 'hiragana_ra', title: 'ら行', pairs: [['ら','ra'],['り','ri'],['る','ru'],['れ','re'],['ろ','ro']] },
          { key: 'hiragana_wa', title: 'わ行', pairs: [['わ','wa'],['を','wo'],['ん','n']] },
        ],
      },
    ],
  },
  {
    key: 'katakana',
    title: '五十音 · 片假名',
    children: [
      {
        key: 'katakana_seion',
        title: '清音',
        children: [
          { key: 'katakana_a', title: 'ア行', pairs: [['ア','a'],['イ','i'],['ウ','u'],['エ','e'],['オ','o']] },
          { key: 'katakana_ka', title: 'カ行', pairs: [['カ','ka'],['キ','ki'],['ク','ku'],['ケ','ke'],['コ','ko']] },
          { key: 'katakana_sa', title: 'サ行', pairs: [['サ','sa'],['シ','shi'],['ス','su'],['セ','se'],['ソ','so']] },
          { key: 'katakana_ta', title: 'タ行', pairs: [['タ','ta'],['チ','chi'],['ツ','tsu'],['テ','te'],['ト','to']] },
          { key: 'katakana_na', title: 'ナ行', pairs: [['ナ','na'],['ニ','ni'],['ヌ','nu'],['ネ','ne'],['ノ','no']] },
          { key: 'katakana_ha', title: 'ハ行', pairs: [['ハ','ha'],['ヒ','hi'],['フ','fu'],['ヘ','he'],['ホ','ho']] },
          { key: 'katakana_ma', title: 'マ行', pairs: [['マ','ma'],['ミ','mi'],['ム','mu'],['メ','me'],['モ','mo']] },
          { key: 'katakana_ya', title: 'ヤ行', pairs: [['ヤ','ya'],['ユ','yu'],['ヨ','yo']] },
          { key: 'katakana_ra', title: 'ラ行', pairs: [['ラ','ra'],['リ','ri'],['ル','ru'],['レ','re'],['ロ','ro']] },
          { key: 'katakana_wa', title: 'ワ行', pairs: [['ワ','wa'],['ヲ','wo'],['ン','n']] },
        ],
      },
    ],
  },
]

// 扁平化树，返回所有叶节点
export function getLeafNodes(tree = COURSE_TREE) {
  const leaves = []
  function dfs(nodes) {
    nodes.forEach((n) => {
      if (n.pairs) leaves.push(n)
      else if (n.children) dfs(n.children)
    })
  }
  dfs(tree)
  return leaves
}

export function getLeafMap() {
  const map = {}
  getLeafNodes().forEach((leaf) => {
    map[leaf.key] = leaf
  })
  return map
}

// 构建 kana -> roman 基础映射（首个罗马音）
export function buildKanaMap() {
  const map = {}
  getLeafNodes().forEach((leaf) => {
    leaf.pairs.forEach(([kana, roma]) => {
      if (!map[kana]) map[kana] = roma
    })
  })
  return map
}

// 获取罗马音候选列表
export function getRomanList(kana) {
  const base = buildKanaMap()[kana] || ''
  const variants = romanVariants[kana] || []
  return [base, ...variants]
}

export const romanVariants = {
  か: ['ca'],
  く: ['cu','qu'],
  こ: ['co'],
  し: ['si'],
  せ: ['ce'],
  ち: ['ti'],
  つ: ['tu'],
  ふ: ['hu'],
  を: ['o'],
  カ: ['ca'],
  ク: ['cu','qu'],
  コ: ['co'],
  シ: ['si'],
  セ: ['ce'],
  チ: ['ti'],
  ツ: ['tu'],
  フ: ['hu'],
  ヲ: ['o'],
} 