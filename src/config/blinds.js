// v7.16：对齐 Balatro 官方术语 — 三种盲注名「小盲注 / 大盲注 / Boss盲注」（不是 小/中/大）
// v7.17：icon 从 emoji 改为德州扑克筹码 variant（蓝/黄/红/紫黑）
// 一个底注（Ante）= 3 个盲注；v7 自定义第 4 底注只 1 关「终极 Boss」
export const BLINDS = [
  // ===== 底注 1 =====
  { id: 'a1-small', name: '小盲注',     target: 300,   chip: 'blue',   ante: 1 },
  { id: 'a1-big',   name: '大盲注',     target: 500,   chip: 'yellow', ante: 1 },
  { id: 'a1-boss',  name: 'Boss 盲注', target: 800,   chip: 'red',    ante: 1 },
  // ===== 底注 2 =====
  { id: 'a2-small', name: '小盲注',     target: 1200,  chip: 'blue',   ante: 2 },
  { id: 'a2-big',   name: '大盲注',     target: 1800,  chip: 'yellow', ante: 2 },
  { id: 'a2-boss',  name: 'Boss 盲注', target: 3000,  chip: 'red',    ante: 2 },
  // ===== 底注 3 =====
  { id: 'a3-small', name: '小盲注',     target: 4500,  chip: 'blue',   ante: 3 },
  { id: 'a3-big',   name: '大盲注',     target: 7000,  chip: 'yellow', ante: 3 },
  { id: 'a3-boss',  name: 'Boss 盲注', target: 11000, chip: 'red',    ante: 3 },
  // ===== 底注 4 终极（v7 自定义单关） =====
  { id: 'a4-final', name: '终极 Boss',  target: 18000, chip: 'boss',   ante: 4 },
]

export const TOTAL_BLINDS = BLINDS.length // 10
export const TOTAL_ANTES  = 4

// 通关奖励 = 5 + 剩余手数 + ante 加成（ante 越大奖励越多，鼓励高轮次）
export function calcReward(handsLeft, ante = 1) {
  return 5 + handsLeft + (ante - 1) * 2 // Ante1=5+H, Ante2=7+H, Ante3=9+H, Ante4=11+H
}
