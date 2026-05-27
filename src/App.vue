<template>
  <div class="game-root">
    <!-- 左 sidebar -->
    <SideBar
      :blind-index="blindIndex"
      :blind="currentBlind"
      :blind-score="blindScore"
      :hands-left="handsLeft"
      :discards-left="discardsLeft"
      :coins="coins"
      :round="round"
      :hand-name="lastHandName"
      :hand-chips="lastChips"
      :hand-mult="lastMult"
      @restart="handleRestart"
      ref="sideBarRef"
    />

    <!-- 右主区：3 段 grid，不加 padding-right -->
    <div class="main-area">
      <!-- 第 1 段：Joker 区 -->
      <JokerArea
        :owned-jokers="ownedJokers"
        :triggering-ids="triggeringJokerIds"
        ref="jokerAreaRef"
      />

      <!-- 第 2 段：出牌区（含 DeckPile absolute） -->
      <PlayArea
        :played-cards="playedCards"
        :hand-name="lastHandName"
        :deck-count="deck.length"
        :show-formula="settings.showFormula"
        :preview-chips="previewChips"
        :preview-mult="previewMult"
        :preview-score="previewScore"
        :highlighting-idx="highlightingIdx"
        :fly-texts="flyTexts"
        :show-formula-overlay="showFormulaOverlay"
        :formula-chips="formulaChips"
        :formula-mult="formulaMult"
        :formula-score="formulaScore"
        ref="playAreaRef"
      />

      <!-- 第 3 段：手牌 + 按钮 -->
      <HandArea
        :hand="hand"
        :selected-ids="selectedIds"
        :discards-left="discardsLeft"
        :game-state="gameState"
        :ai-auto-mode="settings.aiAutoMode"
        @toggle-select="toggleSelect"
        @play="handlePlay"
        @discard="handleDiscard"
        @sort-by-rank="sortByRank"
        @sort-by-suit="sortBySuit"
        @ai-play="handleAIPlay"
        @toggle-auto="toggleAiAutoMode"
        ref="handAreaRef"
      />
    </div>

    <!-- v7.2 关卡切换 toast -->
    <Transition name="blind-toast">
      <div v-if="blindToastText" class="blind-toast">{{ blindToastText }}</div>
    </Transition>

    <!-- 设置浮按钮 -->
    <SettingsButton @open="showSettings = true" />

    <!-- 设置 Modal -->
    <SettingsModal
      v-if="showSettings"
      :settings="settings"
      @close="showSettings = false"
      @update="handleSettingsUpdate"
    />

    <!-- 商店覆盖层 -->
    <ShopView
      v-if="gameState === 'shop'"
      :shop-jokers="shopJokers"
      :coins="coins"
      :owned-jokers="ownedJokers"
      :blind-index="blindIndex"
      :ai-highlight-id="shopAIHighlight"
      @buy="handleBuy"
      @skip="handleSkip"
      @ai-suggest="handleAISuggest"
    />

    <!-- 结束覆盖层 -->
    <EndView
      v-if="gameState === 'won' || gameState === 'lost'"
      :state="gameState"
      :blind-index="blindIndex"
      :coins="coins"
      :owned-jokers="ownedJokers"
      @restart="handleRestart"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import SideBar from './components/SideBar.vue'
import JokerArea from './components/JokerArea.vue'
import PlayArea from './components/PlayArea.vue'
import HandArea from './components/HandArea.vue'
import SettingsButton from './components/SettingsButton.vue'
import SettingsModal from './components/SettingsModal.vue'
import ShopView from './components/ShopView.vue'
import EndView from './components/EndView.vue'

import { BLINDS, calcReward, TOTAL_BLINDS, TOTAL_ANTES } from './config/blinds.js'
import { JOKERS } from './config/jokers.js'
import { HAND_SIZE, STARTING_HANDS, STARTING_DISCARDS, MAX_JOKERS } from './config/constants.js'
import { calculateScore, getCardValue } from './utils/scoring.js'
import { identifyHand } from './utils/poker.js'
import { loadSettings, saveSettings, applyAnimScale } from './utils/settings.js'
import { aiPickBestSubset, aiSuggestShopBuy } from './utils/ai.js'

// ===== 组件 refs =====
const sideBarRef = ref(null)
const jokerAreaRef = ref(null)
const playAreaRef = ref(null)
const handAreaRef = ref(null)

