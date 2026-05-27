// AI 出牌启发式
// 枚举当前手牌所有 1-5 张子集，用 scoring.js 计算得分，选最高的

import { calculateScore } from './scoring.js'

/**
 * 从手牌中枚举所有 C(n,1)..C(n,5) 子集，返回得分最高的子集
 * @param {Array} hand        - 手牌数组，每张 { id, suit, rank }
 * @param {Array} ownedJokers - 持有的 Joker 数组
 * @returns {number[]} 最优子集的 card id 数组
 */
export function aiPickBestSubset(hand, ownedJokers = []) {
  if (hand.length === 0) return []

  // 手牌 ≤ 5 张时直接全选
  if (hand.length <= 5) {
    return hand.map(c => c.id)
  }

  let bestScore = -1
  let bestIds = []

  // 枚举所有 1-5 张子集
  const maxSize = Math.min(5, hand.length)
  for (let size = 1; size <= maxSize; size++) {
    for (const subset of combinations(hand, size)) {
      const { score } = calculateScore(subset, ownedJokers)
      if (score > bestScore) {
        bestScore = score
        bestIds = subset.map(c => c.id)
      }
    }
  }

  return bestIds
}

/**
 * 商店阶段：找性价比最高的 Joker（price 最低的有效 Joker）
 * 简单策略：期望加分估算 = price，选 price 最低
 * @param {Array} shopJokers
 * @param {number} coins
 * @param {number} ownedCount
 * @returns {string|null} jokerId
 */
export function aiSuggestShopBuy(shopJokers, coins, ownedCount) {
  const MAX_JOKERS = 5
  if (ownedCount >= MAX_JOKERS) return null

  // 过滤可购买的
  const buyable = shopJokers.filter(j => !j.sold && coins >= j.price && ownedCount < MAX_JOKERS)
  if (buyable.length === 0) return null

  // 按 price 升序取最便宜的（性价比 = 加成 / price，price 越低性价比越高，简化估算）
  buyable.sort((a, b) => a.price - b.price)
  return buyable[0].id
}

// 工具函数：从数组中取 k 个元素的所有组合
function* combinations(arr, k) {
  if (k === 0) { yield []; return }
  if (k > arr.length) return
  const [first, ...rest] = arr
  for (const combo of combinations(rest, k - 1)) {
    yield [first, ...combo]
  }
  yield* combinations(rest, k)
}
