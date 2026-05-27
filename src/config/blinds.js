// 3 关盲注 - 硬锁定
export const BLINDS = [
  { id: 'small', name: '小盲注', target: 300, icon: '🔵' },
  { id: 'big',   name: '中盲注', target: 500, icon: '🟡' },
  { id: 'boss',  name: '大盲注', target: 800, icon: '🔴' },
]

// 通关奖励 = 5 + 剩余手数
export function calcReward(handsLeft) {
  return 5 + handsLeft
}