// ===== 游戏状态 =====
const gameState = ref('playing')
const blindIndex = ref(0)
const round = ref(1)
const blindScore = ref(0)
const handsLeft = ref(STARTING_HANDS)
const discardsLeft = ref(STARTING_DISCARDS)
const coins = ref(0)
const ownedJokers = ref([])
const shopJokers = ref([])

// 牌堆与手牌
const deck = ref([])
const hand = ref([])
const selectedIds = ref(new Set())
const playedCards = ref([])

// 计分展示
const lastHandName = ref('')
const lastChips = ref(0)
const lastMult = ref(0)

// Joker 触发动画
const triggeringJokerIds = ref([])

// 动效状态
const highlightingIdx = ref(-1)
const flyTexts = ref([])
const showFormulaOverlay = ref(false)
const formulaChips = ref(0)
const formulaMult = ref(0)
const formulaScore = ref(0)

// 商店 AI 高亮
const shopAIHighlight = ref(null)

// 设置
const settings = ref(loadSettings())
const showSettings = ref(false)

// v7.2 关卡切换 toast（v7.11：含 Ante 信息）
const blindToastText = ref('')
let blindToastTimer = null
function showBlindToast() {
  const blind = BLINDS[blindIndex.value]
  if (!blind) return
  blindToastText.value = `底注 ${blind.ante} · 第 ${blindIndex.value + 1}/${TOTAL_BLINDS} 关 · ${blind.name} · 目标 ${blind.target}`
  if (blindToastTimer) clearTimeout(blindToastTimer)
  blindToastTimer = setTimeout(() => { blindToastText.value = '' }, 2000)
}

// 计分预估（出牌区公式预览）
const previewChips = computed(() => {
  if (selectedIds.value.size === 0) return 0
  const selected = hand.value.filter(c => selectedIds.value.has(c.id))
  const { chips } = calculateScore(selected, ownedJokers.value)
  return chips
})
const previewMult = computed(() => {
  if (selectedIds.value.size === 0) return 0
  const selected = hand.value.filter(c => selectedIds.value.has(c.id))
  const { mult } = calculateScore(selected, ownedJokers.value)
  return mult
})
const previewScore = computed(() => previewChips.value * previewMult.value)

const currentBlind = computed(() => BLINDS[blindIndex.value])

// ===== 工具函数 =====
function getAnimScale() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--anim-scale') || '1')
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms * getAnimScale()))
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ===== 牌组生成 =====
function createDeck() {
  const suits = ['♠', '♥', '♦', '♣']
  const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']
  let id = Date.now() * 1000 + Math.floor(Math.random() * 1000)
  const d = []
  for (const suit of suits) {
    for (const rank of ranks) {
      d.push({ id: id++, suit, rank })
    }
  }
  return d
}

// ===== 发牌（从牌堆飞入手牌槽位）=====
// v7.1 修：dealing 期间真牌 opacity:0（CSS），飞牌 clone 完成时清 dealing 让真牌淡入
//        → 同一张牌不再同时存在「真牌槽位 + 飞牌 clone」两处
async function dealCards(count) {
  const drawn = []
  for (let i = 0; i < count && deck.value.length > 0; i++) {
    const card = deck.value.pop()
    drawn.push({ ...card, dealing: true })
  }

  // 获取牌堆位置（飞行起点）
  await nextTick()
  let deckRect = null
  const deckPileRef = playAreaRef.value?.deckPileRef
  if (deckPileRef?.pileEl) {
    deckRect = deckPileRef.pileEl.getBoundingClientRect()
  }

  // 错峰 60ms 逐张加入手牌
  for (let i = 0; i < drawn.length; i++) {
    const card = drawn[i]
    await new Promise(resolve => setTimeout(resolve, i * 60))
    hand.value.push(card)

    await nextTick()
    const cardId = card.id

    // 飞入动画：动画 onfinish 时清 dealing → 真牌淡入显示
    if (deckRect) {
      const cardEl = handAreaRef.value?.cardRefs?.[cardId]
      if (cardEl) {
        const targetRect = cardEl.getBoundingClientRect()
        animateFlyCard(deckRect, targetRect, cardId)
        continue
      }
    }

    // fallback：没飞牌 clone 时直接显示真牌
    const idx = hand.value.findIndex(c => c.id === cardId)
    if (idx !== -1) hand.value[idx] = { ...hand.value[idx], dealing: false }
  }

  // v7.2：await 所有飞牌完成 + v7.4 自动按点降序排序（大牌在左 A→2）
  if (drawn.length > 0) {
    const totalDuration = (drawn.length - 1) * 60 + 400 * getAnimScale() + 80
    await new Promise(r => setTimeout(r, totalDuration))
    hand.value = [...hand.value].sort((a, b) => RANK_ORDER.indexOf(b.rank) - RANK_ORDER.indexOf(a.rank))
  }
}

