<template>
  <div class="pd-wrap">

    <!-- 뒤로가기 -->
    <div class="pd-back-row">
      <a href="/succession/list" class="pd-back-link">← 전체 심의 이력</a>
    </div>

    <!-- 헤더 -->
    <div class="pd-header">
      <div class="pd-header-meta">
        <span class="pd-position">{{ position }}</span>
        <span class="pd-date">{{ date }} {{ time ? time.slice(0,2)+':'+time.slice(2) : '' }}</span>
        <span class="pd-phases" v-if="phases && phases.length">
          국면 {{ phases.join('·') }}
        </span>
      </div>
      <h1 class="pd-title">{{ position }} 후보자 심의</h1>
      <p class="pd-agenda">{{ agenda }}</p>
    </div>

    <!-- JK 최종 의결 -->
    <div class="pd-decision">
      <div class="pd-decision-label">👑 JK 의장 최종 의결</div>
      <div class="pd-decision-body">
        <span class="pd-winner">{{ finalDecision }}</span>
      </div>
      <p class="pd-decision-comment">{{ finalComment }}</p>
    </div>

    <!-- 후보자 준비도 랭킹 -->
    <div class="pd-section">
      <div class="pd-section-title">후보자 준비도</div>
      <div class="pd-candidates">
        <!-- 국면 필터 -->
        <div class="pd-phase-filter" v-if="phases && phases.length > 1">
          <span class="pd-filter-label">국면별 랭킹</span>
          <button
            v-for="p in phases"
            :key="p"
            class="pd-phase-btn"
            :class="{ 'pd-phase-btn--active': selectedPhase === p }"
            @click="selectedPhase = selectedPhase === p ? null : p"
          >국면 {{ p }}</button>
          <button v-if="selectedPhase" class="pd-phase-btn pd-phase-clear" @click="selectedPhase = null">전체</button>
        </div>

        <!-- 후보자 카드 (준비도 순) -->
        <div
          v-for="(c, i) in sortedCandidates"
          :key="c.name"
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
              <div class="pd-readiness-bar">
                <div class="pd-readiness-fill" :style="{ width: Math.round(c.readinessScore * 100) + '%' }"></div>
              </div>
              <span class="pd-readiness-val">{{ Math.round(c.readinessScore * 100) }}%</span>
              <span class="pd-dissension">{{ c.dissension }}</span>
            </div>
            <p class="pd-jk-comment">{{ c.jkComment }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 스파이더 차트 비교 -->
    <div class="pd-section">
      <div class="pd-section-title">역량 비교</div>

      <!-- 후보자 토글 -->
      <div class="pd-radar-toggles">
        <button
          v-for="(c, i) in candidates"
          :key="c.name"
          class="pd-radar-toggle"
          :class="{ 'pd-radar-toggle--active': selectedCandidates.includes(c.name) }"
          :style="{ '--c-color': candidateColors[i] }"
          @click="toggleCandidate(c.name)"
        >{{ c.name }}</button>
      </div>

      <!-- SVG 스파이더 차트 -->
      <div class="pd-radar-wrap">
        <svg class="pd-radar-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
          <!-- 배경 그리드 -->
          <g class="radar-grid">
            <polygon
              v-for="level in [0.2, 0.4, 0.6, 0.8, 1.0]"
              :key="level"
              :points="gridPolygon(level)"
              fill="none"
              stroke="var(--vp-c-divider)"
              stroke-width="1"
            />
            <!-- 축 라인 -->
            <line
              v-for="(axis, i) in radarAxes"
              :key="axis.key"
              x1="150" y1="150"
              :x2="axisPoint(i, 1.0).x"
              :y2="axisPoint(i, 1.0).y"
              stroke="var(--vp-c-divider)"
              stroke-width="1"
            />
          </g>

          <!-- 후보자 데이터 폴리곤 -->
          <g v-for="(c, ci) in visibleCandidates" :key="c.name">
            <polygon
              :points="candidatePolygon(c)"
              :fill="candidateColors[candidates.findIndex(x => x.name === c.name)]"
              fill-opacity="0.15"
              :stroke="candidateColors[candidates.findIndex(x => x.name === c.name)]"
              stroke-width="2"
            />
          </g>

          <!-- 축 레이블 -->
          <text
            v-for="(axis, i) in radarAxes"
            :key="axis.key"
            :x="labelPoint(i).x"
            :y="labelPoint(i).y"
            text-anchor="middle"
            dominant-baseline="middle"
            class="radar-label"
          >{{ axis.label }}</text>
        </svg>
      </div>

      <!-- 범례 -->
      <div class="pd-radar-legend">
        <div v-for="(c, i) in candidates" :key="c.name" class="pd-legend-item">
          <span class="pd-legend-dot" :style="{ background: candidateColors[i] }"></span>
          <span>{{ c.name }}</span>
        </div>
      </div>
    </div>

    <!-- 이사회 토론 전문 (접이식) -->
    <details class="pd-debate-outer" v-if="blocks && blocks.length">
      <summary class="pd-debate-summary">💬 이사회 토론 전문 보기</summary>
      <div class="pd-debate-inner">
        <template v-for="(block, i) in blocks" :key="i">
          <div v-if="block.type === 'section'" class="debate-section-label">{{ block.label }}</div>
          <div v-else-if="block.type === 'bubble'" class="debate-bubble">
            <img class="guru-avatar" :src="`/board/${block.board}.png`" :alt="block.board" />
            <div class="bubble-body">
              <div class="bubble-name">{{ block.board }}</div>
              <div class="bubble-text">{{ block.text }}</div>
            </div>
          </div>
          <div v-else-if="block.type === 'exchange'" class="debate-exchange">
            <div class="exchange-tension">⚡ {{ block.tension }}</div>
            <div v-for="(msg, mi) in block.messages" :key="mi" class="exchange-msg">
              <strong>{{ msg.speaker }}</strong>: {{ msg.text }}
            </div>
          </div>
          <div v-else-if="block.type === 'closing'" class="debate-closing">
            <strong>👑 JK</strong>: {{ block.text }}
          </div>
        </template>
      </div>
    </details>

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
    strengths?: string[]
    concerns?: string[]
  }[]
  phaseWinner?: Record<number, string>
  finalDecision: string
  finalComment: string
  blocks?: any[]
}>()

