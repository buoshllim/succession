<template>
  <div class="board-wrap">

    <!-- 뒤로가기 -->
    <div class="debate-back-row">
      <a href="/succession/list" class="debate-back-link">← 전체 심의 이력</a>
    </div>

    <!-- 회의록 헤더 -->
    <div class="board-minutes">
      <div class="minutes-title">
        <span class="board-icon">🏛️</span>
        <span>승계 이사회 회의록</span>
      </div>

      <table class="minutes-table">
        <tbody>
          <tr>
            <th>회의명</th>
            <td>{{ position }} 후보자 비교 심의</td>
            <th>일시</th>
            <td>{{ date }}{{ time ? ' ' + time.slice(0,2) + ':' + time.slice(2) : '' }}</td>
          </tr>
          <tr>
            <th>의장</th>
            <td>JK (CEO · 이사회 의장)</td>
            <th>참석</th>
            <td>이사 11인</td>
          </tr>
          <tr>
            <th>심의 안건</th>
            <td colspan="3">{{ agenda }}</td>
          </tr>
          <tr v-if="phases && phases.length">
            <th>비즈니스 국면</th>
            <td colspan="3">국면 {{ phases.join('·') }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 후보자 스냅샷 -->
      <div class="minutes-data">
        <div class="data-row" v-for="c in candidates" :key="c.name">
          <span class="data-label">{{ c.name }}</span>
          <span class="data-value">{{ c.current }}</span>
        </div>
      </div>

      <!-- 최종 결의 -->
      <div class="minutes-conclusion">
        <div class="conclusion-label">📋 최종 결의</div>
        <div class="conclusion-body">
          <div class="conclusion-stance ready-now">{{ finalDecision }}</div>
        </div>
        <div class="conclusion-rationale">
          <p>{{ finalComment }}</p>
        </div>
      </div>
    </div>

    <!-- 후보자 준비도 랭킹 -->
    <div class="pd-section">
      <div class="pd-section-title">후보자 준비도</div>

      <!-- 국면 필터 -->
      <div class="pd-phase-filter" v-if="phases && phases.length > 1">
        <span class="pd-filter-label">국면별 랭킹</span>
        <button
          v-for="p in phases" :key="p"
          class="pd-phase-btn"
          :class="{ 'pd-phase-btn--active': selectedPhase === p }"
          @click="selectedPhase = selectedPhase === p ? null : p"
        >국면 {{ p }}</button>
        <button v-if="selectedPhase" class="pd-phase-btn pd-phase-clear" @click="selectedPhase = null">전체</button>
      </div>

      <div class="pd-candidates">
        <div
          v-for="(c, i) in sortedCandidates" :key="c.name"
          class="pd-candidate-card"
          :class="readinessClass(c.readiness)"
        >
          <div class="pd-cand-rank">{{ i + 1 }}</div>
          <div class="pd-cand-body">
            <div class="pd-cand-head">
              <span class="pd-cand-name">{{ c.name }}</span>
              <span class="pd-cand-type">{{ c.type }}</span>
              <span class="pd-readiness-pill" :class="readinessClass(c.readiness)">{{ c.readiness }}</span>
            </div>
            <div class="pd-cand-current">{{ c.current }}</div>
            <div class="pd-readiness-bar-wrap">
              <div class="pd-readiness-bar"><div class="pd-readiness-fill" :style="{ width: Math.round(c.readinessScore * 100) + '%' }"></div></div>
              <span class="pd-readiness-val">{{ Math.round(c.readinessScore * 100) }}%</span>
              <span class="pd-dissension">{{ c.dissension }}</span>
            </div>
            <p class="pd-jk-comment">{{ c.jkComment }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 역량 비교 (스파이더 차트) -->
    <div class="pd-section">
      <div class="pd-section-title">역량 비교</div>
      <div class="pd-radar-toggles">
        <button
          v-for="(c, i) in candidates" :key="c.name"
          class="pd-radar-toggle"
          :class="{ 'pd-radar-toggle--active': selectedCandidates.includes(c.name) }"
          :style="{ '--c-color': COLORS[i % COLORS.length] }"
          @click="toggleCandidate(c.name)"
        >{{ c.name }}</button>
      </div>

      <div class="pd-radar-wrap">
        <svg class="pd-radar-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
          <g>
            <polygon v-for="level in [0.2,0.4,0.6,0.8,1.0]" :key="level"
              :points="gridPolygon(level)" fill="none" stroke="var(--vp-c-divider)" stroke-width="1" />
            <line v-for="(axis, i) in radarAxes" :key="axis.key"
              x1="150" y1="150" :x2="axisPoint(i, 1.0).x" :y2="axisPoint(i, 1.0).y"
              stroke="var(--vp-c-divider)" stroke-width="1" />
          </g>
          <g v-for="(c, ci) in visibleCandidates" :key="c.name">
            <polygon
              :points="candidatePolygon(c)"
              :fill="COLORS[candidates.findIndex(x=>x.name===c.name) % COLORS.length]"
              fill-opacity="0.15"
              :stroke="COLORS[candidates.findIndex(x=>x.name===c.name) % COLORS.length]"
              stroke-width="2"
            />
          </g>
          <text v-for="(axis, i) in radarAxes" :key="axis.key"
            :x="labelPoint(i).x" :y="labelPoint(i).y"
            text-anchor="middle" dominant-baseline="middle" class="radar-label"
          >{{ axis.label }}</text>
        </svg>
      </div>

      <div class="pd-radar-legend">
        <div v-for="(c, i) in candidates" :key="c.name" class="pd-legend-item">
          <span class="pd-legend-dot" :style="{ background: COLORS[i % COLORS.length] }"></span>
          <span :style="{ opacity: selectedCandidates.includes(c.name) ? 1 : 0.4 }">{{ c.name }}</span>
        </div>
      </div>
    </div>

    <!-- 이사회 토론 전문 -->
    <div class="board-chat-header">💬 이사회 토론 전문</div>

    <template v-for="(block, i) in blocks" :key="i">

      <div v-if="block.type === 'section'" class="debate-section-label">{{ block.label }}</div>

      <div v-else-if="block.type === 'bubble'" class="debate-bubble">
        <img class="guru-avatar" :src="boardImg(block.board)" :alt="boardName(block.board)"
             :style="{ borderColor: boardColor(block.board) }" />
        <div class="bubble-body">
          <div class="bubble-meta">
            <strong class="guru-name">{{ boardName(block.board) }}</strong>
            <span v-if="block.stance" class="stance-badge" :class="readinessClass(block.stance)">{{ block.stance }}</span>
            <span v-if="block.changed" class="stance-changed">{{ block.changed === 'up' ? '↑ 상향' : '↓ 하향' }}</span>
          </div>
          <div class="bubble-text">{{ block.text }}</div>
        </div>
      </div>

      <div v-else-if="block.type === 'exchange'" class="debate-exchange">
        <div class="exchange-tension-label">⚡ {{ block.tension }}</div>
        <div v-for="(msg, j) in block.messages" :key="j"
             class="exchange-msg" :class="isChair(msg.speaker) ? 'from-chair' : 'from-guru'">
          <div class="exchange-speaker">
            <template v-if="isChair(msg.speaker)">
              <img class="guru-avatar sm" src="/board/jk.png" alt="JK" style="border-color: #B45309" />
              <span class="chair-badge">👑 JK</span>
            </template>
            <template v-else>
              <img class="guru-avatar sm" :src="boardImg(msg.board ?? '')"
                   :alt="boardName(msg.board ?? '')"
                   :style="{ borderColor: boardColor(msg.board ?? '') }" />
              <strong>{{ msg.speaker }}</strong>
            </template>
            <span v-if="msg.to" class="to-arrow">→ {{ msg.to }}</span>
          </div>
          <div class="exchange-text">{{ msg.text }}</div>
        </div>
      </div>

      <div v-else-if="block.type === 'closing'" class="debate-closing">
        <div class="closing-label">📋 의장 최종 선언</div>
        <div class="closing-body">
          <img class="guru-avatar" src="/board/jk.png" alt="JK" style="border-color: #B45309" />
          <div class="closing-content">
            <div class="closing-meta"><span class="chair-badge">👑 JK (이사회 의장)</span></div>
            <div class="closing-text">{{ block.text }}</div>
          </div>
        </div>
      </div>

    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  position: string
  positionSlug: string
  date: string
  time?: string
  phases?: number[]
  agenda: string
  radarAxes: { key: string; label: string }[]
  candidates: {
    name: string
    type: string
    current: string
    readiness: string
    readinessScore: number
    dissension: string
    radar: Record<string, number>
    jkComment: string
  }[]
  phaseWinner?: Record<number, string>
  finalDecision: string
  finalComment: string
  blocks?: any[]
}>()

const COLORS = ['#0064FF', '#FF6B35', '#22C55E', '#A855F7', '#F59E0B']

const BOARD: Record<string, { name: string; color: string }> = {
  'vision-jensen':     { name: 'Vision · Jensen Huang', color: '#76B900' },
  'scale-bezos':       { name: 'Scale · Jeff Bezos',    color: '#FF9900' },
  'integrity-buffett': { name: 'Integrity · Buffett',   color: '#2563EB' },
  'principles-dalio':  { name: 'Principles · Dalio',    color: '#475569' },
  'transform-nadella': { name: 'Transform · Nadella',   color: '#00A4EF' },
  'innovation-wood':   { name: 'Innovation · Wood',     color: '#8B5CF6' },
  'performance-welch': { name: 'Performance · Welch',   color: '#059669' },
  'inversion-munger':  { name: 'Inversion · Munger',    color: '#D97706' },
  'execution-musk':    { name: 'Execution · Musk',      color: '#EF4444' },
  'lean-sandberg':     { name: 'Lean · Sandberg',       color: '#EC4899' },
}

const boardImg   = (b: string) => `/board/${b}.png`
const boardName  = (b: string) => BOARD[b]?.name  ?? b
const boardColor = (b: string) => BOARD[b]?.color ?? '#6B7280'
const isChair    = (s: string) => s === 'JK' || s === '의장'

function readinessClass(r = '') {
  if (r.includes('Ready Now') || r.includes('🟢')) return 'ready-now'
  if (r.includes('2Y')        || r.includes('🟡')) return 'ready-2y'
  if (r.includes('Not Ready') || r.includes('🔴')) return 'not-ready'
  return ''
}

// 기본 선택: 준비도 상위 2명
const top2 = computed(() =>
  [...props.candidates]
    .sort((a, b) => b.readinessScore - a.readinessScore)
    .slice(0, 2)
    .map(c => c.name)
)
const selectedCandidates = ref<string[]>(top2.value)

function toggleCandidate(name: string) {
  if (selectedCandidates.value.includes(name)) {
    if (selectedCandidates.value.length > 1)
      selectedCandidates.value = selectedCandidates.value.filter(n => n !== name)
  } else {
    selectedCandidates.value = [...selectedCandidates.value, name]
  }
}

const visibleCandidates = computed(() =>
  props.candidates.filter(c => selectedCandidates.value.includes(c.name))
)

const selectedPhase = ref<number | null>(null)
const sortedCandidates = computed(() => {
  const list = [...props.candidates]
  if (selectedPhase.value && props.phaseWinner) {
    const winner = props.phaseWinner[selectedPhase.value]
    list.sort((a, b) => {
      if (a.name === winner) return -1
      if (b.name === winner) return 1
      return b.readinessScore - a.readinessScore
    })
  } else {
    list.sort((a, b) => b.readinessScore - a.readinessScore)
  }
  return list
})

// SVG 스파이더 차트
const CX = 150, CY = 150, R = 95
const axisCount = computed(() => props.radarAxes.length)

function axisAngle(i: number) {
  return (Math.PI * 2 * i) / axisCount.value - Math.PI / 2
}
function axisPoint(i: number, scale: number) {
  return {
    x: CX + R * scale * Math.cos(axisAngle(i)),
    y: CY + R * scale * Math.sin(axisAngle(i)),
  }
}
function gridPolygon(scale: number) {
  return props.radarAxes.map((_, i) => `${axisPoint(i, scale).x},${axisPoint(i, scale).y}`).join(' ')
}
function candidatePolygon(c: typeof props.candidates[0]) {
  return props.radarAxes.map((axis, i) => {
    const val = (c.radar[axis.key] ?? 0) / 100
    return `${axisPoint(i, val).x},${axisPoint(i, val).y}`
  }).join(' ')
}
function labelPoint(i: number) {
  return axisPoint(i, 1.28)
}
</script>