// 从 fromRect 飞到 toRect（纯 DOM clone + Web Animations）
// v7.1：第 3 参 cardId 用于飞行完成时清对应卡的 dealing 标记
function animateFlyCard(fromRect, toRect, cardId = null) {
  const clone = document.createElement('div')
  clone.style.cssText = `
    position: fixed;
    left: ${fromRect.left}px;
    top: ${fromRect.top}px;
    width: ${fromRect.width}px;
    height: ${fromRect.height}px;
    background: linear-gradient(135deg, #6b3ec9 0%, #4a2599 50%, #2d0d6e 100%);
    border: 2px solid #1a0f24;
    border-radius: 8px;
    pointer-events: none;
    z-index: 999;
    box-shadow: 0 4px 8px rgba(0,0,0,.5);
  `
  document.body.appendChild(clone)

  const dx = toRect.left - fromRect.left
  const dy = toRect.top - fromRect.top
  const scaleX = toRect.width / fromRect.width
  const scaleY = toRect.height / fromRect.height
  const dur = 400 * getAnimScale()

  const anim = clone.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 0.9 },
    { transform: `translate(${dx}px,${dy}px) scale(${scaleX},${scaleY})`, opacity: 1 },
  ], { duration: dur, easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)', fill: 'forwards' })

  anim.onfinish = () => {
    clone.remove()
    // v7.1：飞牌结束 → 清 dealing 让真牌淡入
    if (cardId !== null) {
      const idx = hand.value.findIndex(c => c.id === cardId)
      if (idx !== -1) hand.value[idx] = { ...hand.value[idx], dealing: false }
    }
  }
}

// ===== 初始化 =====
function initGame() {
  isPlaying = false
  deck.value = shuffle(createDeck())
  hand.value = []
  selectedIds.value = new Set()
  playedCards.value = []
  blindScore.value = 0
  handsLeft.value = STARTING_HANDS
  discardsLeft.value = STARTING_DISCARDS
  coins.value = 0
  ownedJokers.value = []
  blindIndex.value = 0
  round.value = 1
  gameState.value = 'playing'
  lastHandName.value = ''
  lastChips.value = 0
  lastMult.value = 0
  triggeringJokerIds.value = []
  highlightingIdx.value = -1
  flyTexts.value = []
  showFormulaOverlay.value = false
  shopAIHighlight.value = null
  dealCards(HAND_SIZE)
  // v7.2：第 1 关开始 toast
  showBlindToast()
}

// ===== 选牌 =====
function toggleSelect(cardId) {
  if (gameState.value !== 'playing') return
  const s = new Set(selectedIds.value)
  if (s.has(cardId)) {
    s.delete(cardId)
  } else {
    if (s.size < 5) s.add(cardId)
  }
  selectedIds.value = s
}

// ===== 排序 =====
const RANK_ORDER = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
const SUIT_ORDER = ['♠','♥','♦','♣']

// v7.4：按点排序改为降序（大牌在左，A K Q J 10 ... 2）
function sortByRank() {
  hand.value = [...hand.value].sort((a, b) => RANK_ORDER.indexOf(b.rank) - RANK_ORDER.indexOf(a.rank))
  selectedIds.value = new Set()
}
function sortBySuit() {
  hand.value = [...hand.value].sort((a, b) => {
    const si = SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit)
    if (si !== 0) return si
    return RANK_ORDER.indexOf(b.rank) - RANK_ORDER.indexOf(a.rank) // 同花色内大牌在左
  })
  selectedIds.value = new Set()
}

// ===== 出牌（完整动画时间线 PRD §5.1）=====
let isPlaying = false

