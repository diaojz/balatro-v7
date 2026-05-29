<template>
  <!-- 背景遮罩：点击关闭 -->
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <h2 class="modal-title">📖 游戏规则</h2>

      <div class="rules-scroll">
        <!-- 1. 一句话目标 -->
        <section class="rule-sec">
          <h3 class="rule-h3">🎯 怎么算赢</h3>
          <p class="rule-p">
            从手里选牌打出去，凑成扑克牌型来得分。
            每一关都有一个<b>目标分</b>，在出牌次数用完前把分数刷到目标分，就算过关。
            连续通关 <b>10 关盲注</b>（共 4 个底注），打穿最后的「终极 Boss」即胜利。
            出牌次数用完还没到目标分，则失败。
          </p>
        </section>

        <!-- 2. 每关的资源 -->
        <section class="rule-sec">
          <h3 class="rule-h3">🃏 每一关你有什么</h3>
          <ul class="rule-ul">
            <li><b>8 张</b>手牌</li>
            <li><b>4 次</b>出牌机会（每次出 1～5 张）</li>
            <li><b>3 次</b>弃牌机会（不喜欢的牌可以丢掉重抽，不消耗出牌次数）</li>
          </ul>
        </section>

        <!-- 3. 计分公式 -->
        <section class="rule-sec">
          <h3 class="rule-h3">🧮 一手牌怎么算分</h3>
          <p class="formula">（牌型筹码 + 所有出牌点数之和）× 牌型倍率 → 再依次套用小丑牌</p>
          <p class="rule-note">
            点数计算：A = 11，K / Q / J / 10 = 10，其余按数字本身（如 7 = 7）。
          </p>
        </section>

        <!-- 4. 牌型表 -->
        <section class="rule-sec">
          <h3 class="rule-h3">🏆 牌型 & 基础分（筹码 × 倍率）</h3>
          <table class="rule-table">
            <thead>
              <tr><th>牌型</th><th>筹码</th><th>倍率</th></tr>
            </thead>
            <tbody>
              <tr v-for="h in handTypes" :key="h.name">
                <td>{{ h.name }}</td>
                <td class="num chips">{{ h.chips }}</td>
                <td class="num mult">×{{ h.mult }}</td>
              </tr>
            </tbody>
          </table>
          <p class="rule-note">同花 / 顺子 / 同花顺需正好出 5 张牌才成立。</p>
        </section>

        <!-- 5. 盲注表 -->
        <section class="rule-sec">
          <h3 class="rule-h3">🎰 10 关盲注 & 目标分</h3>
          <table class="rule-table">
            <thead>
              <tr><th>底注</th><th>盲注</th><th>目标分</th></tr>
            </thead>
            <tbody>
              <tr v-for="b in blinds" :key="b.id">
                <td class="num">{{ b.ante }}</td>
                <td>{{ b.name }}</td>
                <td class="num target">{{ b.target.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- 6. 小丑牌 -->
        <section class="rule-sec">
          <h3 class="rule-h3">🤡 小丑牌（Joker）</h3>
          <p class="rule-p">
            每关通过后进入<b>商店</b>，每次随机出现 {{ shopCount }} 张小丑牌可购买。
            小丑牌最多带 <b>{{ maxJokers }}</b> 张，它们会在计分时<b>按从左到右的顺序</b>依次生效。
            带越多、组合越好，分数滚得越快。
          </p>
          <ul class="rule-ul joker-list">
            <li v-for="j in jokers" :key="j.id">
              <span class="dot" :style="{ background: rarityColor[j.rarity] }"></span>
              <b>{{ j.name }}</b>　<span class="j-desc">{{ j.description }}</span>
              <span class="j-price">${{ j.price }}</span>
            </li>
          </ul>
        </section>

        <!-- 7. 金币 -->
        <section class="rule-sec">
          <h3 class="rule-h3">💰 金币从哪来</h3>
          <p class="rule-p">
            通关有奖励：<b>5 + 剩余出牌次数 + 底注加成</b>（底注越高加成越多）。
            金币用来在商店买小丑牌；卖掉小丑牌也能回点金币。
          </p>
        </section>
      </div>

      <button class="px-btn px-btn-skip close-btn" @click="$emit('close')">明白了</button>
    </div>
  </div>
</template>

<script setup>
import { BLINDS } from '../config/blinds.js'
import { JOKERS, RARITY_COLOR } from '../config/jokers.js'
import { MAX_JOKERS, SHOP_JOKER_COUNT } from '../config/constants.js'

defineEmits(['close'])

// 牌型表：数值与 src/utils/poker.js 的 identifyHand 保持一致，按强度从高到低
const handTypes = [
  { name: '同花顺', chips: 100, mult: 8 },
  { name: '四条',   chips: 60,  mult: 7 },
  { name: '葫芦',   chips: 40,  mult: 4 },
  { name: '同花',   chips: 35,  mult: 4 },
  { name: '顺子',   chips: 30,  mult: 4 },
  { name: '三条',   chips: 30,  mult: 3 },
  { name: '两对',   chips: 20,  mult: 2 },
  { name: '对子',   chips: 10,  mult: 2 },
  { name: '高牌',   chips: 5,   mult: 1 },
]

const blinds = BLINDS
const jokers = JOKERS
const rarityColor = RARITY_COLOR
const maxJokers = MAX_JOKERS
const shopCount = SHOP_JOKER_COUNT
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(4px);
}

.modal-card {
  width: 460px;
  max-width: 92vw;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1e3068 0%, #0a1438 100%);
  border: 2px solid #4a6bff;
  border-radius: 14px;
  padding: 24px 24px 20px;
  box-shadow: 0 12px 32px rgba(0,0,0,.6);
}

.modal-title {
  font: 800 24px/1 var(--sans);
  color: var(--gold);
  text-align: center;
  margin-bottom: 18px;
  flex-shrink: 0;
}

.rules-scroll {
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;
}
/* 滚动条 Balatro 风 */
.rules-scroll::-webkit-scrollbar { width: 8px; }
.rules-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.2); border-radius: 4px; }
.rules-scroll::-webkit-scrollbar-thumb { background: rgba(74,107,255,.5); border-radius: 4px; }
.rules-scroll::-webkit-scrollbar-thumb:hover { background: rgba(74,107,255,.8); }