const COLORS = ['#0064FF', '#FF6B35', '#22C55E', '#A855F7', '#F59E0B']
const candidateColors = computed(() => props.candidates.map((_, i) => COLORS[i % COLORS.length]))

const selectedPhase = ref<number | null>(null)
const selectedCandidates = ref<string[]>(props.candidates.map(c => c.name))

function toggleCandidate(name: string) {
  if (selectedCandidates.value.includes(name)) {
    if (selectedCandidates.value.length > 1) {
      selectedCandidates.value = selectedCandidates.value.filter(n => n !== name)
    }
  } else {
    selectedCandidates.value = [...selectedCandidates.value, name]
  }
}

const visibleCandidates = computed(() =>
  props.candidates.filter(c => selectedCandidates.value.includes(c.name))
)

const sortedCandidates = computed(() => {
  const candidates = [...props.candidates]
  if (selectedPhase.value && props.phaseWinner) {
    const winner = props.phaseWinner[selectedPhase.value]
    candidates.sort((a, b) => {
      if (a.name === winner) return -1
      if (b.name === winner) return 1
      return b.readinessScore - a.readinessScore
    })
  } else {
    candidates.sort((a, b) => b.readinessScore - a.readinessScore)
  }
  return candidates
})

function readinessClass(r: string) {
  if (r.includes('Ready Now')) return 'ready-now'
  if (r.includes('2Y')) return 'ready-2y'
  return 'not-ready'
}

// SVG 스파이더 차트
const CX = 150, CY = 150, R = 100

function axisAngle(i: number) {
  return (Math.PI * 2 * i) / props.radarAxes.length - Math.PI / 2
}

function axisPoint(i: number, scale: number) {
  const angle = axisAngle(i)
  return { x: CX + R * scale * Math.cos(angle), y: CY + R * scale * Math.sin(angle) }
}

function gridPolygon(scale: number) {
  return props.radarAxes
    .map((_, i) => `${axisPoint(i, scale).x},${axisPoint(i, scale).y}`)
    .join(' ')
}

function candidatePolygon(c: typeof props.candidates[0]) {
  return props.radarAxes
    .map((axis, i) => {
      const val = (c.radar[axis.key] ?? 0) / 100
      return `${axisPoint(i, val).x},${axisPoint(i, val).y}`
    })
    .join(' ')
}

function labelPoint(i: number) {
  const p = axisPoint(i, 1.25)
  return p
}
</script>