async function handlePlay() {
  if (gameState.value !== 'playing') return
  if (isPlaying) return
  const selected = hand.value.filter(c => selectedIds.value.has(c.id))
  if (selected.length === 0) return

  isPlaying = true

  // 步骤 1：选中牌移出手牌区，放入 playedCards（飞向出牌区）
  hand.value = hand.value.filter(c => !selectedIds.value.has(c.id))
  selectedIds.value = new Set()
  lastHandName.value = ''
  lastChips.value = 0
  lastMult.value = 0
  highlightingIdx.value = -1
  flyTexts.value = []

  playedCards.value = selected
  await delay(350)

  // 步骤 2：识别牌型，显示初始 chips/mult（牌型基础值）
  const handType = identifyHand(selected)
  lastHandName.value = handType.name
  let currentChips = handType.chips
  let currentMult = handType.mult
  lastChips.value = currentChips
  lastMult.value = currentMult
  flyTexts.value = new Array(selected.length).fill(null)

  await delay(200)

  // 步骤 3：逐张高亮，chips 累加 + 飞字
  for (let i = 0; i < selected.length; i++) {
    highlightingIdx.value = i
    const cardVal = getCardValue(selected[i].rank)
    currentChips += cardVal
    lastChips.value = currentChips

    // 每张牌上方飞出蓝色 +N
    const newFlyTexts = new Array(selected.length).fill(null)
    newFlyTexts[i] = `+${cardVal}`
    flyTexts.value = newFlyTexts
    await delay(150)
  }
  flyTexts.value = new Array(selected.length).fill(null)
  highlightingIdx.value = -1

  await delay(100)

  // 步骤 4：逐 Joker 触发
  for (const joker of ownedJokers.value) {
    if (typeof joker.effect !== 'function') continue
    const before = { chips: currentChips, mult: currentMult }
    const res = joker.effect(selected, currentChips, currentMult, handType.name)
    currentChips = res.chips
    currentMult = res.mult

    if (res.chips !== before.chips || res.mult !== before.mult) {
      triggeringJokerIds.value = [joker.id]
      lastChips.value = currentChips
      lastMult.value = currentMult

      // Joker 飞字（红色 mult 增量）
      const deltaMult = currentMult - before.mult
      const deltaChips = currentChips - before.chips
      spawnJokerFlyText(joker.id, deltaChips, deltaMult, before.mult, currentMult)

      await delay(800)
      triggeringJokerIds.value = []
      await delay(100)
    }
  }

  // 步骤 5：公式爆出
  formulaChips.value = currentChips
  formulaMult.value = currentMult
  formulaScore.value = currentChips * currentMult
  showFormulaOverlay.value = true

  // 步骤 6：blindScore 累加（SideBar 内部 RAF 数字插值）
  blindScore.value += formulaScore.value
  handsLeft.value -= 1

  await delay(800)
  showFormulaOverlay.value = false
  lastHandName.value = ''
  lastChips.value = 0
  lastMult.value = 0

  await delay(200)

  // 步骤 7：清出牌区，补牌飞入
  playedCards.value = []
  flyTexts.value = []
  await nextTick()
  await dealCards(Math.min(selected.length, deck.value.length))

  isPlaying = false

  // 步骤 8：判断通关/失败
  if (blindScore.value >= currentBlind.value.target) {
    const reward = calcReward(handsLeft.value, currentBlind.value.ante)
    coins.value += reward
    await delay(400)
    // 终极 BOSS（最后一关）通关 → won，不进商店
    if (blindIndex.value >= BLINDS.length - 1) {
      gameState.value = 'won'
    } else {
      enterShop()
    }
    return
  }

  if (handsLeft.value <= 0) {
    await delay(400)
    gameState.value = 'lost'
  }
}

// Joker 飞字：在 Joker 卡上方动态插入 DOM 元素
function spawnJokerFlyText(jokerId, deltaChips, deltaMult, beforeMult, afterMult) {
  const jokerEl = jokerAreaRef.value?.jokerRefs?.[jokerId]
  if (!jokerEl) return

  const rect = jokerEl.getBoundingClientRect()
  const el = document.createElement('div')

  let text = ''
  if (deltaMult !== 0) {
    // 判断是乘法还是加法（before.mult > 0 且结果不等于 before.mult + deltaMult 则是乘法）
    const isMultiply = beforeMult > 0 && Math.abs(afterMult - (beforeMult + deltaMult)) > 0.01
    if (isMultiply) {
      text = `×${(afterMult / beforeMult).toFixed(0)}`
    } else {
      text = `+${deltaMult} Mult`
    }
  } else if (deltaChips !== 0) {
    text = `+${deltaChips}`
  }
  if (!text) return

  const animScale = getAnimScale()
  el.textContent = text
  // v7.14：Joker 飞字缩到 28px + 位置贴卡顶下方（不溢出 viewport），不再遮挡 Joker 卡名/描述
  // Joker 段高 250，卡贴段底，卡顶 y ≈ 50px。飞字 48px 太大遮挡卡顶 + 飘出 viewport
  // 现在飞字 28px + top 设为卡顶 + 4（贴卡 name-bar 上方），仅短上飞
  const safeTop = Math.max(rect.top - 24, 4)
  el.style.cssText = `
    position: fixed;
    left: ${rect.left + rect.width / 2}px;
    top: ${safeTop}px;
    transform: translateX(-50%);
    font: 900 28px/1 Inter, sans-serif;
    letter-spacing: 1.5px;
    color: #ff8844;
    pointer-events: none;
    z-index: 999;
    text-shadow:
      -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000,
      0 0 12px rgba(255,136,68,1), 0 0 24px rgba(255,136,68,.7);
    white-space: nowrap;
    animation: flyTextUp ${0.7 * animScale}s ease-out forwards;
  `
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 700 * animScale)
}

