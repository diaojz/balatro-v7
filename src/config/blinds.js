// v7.11：10 关盲注 = 4 个 Ante × 3 关（第 4 Ante 只有终极 BOSS 1 关）
export const BLINDS = [
  // ===== Ante 1 =====
  { id: 'a1-small', name: '小盲注',     target: 300,   icon: '🔵', ante: 1 },
  { id: 'a1-big',   name: '中盲注',     target: 500,   icon: '🟡', ante: 1 },
  { id: 'a1-boss',  name: '大盲注',     target: 800,   icon: '🔴', ante: 1 },
  // ===== Ante 2 =====
  { id: 'a2-small', name: '小盲注',     target: 1200,  icon: '🔵', ante: 2 },
  { id: 'a2-big',   name: '中盲注',     target: 1800,  icon: '🟡', ante: 2 },
  { id: 'a2-boss',  name: '大盲注',     target: 3000,  icon: '🔴', ante: 2 },
  // ===== Ante 3 =====
  { id: 'a3-small', name: '小盲注',     target: 4500,  icon: '🔵', ante: 3 },
  { id: 'a3-big',   name: '中盲注',     target: 7000,  icon: '🟡', ante: 3 },
  { id: 'a3-boss',  name: '大盲注',     target: 11000, icon: '🔴', ante: 3 },
  // ===== Ante 4 终极 BOSS（单关） =====
  { id: 'a4-final', name: '终极 BOSS',  target: 18000, icon: '👹', ante: 4 },
]

export const TOTAL_BLINDS = BLINDS.length // 10
export const TOTAL_ANTES  = 4

// 通关奖励 = 5 + 剩余手数 + ante 加成（ante 越大奖励越多，鼓励高轮次）
export function calcReward(handsLeft, ante = 1) {
  return 5 + handsLeft + (ante - 1) * 2 // Ante1=5+H, Ante2=7+H, Ante3=9+H, Ante4=11+H
}
