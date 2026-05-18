<template>
  <div class="board-wrap">

    <!-- ── 뒤로가기 ── -->
    <div class="debate-back-row">
      <a href="/succession/board/" class="debate-back-link">← 이사회 현황</a>
      <a :href="`/succession/debate/${positionSlug}`" class="debate-back-link">← {{ position }} 이사회 기록</a>
    </div>

    <!-- ── 회의록 헤더 ── -->
    <div class="board-minutes">
      <div class="minutes-title">
        <span class="board-icon">🏛️</span>
        <span>승계 이사회 회의록</span>
      </div>

      <table class="minutes-table">
        <tbody>
          <tr>
            <th>회의명</th>
            <td>{{ position }} 후보자 심의</td>
            <th>일시</th>
            <td>{{ date }}</td>
          </tr>
          <tr>
            <th>의장</th>
            <td>JK (CEO · 이사회 의장)</td>
            <th>참석</th>
            <td>에이전트 이사 10인 · 의장 JK</td>
          </tr>
          <tr>
            <th>심의 안건</th>
            <td colspan="3">{{ agenda }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 후보자 스냅샷 -->
      <div class="minutes-data">
        <div class="data-row" v-for="(item, i) in snapshot" :key="i">
          <span class="data-label">{{ item.label }}</span>
          <span class="data-value">{{ item.value }}</span>
        </div>
      </div>

      <!-- 최종 결론 -->
      <div class="minutes-conclusion">
        <div class="conclusion-label">📋 최종 결의</div>
        <div class="conclusion-body">
          <div class="conclusion-stance" :class="readinessClass(finalReadiness)">
            {{ finalReadiness }}
          </div>
          <div class="conclusion-meta">
            준비도 <strong>{{ Math.round(readinessScore * 100) }}%</strong>
            &nbsp;·&nbsp; <strong>{{ dissension }}</strong>
          </div>
        </div>
        <div class="conclusion-rationale">
          <p v-for="(line, i) in rationale" :key="i">{{ line }}</p>
        </div>
        <div v-if="nextReview" class="conclusion-next">
          <span class="next-label">🔁 권고 사항</span>
          <span>{{ nextReview }}</span>
        </div>
      </div>
    </div>

    <!-- ── 토론 채팅 ── -->
    <div class="board-chat-header">💬 이사회 토론 전문</div>

    <template v-for="(block, i) in blocks" :key="i">

      <div v-if="block.type === 'section'" class="debate-section-label">
        {{ block.label }}
      </div>

      <div v-else-if="block.type === 'bubble'" class="debate-bubble">
        <img class="guru-avatar" :src="boardImg(block.board)" :alt="boardName(block.board)"
             :style="{ borderColor: boardColor(block.board) }" />
        <div class="bubble-body">
          <div class="bubble-meta">
            <strong class="guru-name">{{ boardName(block.board) }}</strong>
            <span class="stance-badge" :class="readinessClass(block.stance)">{{ block.stance }}</span>
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
              <img class="guru-avatar sm" src="/board/jk.png" alt="JK"
                   style="border-color: #B45309" />
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
          <img class="guru-avatar" src="/board/jk.png" alt="JK"
               style="border-color: #B45309" />
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
interface SnapshotItem {
  label: string
  value: string
}
interface Message {
  speaker: string
  board?: string
  to?: string
  text: string
}
interface Block {
  type: 'section' | 'bubble' | 'exchange' | 'closing'
  label?: string
  board?: string
  stance?: string
  changed?: 'up' | 'down'
  text?: string
  tension?: string
  messages?: Message[]
}

const props = defineProps<{
  position: string
  positionSlug: string
  date: string
  agenda?: string
  snapshot?: SnapshotItem[]
  finalReadiness: string
  readinessScore: number
  dissension?: string
  rationale?: string[]
  nextReview?: string
  blocks: Block[]
}>()

const BOARD: Record<string, { name: string; color: string }> = {
  'vision-jensen':      { name: 'Vision · Jensen Huang',  color: '#76B900' },
  'scale-bezos':        { name: 'Scale · Jeff Bezos',     color: '#FF9900' },
  'integrity-buffett':  { name: 'Integrity · Buffett',    color: '#2563EB' },
  'principles-dalio':   { name: 'Principles · Dalio',     color: '#475569' },
  'transform-nadella':  { name: 'Transform · Nadella',    color: '#00A4EF' },
  'strategy-thiel':     { name: 'Strategy · Thiel',       color: '#0891B2' },
  'performance-welch':  { name: 'Performance · Welch',    color: '#059669' },
  'inversion-munger': { name: 'Inversion · Munger',   color: '#D97706' },
}

const boardImg   = (b: string) => `/board/${b}.png`
const boardName  = (b: string) => BOARD[b]?.name  ?? b
const boardColor = (b: string) => BOARD[b]?.color ?? '#6B7280'

const isChair = (speaker: string) =>
  speaker === '의장' || speaker === 'JK'

const readinessClass = (s = '') => {
  if (s.includes('Ready Now')   || s.includes('🟢')) return 'ready-now'
  if (s.includes('Ready in 2Y') || s.includes('🟡')) return 'ready-2y'
  if (s.includes('Not Ready')   || s.includes('🔴')) return 'not-ready'
  return ''
}
</script>