// ===== 弃牌 =====
async function handleDiscard() {
  if (gameState.value !== 'playing') return
  if (discardsLeft.value <= 0) return
  const selected = hand.value.filter(c => selectedIds.value.has(c.id))
  if (selected.length === 0) return

  hand.value = hand.value.filter(c => !selectedIds.value.has(c.id))
  selectedIds.value = new Set()
  discardsLeft.value -= 1

  await delay(200)
  await dealCards(Math.min(selected.length, deck.value.length))
}

// ===== AI 出牌 =====
async function handleAIPlay() {
  if (gameState.value !== 'playing') return
  if (isPlaying) return

  const bestIds = aiPickBestSubset(hand.value, ownedJokers.value)
  selectedIds.value = new Set(bestIds)

  // 200ms 后自动出牌，让用户看到选中态
  await new Promise(resolve => setTimeout(resolve, 200))
  await handlePlay()
}

// ===== 进商店 =====
function enterShop() {
  const available = JOKERS.filter(j => !ownedJokers.value.find(o => o.id === j.id))
  shopJokers.value = shuffle(available).slice(0, Math.min(3, available.length)).map(j => ({
    ...j,
    sold: false,
  }))
  shopAIHighlight.value = null
  gameState.value = 'shop'
}

// ===== 商店：AI 建议 =====
function handleAISuggest() {
  const id = aiSuggestShopBuy(shopJokers.value, coins.value, ownedJokers.value.length)
  shopAIHighlight.value = id
}

// ===== 商店：购买 =====
function handleBuy(jokerId) {
  if (ownedJokers.value.length >= MAX_JOKERS) return
  const jokerDef = shopJokers.value.find(j => j.id === jokerId)
  if (!jokerDef || jokerDef.sold) return
  if (coins.value < jokerDef.price) return

  coins.value -= jokerDef.price
  const fullDef = JOKERS.find(j => j.id === jokerId)
  ownedJokers.value = [...ownedJokers.value, fullDef]
  jokerDef.sold = true
  shopAIHighlight.value = null
}

// ===== 商店：跳过（v7.3 改 async 让 AI 全自动循环能 await 等发牌完成） =====
async function handleSkip() {
  const nextIndex = blindIndex.value + 1
  if (nextIndex >= BLINDS.length) {
    gameState.value = 'won'
    return
  }
  blindIndex.value = nextIndex
  round.value += 1
  blindScore.value = 0
  handsLeft.value = STARTING_HANDS
  discardsLeft.value = STARTING_DISCARDS
  lastHandName.value = ''
  lastChips.value = 0
  lastMult.value = 0
  playedCards.value = []
  highlightingIdx.value = -1
  flyTexts.value = []

  deck.value = shuffle(createDeck())
  hand.value = []
  selectedIds.value = new Set()
  gameState.value = 'playing'
  // v7.2：新一关开始 toast（第 2 / 第 3 关）
  showBlindToast()
  await dealCards(HAND_SIZE) // 等所有牌发完
}

// ===== 重新开始 =====
function handleRestart() {
  initGame()
}

// ===== 设置 =====
function handleSettingsUpdate(newSettings) {
  settings.value = newSettings
  saveSettings(newSettings)
  applyAnimScale(newSettings.animSpeed)
}

// v7.7：手牌区右侧 AI 全自动 toggle 快捷开关（跟设置面板 aiAutoMode 同步）
function toggleAiAutoMode() {
  const next = { ...settings.value, aiAutoMode: !settings.value.aiAutoMode }
  settings.value = next
  saveSettings(next)
}

