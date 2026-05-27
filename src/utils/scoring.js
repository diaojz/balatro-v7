// 计分逻辑
// 公式：(handType.chips + 所有出牌点数和) × handType.mult，再按 ownedJokers 顺序依次应用 effect

import { identifyHand } from './poker.js'

const CARD_VALUES = {
  'A': 11, 'K': 10, 'Q': 10, 'J': 10,
  '2': 2, '3': 3, '4': 4, '5': 5,
  '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
}

export function getCardValue(rank) {
  return CARD_VALUES[rank] ?? parseInt(rank, 10) ?? 0
}

/**
 * 计算出牌得分
 * @param {Array} cards       - 出牌数组，每张 { suit, rank }
 * @param {Array} ownedJokers - 玩家持有的 Joker 对象数组（含 effect 函数），按槽位顺序
 * @returns {{ score, chips, mult, handName, handType, triggeredJokerIds, jokerDeltas }}
 */
export function calculateScore(cards, ownedJokers = []) {
  const handType = identifyHand(cards)
  const cardSum = cards.reduce((sum, c) => sum + getCardValue(c.rank), 0)

  let chips = handType.chips + cardSum
  let mult = handType.mult

  const triggeredJokerIds = []
  // 记录每张 Joker 的增量（用于飞字动画）
  const jokerDeltas = []

  for (const joker of ownedJokers) {
    if (typeof joker.effect === 'function') {
      const before = { chips, mult }
      const result = joker.effect(cards, chips, mult, handType.name)
      chips = result.chips
      mult = result.mult

      const deltaChips = chips - before.chips
      const deltaMult = mult - before.mult
      const multRatio = before.mult > 0 ? mult / before.mult : 1

      if (deltaChips !== 0 || deltaMult !== 0) {
        triggeredJokerIds.push(joker.id)
        jokerDeltas.push({
          jokerId: joker.id,
          deltaChips,
          deltaMult,
          multRatio,
          // 判断是加法还是乘法
          isMultiply: deltaMult !== 0 && before.mult > 0 && mult !== before.mult + deltaMult,
        })
      }
    }
  }

  const score = chips * mult

  return {
    score,
    chips,
    mult,
    handName: handType.name,
    handType,
    triggeredJokerIds,
    jokerDeltas,
    cardSum,
    baseChips: handType.chips,
    baseMult: handType.mult,
  }
}