.rule-sec { margin-bottom: 20px; }
.rule-sec:last-child { margin-bottom: 4px; }

.rule-h3 {
  font: 800 15px/1 var(--sans);
  color: #ffd166;
  margin-bottom: 8px;
  letter-spacing: .5px;
}

.rule-p {
  font: 500 13px/1.7 var(--sans);
  color: var(--text-dim);
  margin: 0;
}
.rule-p b { color: #fff; }

.rule-ul {
  margin: 0;
  padding-left: 18px;
  font: 500 13px/1.7 var(--sans);
  color: var(--text-dim);
}
.rule-ul b { color: #fff; }

.rule-note {
  font: 500 11.5px/1.5 var(--sans);
  color: var(--muted);
  margin: 6px 0 0;
}

.formula {
  font: 700 13px/1.6 var(--sans);
  color: #4dd6ff;
  text-align: center;
  background: rgba(77,214,255,.08);
  border: 1px solid rgba(77,214,255,.25);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0;
}

.rule-table {
  width: 100%;
  border-collapse: collapse;
  font: 600 12.5px/1 var(--sans);
}
.rule-table th {
  text-align: left;
  color: var(--muted);
  font-weight: 700;
  padding: 6px 8px;
  border-bottom: 1px solid rgba(74,107,255,.3);
}
.rule-table td {
  color: var(--text-dim);
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.rule-table .num {
  font-family: 'VT323', monospace;
  font-size: 16px;
  text-align: right;
}
.rule-table th:nth-child(2),
.rule-table th:nth-child(3) { text-align: right; }
.rule-table .chips { color: #4dd6ff; }
.rule-table .mult  { color: var(--red); }
.rule-table .target { color: var(--gold); }

.joker-list {
  list-style: none;
  padding: 0;
  margin-top: 6px;
}
.joker-list li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,.06);
  line-height: 1.4;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.joker-list b { color: #fff; flex-shrink: 0; }
.j-desc { color: var(--muted); flex: 1; }
.j-price {
  font: 700 13px/1 'VT323', monospace;
  color: var(--money);
  flex-shrink: 0;
}

.close-btn {
  width: 100%;
  font-size: 15px;
  margin-top: 16px;
  flex-shrink: 0;
}
</style>