// ===== v7.3 AI 全自动托管：while loop 不暂停 + 每手充足停顿让用户看清动效 =====
// 节奏：起手 800ms → 出牌（含动画 ~3s）→ 出完停 1.4s 看结果 → 下一手
//       商店停 2s 让看清 → 自动跳过 → 下一关
//       won/lost 自动退出循环
let aiAutoBusy = false
async function aiAutoStep() {
  if (!settings.value.aiAutoMode) return
  if (aiAutoBusy) return
  aiAutoBusy = true

  try {
    while (settings.value.aiAutoMode) {
      // 起步停顿：让用户看清状态切换
      await new Promise(r => setTimeout(r, 800))
      if (!settings.value.aiAutoMode) break

      // 上一手还没结束 → 等一下
      if (isPlaying) {
        await new Promise(r => setTimeout(r, 400))
        continue
      }

      if (gameState.value === 'playing' && hand.value.length > 0) {
        await handleAIPlay()
        // 出完一手停 1.4s 让玩家看清计分公式 + Joker 触发 + blindScore 跳动
        await new Promise(r => setTimeout(r, 1400))
      } else if (gameState.value === 'shop') {
        // v7.5：商店分 3 段动画让用户看清
        // 1) 停 1s 让用户看清商店内容（3 张 Joker + 价格）
        await new Promise(r => setTimeout(r, 1000))
        if (!settings.value.aiAutoMode) break

        // 2) AI 决定买哪张 → 高亮 → 等 800ms → 购买
        const buyId = aiSuggestShopBuy(shopJokers.value, coins.value, ownedJokers.value.length)
        if (buyId) {
          shopAIHighlight.value = buyId
          await new Promise(r => setTimeout(r, 900))
          if (!settings.value.aiAutoMode) break
          handleBuy(buyId)
          // 看购买动画（卡变"已售出" + 金币扣减 + Joker 进槽位）
          await new Promise(r => setTimeout(r, 900))
        }

        // 3) 跳过商店
        if (settings.value.aiAutoMode && gameState.value === 'shop') {
          await handleSkip()
          await new Promise(r => setTimeout(r, 800))
        }
      } else {
        // won / lost → 退出循环
        break
      }
    }
  } finally {
    aiAutoBusy = false
  }
}

// watch aiAutoMode 开启 + gameState 重置（重新开始）→ 触发 AI 步骤
watch(() => settings.value.aiAutoMode, (newVal) => {
  if (newVal) aiAutoStep()
})
watch(gameState, (newState, oldState) => {
  if (settings.value.aiAutoMode && newState === 'playing' && oldState !== 'playing') {
    aiAutoStep()
  }
})

onMounted(() => {
  applyAnimScale(settings.value.animSpeed)
  initGame()
})
</script>

<style scoped>
.game-root {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
}

.main-area {
  flex: 1;
  display: grid;
  /* v7.18：HandArea 段 280→300 容纳 padding-bottom 28 的底部呼吸空间 */
  grid-template-rows: 250px 1fr 300px;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
}

/* v7.3 关卡切换 toast — 居中于右主区（不是 viewport），避开左 sidebar 视觉偏左 */
.blind-toast {
  position: fixed;
  top: 30%;
  /* sidebar 占 min(28vw, 480px)，右主区中心 ≈ sidebar 宽度 + (剩余宽度 / 2) ≈ 50% + sidebar/2 */
  left: calc(50% + min(14vw, 240px));
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, rgba(255,209,102,.95), rgba(245,158,11,.95));
  color: #1a1a1a;
  font: 900 28px/1.2 'Inter', 'PingFang SC', sans-serif;
  padding: 22px 48px;
  border-radius: 16px;
  border: 3px solid #ffd166;
  box-shadow: 0 16px 40px rgba(0,0,0,.55), 0 0 40px rgba(255,209,102,.7);
  z-index: 150;
  pointer-events: none;
  white-space: nowrap;
  letter-spacing: 2px;
  text-shadow: 0 2px 0 rgba(255,255,255,.4);
}
.blind-toast-enter-active {
  animation: blindToastIn .4s cubic-bezier(.34,1.56,.64,1);
}
.blind-toast-leave-active {
  animation: blindToastOut .3s ease;
}
@keyframes blindToastIn {
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.4) rotate(-3deg); }
  60%  { opacity: 1; transform: translate(-50%, -50%) scale(1.08) rotate(1deg); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0); }
}
@keyframes blindToastOut {
  0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.15); }
}
</style>
