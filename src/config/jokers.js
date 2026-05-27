// 6 张 Joker 候选库 - 字段硬锁定
// effect 签名: (cards, chips, mult, handTypeName) => ({ chips, mult })
// matchCards 签名 (v7.26 新增): (cards, handTypeName) => card.id[] — 返回触发本 Joker 的牌 id，用于命中特效
// cards: 出牌数组，每张 { id, suit, rank }
// v7.29：art 从 emoji 改为 Balatro 像素风官方截图（src/assets/jokers/*.jpg）

import jokerArt from '../assets/jokers/joker.jpg'
import scholarArt from '../assets/jokers/scholar.jpg'
import heartLoverArt from '../assets/jokers/heart_lover.jpg'
import clubLoverArt from '../assets/jokers/club_lover.jpg'
import royalHeadArt from '../assets/jokers/royal_head.jpg'
import straightFlushMasterArt from '../assets/jokers/straight_flush_master.jpg'

export const JOKERS = [
  {
    id: 'joker',
    name: '小丑',
    rarity: 'common',
    price: 3,
    art: jokerArt,
    description: '每手 +4 倍率',
    effect: (_cards, chips, mult, _handTypeName) => ({ chips, mult: mult + 4 }),
    matchCards: (cards) => cards.map(c => c.id),
  },
  {
    id: 'scholar',
    name: '学者',
    rarity: 'common',
    price: 3,
    art: scholarArt,
    description: '每张 A：+4 倍率',
    effect: (cards, chips, mult, _handTypeName) => {
      const aces = cards.filter(c => c.rank === 'A').length
      return { chips, mult: mult + aces * 4 }
    },
    matchCards: (cards) => cards.filter(c => c.rank === 'A').map(c => c.id),
  },
  {
    id: 'heart_lover',
    name: '红心收藏家',
    rarity: 'rare',
    price: 5,
    art: heartLoverArt,
    description: '含 ♥ 时倍率 ×4',
    effect: (cards, chips, mult, _handTypeName) => {
      const hasHeart = cards.some(c => c.suit === '♥')
      return { chips, mult: hasHeart ? mult * 4 : mult }
    },
    matchCards: (cards) => cards.filter(c => c.suit === '♥').map(c => c.id),
  },
  {
    id: 'club_lover',
    name: '梅花爱好者',
    rarity: 'rare',
    price: 5,
    art: clubLoverArt,
    description: '含 ♣ 时倍率 ×4',
    effect: (cards, chips, mult, _handTypeName) => {
      const hasClub = cards.some(c => c.suit === '♣')
      return { chips, mult: hasClub ? mult * 4 : mult }
    },
    matchCards: (cards) => cards.filter(c => c.suit === '♣').map(c => c.id),
  },
  {
    id: 'royal_head',
    name: '皇家头牌',
    rarity: 'rare',
    price: 5,
    art: royalHeadArt,
    description: '含 J/Q/K 时倍率 ×10',
    effect: (cards, chips, mult, _handTypeName) => {
      const hasRoyal = cards.some(c => ['J', 'Q', 'K'].includes(c.rank))
      return { chips, mult: hasRoyal ? mult * 10 : mult }
    },
    matchCards: (cards) => cards.filter(c => ['J','Q','K'].includes(c.rank)).map(c => c.id),
  },
  {
    id: 'straight_flush_master',
    name: '同花顺大师',
    rarity: 'legendary',
    price: 8,
    art: straightFlushMasterArt,
    description: '同花顺时 +50 倍率',
    effect: (_cards, chips, mult, handTypeName) => {
      return { chips, mult: handTypeName === '同花顺' ? mult + 50 : mult }
    },
    matchCards: (cards, ht) => ht === '同花顺' ? cards.map(c => c.id) : [],
  },
]

// 按 id 快速查找
export const JOKER_MAP = Object.fromEntries(JOKERS.map(j => [j.id, j]))

// 稀有度颜色
export const RARITY_COLOR = {
  common:    '#6cb4d3',
  uncommon:  '#5bc97a',
  rare:      '#e34b6f',
  legendary: '#b577ff',
}
